const { resolveAllKeys } = require('@keystonejs/utils');
const inflection = require('inflection');
const { makeExecutableSchema } = require('graphql-tools');
const { Mongoose } = require('mongoose');

const List = require('../List');
const bindSession = require('./session');

const flatten = arr => Array.prototype.concat(...arr);
const unique = arr => [...new Set(arr)];

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
    const { name } = this.config;
    const lists = this.listsArray.reduce((acc, list) => {
      acc[list.key] = list.getAdminMeta();
      return acc;
    }, {});

    return { lists, name };
  }
  getAdminSchema() {
    let listTypes = flatten(
      this.listsArray.map(list => list.getAdminGraphqlTypes())
    ).map(trim);
    listTypes.push(`
      type _QueryMeta {
        count: Int
      }
      `);

    // Fields can be represented multiple times within and between lists.
    // If a field defines a `getGraphqlAuxiliaryTypes()` method, it will be
    // duplicated.
    // graphql-tools will blow up (rightly so) on duplicated types.
    // Deduping here avoids that problem.
    listTypes = unique(listTypes);

    let queries = unique(
      flatten(this.listsArray.map(list => list.getAdminGraphqlQueries())).map(
        trim
      )
    );
    let mutations = unique(
      flatten(this.listsArray.map(list => list.getAdminGraphqlMutations())).map(
        trim
      )
    );
    const typeDefs = `
      type Query {
        ${queries.join('')}
      }
      type Mutation {
        ${mutations.join('')}
      }
    `;
    if (debugGraphQLSchemas()) {
      console.log(typeDefs);
      listTypes.forEach(i => console.log(i));
    }
    // Like the `listTypes`, we want to dedupe the resolvers. We rely on the
    // semantics of the JS spread operator here (duplicate keys are overridden
    // - first one wins)
    // TODO: Document this order of precendence, becaut it's not obvious, and
    // there's no errors thrown
    // TODO: console.warn when duplicate keys are detected?
    const resolvers = {
      // Order of spreading is important here - we don't want user-defined types
      // to accidentally override important things like `Query`.
      ...this.listsArray.reduce(
        (acc, list) => ({
          ...list.getAuxiliaryTypeResolvers(),
          ...list.getAdminFieldResolvers(),
          ...acc,
        }),
        {}
      ),
      Query: {
        // Order is also important here, any TypeQuery's defined by types
        // shouldn't be able to override list-level queries
        ...this.listsArray.reduce(
          (acc, i) => ({ ...i.getAuxiliaryQueryResolvers(), ...acc }),
          {}
        ),
        ...this.listsArray.reduce(
          (acc, i) => ({ ...i.getAdminQueryResolvers(), ...acc }),
          {}
        ),
      },
      Mutation: {
        ...this.listsArray.reduce(
          (acc, i) => ({ ...i.getAuxiliaryMutationResolvers(), ...acc }),
          {}
        ),
        ...this.listsArray.reduce(
          (acc, i) => ({ ...i.getAdminMutationResolvers(), ...acc }),
          {}
        ),
      },
    };

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
    const asyncCreateItems = listKey => {
      if (!this.getListByKey(listKey)) {
        return Promise.reject(`Cannot create items for unknown list '${listKey}'. Configured lists are: ${Object.keys(this.lists).join(', ')}`);
      }
      return Promise.all(lists[listKey].map(i => this.createItem(listKey, i)));
    }

    return resolveAllKeys(
      Object.keys(lists).reduce(
        (result, listKey) => ({
          [listKey]: asyncCreateItems(listKey),
          ...result,
        }),
        {}
      )
    );
  }
};
