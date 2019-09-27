const { getRelatedListAdapterFromQueryPath } = require('./relationship-path');

const relationshipTokenizer = ({ listAdapter }) => (query, queryKey, path, uid) => {
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

  const { path } = fieldAdapter;
  const filterType = {
    [path]: 'every',
    [`${path}_every`]: 'every',
    [`${path}_some`]: 'some',
    [`${path}_none`]: 'none',
  }[queryKey];

  return {
    from: fieldAdapter.getRefListAdapter().model.collection.name, // the collection name to join with
    field: path, // The field on this collection
    // A mutation to run on the data post-join. Useful for merging joined
    // data back into the original object.
    // Executed on a depth-first basis for nested relationships.
    postQueryMutation: (parentObj /*, keyOfRelationship, rootObj, pathToParent*/) => {
      return omitBy(
        parentObj,
        /*
        {
          ...parentObj,
          // Given there could be sorting and limiting that's taken place, we
          // want to overwrite the entire object rather than merging found items
          // in.
          [field]: parentObj[keyOfRelationship],
        },
        */
        // Clean up the result to remove the intermediate results
        (_, keyToOmit) => keyToOmit.startsWith(uid)
      );
    },
    // The conditions under which an item from the 'orders' collection is
    // considered a match and included in the end result
    // All the keys on an 'order' are available, plus 3 special keys:
    // 1) <uid>_<field>_every - is `true` when every joined item matches the
    //    query
    // 2) <uid>_<field>_some - is `true` when some joined item matches the
    //    query
    // 3) <uid>_<field>_none - is `true` when none of the joined items match
    //    the query
    matchTerm: { [`${uid}_${path}_${filterType}`]: true },
    // Flag this is a to-many relationship
    many: fieldAdapter.field.many,
  };
};

module.exports = { relationshipTokenizer };
