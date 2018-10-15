const cuid = require('cuid');
const { getType, flatten, objMerge } = require('@voussoir/utils');

// If it's 0 or 1 items, we can use it as-is. Any more needs an $and
const cleanPipeline = pipeline => (pipeline.length > 1 ? [{ $and: pipeline }] : pipeline);

const flattenQueries = parsedQueries => ({
  pipeline: cleanPipeline(flatten(parsedQueries.map(q => q.pipeline)).filter(pipe => pipe)),
  postJoinPipeline: flatten(parsedQueries.map(q => q.postJoinPipeline)).filter(pipe => pipe),
  relationships: objMerge(parsedQueries.map(q => q.relationships)),
});

function parser({ tokenizer, getUID = cuid }, query, pathSoFar = []) {
  if (getType(query) !== 'Object') {
    throw new Error(
      `Expected an Object for query, got ${getType(query)} at path ${pathSoFar.join('.')}`
    );
  }

  const parsedQueries = Object.entries(query).map(([key, value]) => {
    const path = [...pathSoFar, key];
    if (key === 'AND') {
      // An AND query component
      return flattenQueries(
        value.map((_query, index) => parser({ tokenizer, getUID }, _query, [...path, index]))
      );
    } else if (getType(value) === 'Object') {
      // A relationship query component
      const uid = getUID(key);
      const queryAst = tokenizer.relationship(query, key, path, uid);
      if (getType(queryAst) !== 'Object') {
        throw new Error(
          `Must return an Object from 'tokenizer.relationship' function, given ${path.join('.')}`
        );
      }
      return {
        // queryAst.match is our filtering expression. This determines if the
        // parent item is included in the final list
        pipeline: queryAst.match,
        postJoinPipeline: [],
        relationships: { [uid]: { ...queryAst, ...parser({ tokenizer, getUID }, value, path) } },
      };
    } else {
      // A simple field query component
      const queryAst = tokenizer.simple(query, key, path);
      if (getType(queryAst) !== 'Object') {
        throw new Error(
          `Must return an Object from 'tokenizer.simple' function, given ${path.join('.')}`
        );
      }
      return {
        pipeline: queryAst.pipeline || [],
        postJoinPipeline: queryAst.postJoinPipeline || [],
        relationships: {},
      };
    }
  });
  return flattenQueries(parsedQueries);
}

module.exports = { queryParser: parser };
