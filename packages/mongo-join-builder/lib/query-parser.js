const cuid = require('cuid');
const { getType, flatten, objMerge } = require('@keystone-alpha/utils');

// If it's 0 or 1 items, we can use it as-is. Any more needs an $and/$or
const joinTerms = (matchTerms, joinOp) =>
  matchTerms.length > 1 ? { [joinOp]: matchTerms } : matchTerms[0];

const flattenQueries = (parsedQueries, joinOp) => ({
  matchTerm: joinTerms(parsedQueries.map(q => q.matchTerm).filter(matchTerm => matchTerm), joinOp),
  postJoinPipeline: flatten(parsedQueries.map(q => q.postJoinPipeline)).filter(pipe => pipe),
  relationships: objMerge(parsedQueries.map(q => q.relationships)),
});

function queryParser({ tokenizer }, query, pathSoFar = []) {
  if (getType(query) !== 'Object') {
    throw new Error(
      `Expected an Object for query, got ${getType(query)} at path ${pathSoFar.join('.')}`
    );
  }

  const parsedQueries = Object.entries(query).map(([key, value]) => {
    const path = [...pathSoFar, key];
    if (['AND', 'OR'].includes(key)) {
      // An AND/OR query component
      return flattenQueries(
        value.map((_query, index) => queryParser({ tokenizer }, _query, [...path, index])),
        { AND: '$and', OR: '$or' }[key]
      );
    } else if (getType(value) === 'Object') {
      // A relationship query component
      const uid = cuid(key);
      const queryAst = tokenizer.relationship(query, key, path, uid);
      const { from, field, postQueryMutation, many, matchTerm } = queryAst;
      // queryAst.matchTerm is our filtering expression. This determines if the
      // parent item is included in the final list
      const recurse = queryParser({ tokenizer }, value, path);
      return {
        matchTerm,
        postJoinPipeline: [],
        relationships: { [uid]: { from, field, postQueryMutation, many, ...recurse } },
      };
    } else {
      // A simple field query component
      const { matchTerm, postJoinPipeline = [] } = tokenizer.simple(query, key, path);
      return { matchTerm, postJoinPipeline, relationships: {} };
    }
  });
  return flattenQueries(parsedQueries, '$and');
}

module.exports = { queryParser };
