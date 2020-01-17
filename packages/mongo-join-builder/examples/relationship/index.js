const { queryParser, pipelineBuilder } = require('../../');
const getDatabase = require('../database');
const builder = async (query, aggregate, listAdapter) => {
  const queryTree = queryParser({ listAdapter }, query);
  const pipeline = pipelineBuilder(queryTree);
  // Run the query against the given database and collection
  return await aggregate(pipeline);
};

const query = {
  fulfilled: false,
  items: {
    name: 'a',
    stock: {},
  },
};

(async () => {
  const database = await getDatabase();
  const listAdapter = {};
  try {
    const result = await builder(query, getAggregate(database, 'orders'), listAdapter);
    console.log('orders:', prettyPrintResults(result));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  // necessary to kill the in-memory mongodb instance
  process.exit(0);
})();

function prettyPrintResults(result) {
  return require('util').inspect(result, { compact: false, colors: true, depth: null });
}

function getAggregate(database, collection) {
  return pipeline => {
    return new Promise((resolve, reject) => {
      database.collection(collection).aggregate(pipeline, (error, cursor) => {
        if (error) {
          return reject(error);
        }
        return resolve(cursor.toArray());
      });
    });
  };
}
