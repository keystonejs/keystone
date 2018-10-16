const { queryParser } = require('./query-parser');
const joinBuilder = require('./join-builder');
const executor = require('./executor');

module.exports = parserOptions => {
  return async (query, aggregate) => {
    const queryTree = queryParser(parserOptions, query);
    const { pipeline, mutator } = joinBuilder(queryTree);
    // Run the query against the given database and collection
    return await executor({ pipeline, mutator, aggregate });
  };
};
