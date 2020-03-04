const { CustomProvider } = require('./custom');
const { ListAuthProvider } = require('./listAuth');
const { ListCRUDProvider } = require('./listCRUD');
const { VersionProvider } = require('./version');

// The GraphQL Provider Framework expects to see classes with the following API:
//
// class Provider {
//   constructor() {}
//
//   getTypes({ schemaName }) {
//     return [];
//   }
//   getQueries({ schemaName }) {
//     return [];
//   }
//   getMutations({ schemaName }) {
//     return [];
//   }
//
//   getTypeResolvers({ schemaName }) {
//     return {};
//   }
//   getQueryResolvers({ schemaName }) {
//     return {};
//   }
//   getMutationResolvers({ schemaName }) {
//     return {};
//   }
// }

module.exports = { CustomProvider, ListAuthProvider, ListCRUDProvider, VersionProvider };
