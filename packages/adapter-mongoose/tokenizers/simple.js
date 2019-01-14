const mongoose = require('mongoose');
const { objMerge } = require('@voussoir/utils');

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
  const simpleQueryConditions = {
    // id is how it looks in the schema
    // _id is how it looks in the MongoDB
    id: value => ({ _id: { $eq: mongoose.Types.ObjectId(value) } }),
    id_not: value => ({ _id: { $ne: mongoose.Types.ObjectId(value) } }),
    id_in: value => ({ _id: { $in: value.map(id => mongoose.Types.ObjectId(id)) } }),
    id_not_in: value => ({ _id: { $not: { $in: value.map(id => mongoose.Types.ObjectId(id)) } } }),
    ...objMerge(
      refListAdapter.fieldAdapters.map(fieldAdapter => fieldAdapter.getQueryConditions())
    ),
  };
  if (queryKey in simpleQueryConditions) {
    return { matchTerm: simpleQueryConditions[queryKey](query[queryKey], query) };
  }

  if (queryKey in modifierConditions) {
    return {
      postJoinPipeline: [modifierConditions[queryKey](query[queryKey], query, refListAdapter)],
    };
  }

  // Nothing found, return an empty operation
  // TODO: warn?
  return {};
};
