const { queryParser } = require('./query-parser');
const { pipelineBuilder, mutationBuilder } = require('./join-builder');

const mongoJoinBuilder = ({ tokenizer }) => {
  return async (query, aggregate) => {
    const queryTree = queryParser({ tokenizer }, query);
    // Run the query against the given database and collection
    return await aggregate(pipelineBuilder(queryTree)).then(
      mutationBuilder(queryTree.relationships)
    );
  };
};

module.exports = { mongoJoinBuilder };
