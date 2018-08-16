module.exports = async ({ joinQuery, mutator, aggregate }) => {
  const queryResult = await aggregate(joinQuery);
  return await mutator(queryResult);
};
