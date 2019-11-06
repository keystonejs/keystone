const { objMerge, getType, escapeRegExp } = require('@keystonejs/utils');
const { getRelatedListAdapterFromQueryPath } = require('./relationship-path');

const simpleTokenizer = (listAdapter, query, queryKey, path) => {
  // NOTE: We slice the last path segment off because we're interested in the
  // related list, not the field on the related list. ie, if the path is
  // ['posts', 'comments', 'author', 'name'],
  // the field is 'name', and the related list is the one at
  // ['posts', 'comments', 'author']
  const refListAdapter = getRelatedListAdapterFromQueryPath(listAdapter, path.slice(0, -1));
  const simpleQueryConditions = {
    ...objMerge(
      refListAdapter.fieldAdapters.map(fieldAdapter =>
        fieldAdapter.getQueryConditions(fieldAdapter.dbPath)
      )
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

const modifierConditions = {
  // TODO: Implement configurable search fields for lists
  $search: value => {
    if (!value || (getType(value) === 'String' && !value.trim())) {
      return undefined;
    }
    return {
      $match: {
        name: new RegExp(`${escapeRegExp(value)}`, 'i'),
      },
    };
  },

  $orderBy: (value, _, listAdapter) => {
    const [orderField, orderDirection] = value.split('_');

    const mongoField = listAdapter.graphQlQueryPathToMongoField(orderField);

    return {
      $sort: {
        [mongoField]: orderDirection === 'DESC' ? -1 : 1,
      },
    };
  },

  $skip: value => {
    if (value < Infinity && value > 0) {
      return {
        $skip: value,
      };
    }
  },

  $first: value => {
    if (value < Infinity && value > 0) {
      return {
        $limit: value,
      };
    }
  },

  $count: value => ({
    $count: value,
  }),
};

module.exports = { simpleTokenizer };
