module.exports = ({ getRelatedListAdapterFromQueryPath, modifierConditions = {} } = {}) => (
  query,
  queryKey,
  path
) => {
  // NOTE: We slice the last path segment off because we're interested in the
  // related list, not the field on the related list. ie, if the path is
  // ['posts', 'comments', 'author', 'name'],
  // the field is 'name', and the related list is the one at
  // ['posts', 'comments', 'author']
  const refListAdapter = getRelatedListAdapterFromQueryPath(path.slice(0, -1));
  const simpleQueryConditions = refListAdapter.getSimpleQueryConditions();

  if (queryKey in simpleQueryConditions) {
    return {
      pipeline: [simpleQueryConditions[queryKey](query[queryKey], query)],
    };
  }

  if (queryKey in modifierConditions) {
    return {
      postJoinPipeline: [modifierConditions[queryKey](query[queryKey], query)],
    };
  }

  // Nothing found, return an empty operation
  // TODO: warn?
  return {};
};
