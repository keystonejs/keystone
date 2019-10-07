const cuid = require('cuid');
const { getType, flatten, objMerge } = require('@keystone-alpha/utils');

const { simpleTokenizer } = require('./tokenizers/simple');
const { relationshipTokenizer } = require('./tokenizers/relationship');

// If it's 0 or 1 items, we can use it as-is. Any more needs an $and/$or
const joinTerms = (matchTerms, joinOp) =>
  matchTerms.length > 1 ? { [joinOp]: matchTerms } : matchTerms[0];

const flattenQueries = (parsedQueries, joinOp) => ({
  matchTerm: joinTerms(parsedQueries.map(q => q.matchTerm).filter(matchTerm => matchTerm), joinOp),
  postJoinPipeline: flatten(parsedQueries.map(q => q.postJoinPipeline)).filter(pipe => pipe),
  relationships: objMerge(parsedQueries.map(q => q.relationships)),
});

function parser({ listAdapter, getUID = cuid }, query, pathSoFar = []) {
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
        value.map((_query, index) => parser({ listAdapter, getUID }, _query, [...path, index])),
        { AND: '$and', OR: '$or' }[key]
      );
    } else if (getType(value) === 'Object') {
      // A relationship query component
      const uid = getUID(key);
      const queryAst = relationshipTokenizer(listAdapter, query, key, path, uid);
      if (getType(queryAst) !== 'Object') {
        throw new Error(
          `Must return an Object from 'relationshipTokenizer' function, given ${path.join('.')}`
        );
      }
      return {
        // queryAst.matchTerm is our filtering expression. This determines if the
        // parent item is included in the final list
        matchTerm: queryAst.matchTerm,
        postJoinPipeline: [],
        relationships: { [uid]: { ...queryAst, ...parser({ listAdapter, getUID }, value, path) } },
      };
    } else {
      // A simple field query component
      const queryAst = simpleTokenizer(listAdapter, query, key, path);
      if (getType(queryAst) !== 'Object') {
        throw new Error(
          `Must return an Object from 'simpleTokenizer' function, given ${path.join('.')}`
        );
      }
      return {
        matchTerm: queryAst.matchTerm,
        postJoinPipeline: queryAst.postJoinPipeline || [],
        relationships: {},
      };
    }
  });
  return flattenQueries(parsedQueries, '$and');
}

module.exports = { queryParser: parser };
