module.exports = ({ getRelatedListAdapterFromQueryPath }) => (query, queryKey, path, uid) => {
  // NOTE: We slice the last path segment off because we're interested in the
  // related list, not the field on the related list. ie, if the path is
  // ['posts', 'comments', 'author_some'],
  // the "virtual" field is 'author', and the related list is the one at
  // ['posts', 'comments']
  const refListAdapter = getRelatedListAdapterFromQueryPath(path.slice(0, -1));
  const relationshipQueryConditions = refListAdapter.getRelationshipQueryConditions();

  if (queryKey in relationshipQueryConditions) {
    return relationshipQueryConditions[queryKey](query[queryKey], query, uid);
  }

  // Nothing found, return an empty operation
  // TODO: warn?
  return {};
};
