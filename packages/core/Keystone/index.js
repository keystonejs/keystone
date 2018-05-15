const inflection = require('inflection');
const { makeExecutableSchema } = require('graphql-tools');
const { Mongoose } = require('mongoose');

const List = require('../List');
const bindSession = require('./session');

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
    this.auth = {};
    this.lists = {};
    this.listsArray = [];
    this.mongoose = new Mongoose();
    this.getListByKey = key => this.lists[key];
    this.session = bindSession(this);

    if (this.config.debug) {
      this.mongoose.set('debug', true);
    }
  }
  createAuthStrategy(options) {
    const { type: StrategyType, list: listKey, config } = options;
    const { authType } = StrategyType;
    if (!this.auth[listKey]) {
      this.auth[listKey] = {};
    }
    this.auth[listKey][authType] = new StrategyType(this, listKey, config);
    return this.auth[listKey][authType];
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
  createItem(listKey, itemData) {
    const item = new this.lists[listKey].model(itemData);
    return item.save();
  }
  createItems(lists) {
    // Return a promise that resolves to an array of the created items
    const asyncCreateItems = (key) => {
      const list = this.lists[key];
      return Promise.all(lists[key].map(itemData => {
        const item = new list.model(itemData);
        return item.save();
      }));
    };

    // We're going to have to wait for a set of unrelated promises to fullfil
    // before we can return from this method
    const promisesToWaitFor = [];

    // We'll reduce the async values to this object over time
    const createdItems = {};

    Object.keys(lists).forEach((key) => {
      const listItems = asyncCreateItems(key);

      // Add the promise to the global set to wait for
      promisesToWaitFor.push(listItems);

      // When it resolves, we want to set the values on the result object
      listItems.then(newItems => {
        createdItems[key] = newItems;
      });
    });

    // Wait for all promises to complete.
    // Then resolve to the object containing the resolved arrays of values
    return Promise.all(promisesToWaitFor).then(() => createdItems);
  }
};
