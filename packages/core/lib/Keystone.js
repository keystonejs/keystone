const { makeExecutableSchema } = require('graphql-tools');

const List = require('./List');

module.exports = class Keystone {
  constructor(stubs) {
    this.stubs = stubs;
    this.lists = {};
    this.listsArray = [];
  }
  createList(key, config) {
    const list = new List(key, config);
    this.lists[key] = list;
    this.listsArray.push(list);
  }
  getAdminMeta() {
    const lists = this.listsArray.reduce((acc, list) => {
      acc[list.key] = list.getAdminMeta();
      return acc;
    }, {});
    return { lists };
  }
  getAdminSchema() {
    const { stubs } = this;
    const listQueries = this.listsArray.map(
      list => `
        ${list.listQueryName}: [${list.key}]
        ${list.itemQueryName}(id: String!): ${list.key}`
    );
    const listTypes = this.listsArray.map(
      list => `
      type ${list.key} {
        id: String
        ${list.fields
          .map(i => `${i.path}: ${i.graphQLType}`)
          .join('\n        ')}
      }
    `
    );
    const typeDefs = `
      type Query {${listQueries.join('')}}
      ${listTypes.join()}
    `;
    const resolvers = {
      Query: this.listsArray.reduce((Query, list) => {
        Query[list.listQueryName] = () => stubs[list.path];
        Query[list.itemQueryName] = (_, { id }) =>
          stubs[list.path].filter(i => i.id === id)[0];
        return Query;
      }, {}),
    };
    return makeExecutableSchema({
      typeDefs,
      resolvers,
    });
  }
};
