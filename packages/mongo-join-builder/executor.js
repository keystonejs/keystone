module.exports = ({ joinQuery, mutator, aggregate }) =>
  aggregate(joinQuery).then(queryResult => mutator(queryResult));
