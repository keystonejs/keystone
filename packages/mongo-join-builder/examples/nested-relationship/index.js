const { queryParser, pipelineBuilder } = require('../../');
const getDatabase = require('../database');

const builder = async (query, aggregate, listAdapter) => {
  const queryTree = queryParser({ listAdapter }, query);
  const pipeline = pipelineBuilder(queryTree);
  // Run the query against the given database and collection
  return await aggregate(pipeline);
};

// Get all unfulfilled orders that have some out of stock items
const query = {
  fulfilled: false,
  items_some: {
    // NOTE: This relation query will filter the items returned to only those
    // that have no stock. ie; the order may have more items in it than the
    // result we get back because we've filtered for only items that have 0
    // stock.
    stock_every: {
      instock: 0,
    },
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
