const { queryParser } = require('./query-parser');
const joinBuilder = require('./join-builder');

module.exports = parserOptions => {
  return async (query, aggregate) => {
    const queryTree = queryParser(parserOptions, query);
    const { pipeline, postQueryMutations } = joinBuilder(queryTree);
    // Run the query against the given database and collection
    return await aggregate(pipeline).then(postQueryMutations);
  };
};
