module.exports = ({ pipeline, mutator, aggregate }) =>
  aggregate(pipeline).then(queryResult => mutator(queryResult));
