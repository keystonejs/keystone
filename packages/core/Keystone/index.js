const inflection = require('inflection');
const { makeExecutableSchema } = require('graphql-tools');
const { Mongoose } = require('mongoose');

const List = require('../List');
const bindSession = require('./session');

const flatten = (arr) => Array.prototype.concat(...arr);
const unique = (arr) => [...new Set(arr)];

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
const debugMongoose = () => !!process.env.DEBUG_MONGOOSE;
const trim = str => str.replace(/\n\s*\n/g, '\n');

module.exports = class Keystone {
  constructor(config) {
    this.config = config;
    this.auth = {};
    this.lists = {};
    this.listsArray = [];
    this.getListByKey = key => this.lists[key];
    this.session = bindSession(this);

    this.mongoose = new Mongoose();
    if (debugMongoose()) {
      this.mongoose.set('debug', true);
    }
  }
  createAuthStrategy(options) {
    const { type: StrategyType, list: listKey, config } = options;
    const { authType } = StrategyType;
    if (!this.auth[listKey]) {
      this.auth[listKey] = {};
    }
    const strategy = new StrategyType(this, listKey, config);
    this.auth[listKey][authType] = strategy;
    return strategy;
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
    let listTypes = flatten(this.listsArray.map(list => list.getAdminGraphqlTypes())).map(trim);
    listTypes.push(`
      type _QueryMeta {
        count: Int
      }
      `);

    // Fields can be represented multiple times within and between lists.
    // If a field defines a `getGraphqlTypes()` method, it will be duplicated.
    // graphql-tools will blow up (rightly so) on duplicated types.
    // Deduping here avoids that problem.
    listTypes = unique(listTypes);
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
    const resolvers = this.listsArray.reduce(
      // Like the `listTypes`, we want to dedupe the resolvers. We rely on the
      // semantics of the JS spread operator here (duplicate keys are overridden
      // - last one wins)
      (acc, list) => ({ ...acc, ...list.getAdminFieldResolvers() }),
      {
        Query: this.listsArray.reduce(
          (acc, i) => ({ ...acc, ...i.getAdminQueryResolvers() }),
          {}
        ),
        Mutation: this.listsArray.reduce(
          (acc, i) => ({ ...acc, ...i.getAdminMutationResolvers() }),
          {}
        ),
      }
    );

    if (debugGraphQLSchemas()) {
      console.log(resolvers);
    }

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
    // TODO: Needs to handle creating related items; see Keystone 4 for a
    // reference implementation

    // Return a promise that resolves to an array of the created items
    const asyncCreateItems = listKey =>
      Promise.all(lists[listKey].map(i => this.createItem(listKey, i)));

    // We're going to have to wait for a set of unrelated promises to fullfil
    // before we can return from this method
    const promisesToWaitFor = [];

    // We'll reduce the async values to this object over time
    const createdItems = {};

    Object.keys(lists).forEach(key => {
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
