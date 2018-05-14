const inflection = require('inflection');
const { makeExecutableSchema } = require('graphql-tools');
const { Mongoose } = require('mongoose');

const List = require('../List');

function getMongoURI({ dbName, name }) {
  return (
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    `mongodb://localhost/${dbName || inflection.dasherize(name).toLowerCase()}`
  );
}

const debugGraphQLSchemas = () => !!process.env.DEBUG_GRAPHQL_SCHEMAS;
const trim = str => str.replace(/\n\s*\n/g, '\n');

module.exports = class Keystone {
  constructor(config) {
    this.config = config;
    this.lists = {};
    this.listsArray = [];
    this.mongoose = new Mongoose();
    this.getListByKey = key => this.lists[key];
  }
  createList(key, config) {
    const { getListByKey, mongoose } = this;
    const list = new List(key, config, { getListByKey, mongoose });
    this.lists[key] = list;
    this.listsArray.push(list);
  }
  connect(to, options) {
    const {
      mongoose,
      config: { name, dbName, mongodbConnectionOptions },
    } = this;
    const uri = to || getMongoURI({ name, dbName });
    mongoose.connect(uri, { ...mongodbConnectionOptions, ...options });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Mongoose connection error'));
    db.once('open', () => console.log('Connection success'));
  }
  getAdminMeta() {
    const lists = this.listsArray.reduce((acc, list) => {
      acc[list.key] = list.getAdminMeta();
      return acc;
    }, {});
    return { lists };
  }
  getAdminSchema() {
    const listTypes = this.listsArray.map(i => trim(i.getAdminGraphqlTypes()));
    listTypes.push(`
      type _QueryMeta {
        count: Int
      }
      `);
    const typeDefs = `
      type Query {
        ${this.listsArray.map(i => i.getAdminGraphqlQueries()).join('')}
      }
      type Mutation {
        ${this.listsArray.map(i => i.getAdminGraphqlMutations()).join('')}
      }
    `;
    if (debugGraphQLSchemas()) {
      console.log(typeDefs);
      listTypes.forEach(i => console.log(i));
    }
    const resolvers = {
      Query: this.listsArray.reduce(
        (acc, i) => ({ ...acc, ...i.getAdminQueryResolvers() }),
        {}
      ),
      Mutation: this.listsArray.reduce(
        (acc, i) => ({ ...acc, ...i.getAdminMutationResolvers() }),
        {}
      ),
    };

    return makeExecutableSchema({
      typeDefs: [...listTypes, typeDefs],
      resolvers,
    });
  }
  createItems(lists) {
    Object.keys(lists).forEach(key => {
      const list = this.lists[key];
      lists[key].forEach(itemData => {
        const item = new list.model(itemData);
        item.save();
      });
    });
  }
};
