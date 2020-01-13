const { objMerge, getType, escapeRegExp } = require('@keystonejs/utils');

const getRelatedListAdapterFromQueryPath = (listAdapter, queryPath) => {
  if (!listAdapter) {
    throw new Error('Must provide a list adapter instance');
  }

  let foundListAdapter = listAdapter;

  // NOTE: We slice the last path segment off because we're interested in the
  // related list, not the field on the related list. ie, if the path is
  // ['posts', 'comments', 'author_some'],
  // the "virtual" field is 'author', and the related list is the one at
  // ['posts', 'comments']
  queryPath = queryPath.slice(0, -1);
  for (let index = 0; index < queryPath.length; index++) {
    const segment = queryPath[index];
    if (segment === 'AND' || segment === 'OR') {
      // skip over the next item which is an index
      index += 1;
      // And ignore this AND/OR
      continue;
    }

    // Eg; search for which field adapter handles `posts_some`, and return that one
    const fieldAdapter = foundListAdapter.findFieldAdapterForQuerySegment(segment);

    if (!fieldAdapter) {
      // Prettier, you're testing me. Please stop.
      // prettier-ignore
      throw new Error(
          `'${listAdapter.key}' Mongo List Adapter failed to determine field responsible for the`
          + ` query condition '${segment}'. '${segment}' was seen by following the query`
          + ` '${queryPath.slice(0, index + 1).join(' > ')}'.`
        );
    }

    // Then follow the breadcrumbs to find the list adapter
    const currentKey = foundListAdapter.key;
    foundListAdapter = fieldAdapter.getRefListAdapter();

    if (!foundListAdapter) {
      // Seriously, though, Prettier. Don't.
      // prettier-ignore
      throw new Error(
          `'${currentKey}' Mongo List Adapter doesn't have a related list.`
          + ` Are you attempting to do a relationship query on a non-relationship field?`
          + ` '${currentKey}' was found by following the query`
          + ` '${queryPath.slice(0, index + 1).join(' > ')}'.`
        );
    }
  }
  return foundListAdapter;
};

const relationshipTokenizer = (listAdapter, query, queryKey, path, uid) => {
  const refListAdapter = getRelatedListAdapterFromQueryPath(listAdapter, path);
  const fieldAdapter = refListAdapter.findFieldAdapterForQuerySegment(queryKey);

  // Nothing found, return an empty operation
  // TODO: warn?
  if (!fieldAdapter) return {};
  const filterType = {
    [fieldAdapter.path]: 'every',
    [`${fieldAdapter.path}_every`]: 'every',
    [`${fieldAdapter.path}_some`]: 'some',
    [`${fieldAdapter.path}_none`]: 'none',
  }[queryKey];

  return {
    // The conditions under which an item from the 'orders' collection is
    // considered a match and included in the end result
    // All the keys on an 'order' are available, plus 3 special keys:
    // 1) <uid>_<field>_every - is `true` when every joined item matches the
    //    query
    // 2) <uid>_<field>_some - is `true` when some joined item matches the
    //    query
    // 3) <uid>_<field>_none - is `true` when none of the joined items match
    //    the query
    matchTerm: { [`${uid}_${fieldAdapter.path}_${filterType}`]: true },
    relationshipInfo: {
      from: fieldAdapter.getRefListAdapter().model.collection.name, // the collection name to join with
      field: fieldAdapter.path, // The field on this collection
      many: fieldAdapter.field.many, // Flag this is a to-many relationship
    },
  };
};

const simpleTokenizer = (listAdapter, query, queryKey, path) => {
  const refListAdapter = getRelatedListAdapterFromQueryPath(listAdapter, path);
  const simpleQueryConditions = objMerge(
    refListAdapter.fieldAdapters.map(a => a.getQueryConditions(a.dbPath))
  );
  if (queryKey in simpleQueryConditions) {
    return simpleQueryConditions[queryKey](query[queryKey], query);
  }
};

const modifierTokenizer = (listAdapter, query, queryKey, path) => {
  const refListAdapter = getRelatedListAdapterFromQueryPath(listAdapter, path);
  return {
    // TODO: Implement configurable search fields for lists
    $search: value => {
      if (!value || (getType(value) === 'String' && !value.trim())) {
        return undefined;
      }
      return { $match: { name: new RegExp(`${escapeRegExp(value)}`, 'i') } };
    },
    $orderBy: (value, _, listAdapter) => {
      const [orderField, orderDirection] = value.split('_');

      const mongoField = listAdapter.graphQlQueryPathToMongoField(orderField);

      return { $sort: { [mongoField]: orderDirection === 'DESC' ? -1 : 1 } };
    },
    $skip: value => {
      if (value < Infinity && value > 0) {
        return { $skip: value };
      }
    },
    $first: value => {
      if (value < Infinity && value > 0) {
        return { $limit: value };
      }
    },
    $count: value => ({ $count: value }),
  }[queryKey](query[queryKey], query, refListAdapter);
};

module.exports = {
  simpleTokenizer,
  relationshipTokenizer,
  modifierTokenizer,
  getRelatedListAdapterFromQueryPath,
};
