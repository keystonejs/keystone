// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
const mongoose = require('mongoose');

const appConfig = require('../../config');

module.exports = async (on, config) => {
  // Make env vars available to cypress tests via `Cypress.env()`
  config.env = process.env;

  config.baseUrl = `http://localhost:${appConfig.port}`;

  const mongooseInstance = new mongoose.Mongoose();
  await mongooseInstance.connect('mongodb://localhost/cypress-test-project', {
    useNewUrlParser: true,
  });

  const dbConnection = mongooseInstance.connection.db;

  on('task', {
    mongoFind: ({ collection, query }) => {
      const mongoQuery = dbConnection.collection(collection).find(query);
      return new Promise((resolve, reject) =>
        mongoQuery.toArray((error, items) => {
          if (error) {
            return reject(error);
          }
          resolve(items.map(item => Object.assign({}, item, { id: item._id })));
        })
      );
    },

    mongoInsertOne: ({ collection, document }) =>
      dbConnection
        .collection(collection)
        .insertOne(document)
        .then(({ insertedId }) => ({ id: insertedId })),
  });

  return config;
};
