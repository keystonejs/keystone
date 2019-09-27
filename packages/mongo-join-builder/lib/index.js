const { queryParser } = require('./query-parser');
const joinBuilder = require('./join-builder');

const mongoJoinBuilder = ({ tokenizer }) => {
  return async (query, aggregate) => {
    const queryTree = queryParser({ tokenizer }, query);
    const { pipeline, postQueryMutations } = joinBuilder(queryTree);
    // Run the query against the given database and collection
    return await aggregate(pipeline).then(postQueryMutations);
  };
};

module.exports = { mongoJoinBuilder };
