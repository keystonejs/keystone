const queryParser = require('./query-parser');
const joinBuilder = require('./join-builder');
const executor = require('./executor');

module.exports = (parserOptions) => {
  const parser = queryParser(parserOptions);
  return async (query, aggregate) => {
    const queryTree = parser(query);
    const { joinQuery, mutator } = joinBuilder(queryTree);
    // Run the query against the given database and collection
    return await executor({ joinQuery, mutator, aggregate });
  };
};
