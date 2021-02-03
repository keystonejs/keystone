const cuid = require('cuid');
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
    const fieldAdapter = foundListAdapter.fieldAdapters
      .filter(adapter => adapter.isRelationship)
      .find(({ path }) =>
        [path, `${path}_every`, `${path}_some`, `${path}_none`].includes(segment)
      );

    if (!fieldAdapter) {
      // prettier-ignore
      throw new Error(
          `'${listAdapter.key}' Mongo List Adapter failed to determine field responsible for the`
          + ` query condition '${segment}'. '${segment}' was seen by following the query`
          + ` '${queryPath.slice(0, index + 1).join(' > ')}'.`
        );
    }

    // Then follow the breadcrumbs to find the list adapter
    const currentKey = foundListAdapter.key;
    foundListAdapter = fieldAdapter.getListByKey(fieldAdapter.refListKey).adapter;

    if (!foundListAdapter) {
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

const relationshipTokenizer = (listAdapter, queryKey, path, getUID = cuid) => {
  const refListAdapter = getRelatedListAdapterFromQueryPath(listAdapter, path);
  const fieldAdapter = refListAdapter.fieldAdapters
    .filter(adapter => adapter.isRelationship)
    .find(({ path }) => [path, `${path}_every`, `${path}_some`, `${path}_none`].includes(queryKey));

  // Nothing found, return an empty operation
  // TODO: warn?
  if (!fieldAdapter) return {};
  const filterType = {
    [fieldAdapter.path]: 'only',
    [`${fieldAdapter.path}_every`]: 'every',
    [`${fieldAdapter.path}_some`]: 'some',
    [`${fieldAdapter.path}_none`]: 'none',
  }[queryKey];
  const refListAdapter2 = fieldAdapter.getListByKey(fieldAdapter.refListKey).adapter;
  const { rel } = fieldAdapter;
  const uniqueField = `${getUID(queryKey)}_${fieldAdapter.path}`;
  const fieldSize = { $size: `$${uniqueField}` };
  const expr = {
    only: { $eq: [fieldSize, 1] },
    every: { $eq: [fieldSize, { $size: `$${uniqueField}_all` }] },
    none: { $eq: [fieldSize, 0] },
    some: { $gt: [fieldSize, 0] },
  }[filterType];

  return {
    matchTerm: { $expr: expr },
    relationshipInfo: {
      from:
        rel.cardinality === 'N:N'
          ? refListAdapter2._getModel(rel.tableName).collection.name
          : refListAdapter2.model.collection.name, // the collection name to join with
      thisTable: refListAdapter.key,
      path: fieldAdapter.path,
      rel,
      filterType,
      uniqueField,
      // N:N only
      farCollection: refListAdapter2.model.collection.name,
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
    $sortBy: (value, _, listAdapter) => {
      const res = {};
      value.map(s => {
        const [orderField, orderDirection] = s.split('_');
        const mongoField = listAdapter.graphQlQueryPathToMongoField(orderField);

        res[mongoField] = orderDirection === 'DESC' ? -1 : 1;
      });

      return { $sort: res };
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
