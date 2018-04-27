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

module.exports = class Keystone {
  constructor(config) {
    this.config = config;
    this.lists = {};
    this.listsArray = [];
    this.mongoose = new Mongoose();
  }
  createList(key, config) {
    const { mongoose, lists } = this;
    const list = new List(key, config, { mongoose, lists });
    this.lists[key] = list;
    this.listsArray.push(list);
  }
  connect(to, options) {
    const {
      mongoose,
      config: { name, dbName, mongodbConnectionOptions },
    } = this;
    const uri = to || getMongoURI({ name, dbName });
    return mongoose.connect(uri, { ...mongodbConnectionOptions, ...options });
  }
  getAdminMeta() {
    const lists = this.listsArray.reduce((acc, list) => {
      acc[list.key] = list.getAdminMeta();
      return acc;
    }, {});
    return { lists };
  }
  getAdminSchema() {
    const listTypes = this.listsArray.map(i => i.getAdminGraphqlTypes());
    const typeDefs = `
      type Query {
        ${this.listsArray.map(i => i.getAdminGraphqlQueries()).join('')}
      }
      type Mutation {
        ${this.listsArray.map(i => i.getAdminGraphqlMutations()).join('')}
      }
    `;
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
