const { getRelatedListAdapterFromQueryPath } = require('./relationship-path');

const relationshipTokenizer = (listAdapter, query, queryKey, path, uid) => {
  // NOTE: We slice the last path segment off because we're interested in the
  // related list, not the field on the related list. ie, if the path is
  // ['posts', 'comments', 'author_some'],
  // the "virtual" field is 'author', and the related list is the one at
  // ['posts', 'comments']
  const refListAdapter = getRelatedListAdapterFromQueryPath(listAdapter, path.slice(0, -1));
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
    from: fieldAdapter.getRefListAdapter().model.collection.name, // the collection name to join with
    field: fieldAdapter.path, // The field on this collection
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
    // Flag this is a to-many relationship
    many: fieldAdapter.field.many,
  };
};

module.exports = { relationshipTokenizer };
