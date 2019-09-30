const { queryParser } = require('./query-parser');
const { pipelineBuilder, mutationBuilder } = require('./join-builder');

module.exports = parserOptions => {
  return async (query, aggregate) => {
    const queryTree = queryParser(parserOptions, query);
    const pipeline = pipelineBuilder(queryTree);
    const postQueryMutations = mutationBuilder(queryTree.relationships);
    // Run the query against the given database and collection
    return await aggregate(pipeline).then(postQueryMutations);
  };
};
