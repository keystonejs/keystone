const { MongoClient } = require('mongodb');
const MongoDBMemoryServer = require('mongodb-memory-server-core').default;

module.exports = async () => {
  const mongoServer = new MongoDBMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  const mongoConnection = await MongoClient.connect(mongoUri, { useNewUrlParser: true });
  const mongoDb = mongoConnection.db(await mongoServer.getDbName());

  // Only item 2 & 3 have stock. Item 2 only has stock in warehouse A.Item 3 used
  // to have stock in warehouse B, but now only has stock in warehouse A.
  const { insertedIds: insertedStock } = await mongoDb.collection('warehouses').insertMany([
    { warehouse: 'A', instock: 0 },
    { warehouse: 'A', instock: 80 },
    { warehouse: 'B', instock: 0 },
    { warehouse: 'B', instock: 0 },
    { warehouse: 'A', instock: 40 },
  ]);

  // NOTE: insertedStock[x] must be an instance of ObjectID
  const { insertedIds: insertedItems } = await mongoDb.collection('items').insertMany([
    { name: 'almonds', stock: [insertedStock[0], insertedStock[2]] },
    { name: 'pecans', stock: [insertedStock[1]] },
    { name: 'cookies', stock: [insertedStock[3], insertedStock[4]] },
  ]);

  // NOTE: insertedItems[x] must be an instance of ObjectID
  await mongoDb.collection('orders').insertMany([
    { items: [insertedItems[0]], price: 12, ordered: 2, fulfilled: false },
    { items: [insertedItems[1]], price: 20, ordered: 1, fulfilled: false },
    { items: [insertedItems[2], insertedItems[0]], price: 10, ordered: 60, fulfilled: false },
    { items: [insertedItems[0]], price: 10, ordered: 60, fulfilled: true },
  ]);

  return mongoDb;
};
