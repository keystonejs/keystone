const mongoose = require('mongoose');
const pSettle = require('p-settle');
const {
  escapeRegExp,
  pick,
  getType,
  mapKeys,
  mapKeyNames,
  identity,
  mergeWhereClause,
  versionGreaterOrEqualTo,
} = require('@keystonejs/utils');

const { BaseKeystoneAdapter, BaseListAdapter, BaseFieldAdapter } = require('@keystonejs/keystone');
const { queryParser, pipelineBuilder, mutationBuilder } = require('@keystonejs/mongo-join-builder');
const logger = require('@keystonejs/logger').logger('mongoose');

const slugify = require('@sindresorhus/slugify');

const debugMongoose = () => !!process.env.DEBUG_MONGOOSE;

class MongooseAdapter extends BaseKeystoneAdapter {
  constructor() {
    super(...arguments);
    this.name = 'mongoose';
    this.mongoose = new mongoose.Mongoose();
    this.minVer = '4.0.0';
    if (debugMongoose()) {
      this.mongoose.set('debug', true);
    }
    this.listAdapterClass = this.listAdapterClass || this.defaultListAdapterClass;
  }

  async _connect({ name }) {
    const { mongoUri, ...mongooseConfig } = this.config;
    // Default to the localhost instance
    let uri =
      mongoUri ||
      process.env.CONNECT_TO ||
      process.env.DATABASE_URL ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URL ||
      process.env.MONGODB_URL ||
      process.env.MONGOLAB_URI ||
      process.env.MONGOLAB_URL;

    if (!uri) {
      const defaultDbName = slugify(name) || 'keystone';
      uri = `mongodb://localhost/${defaultDbName}`;
      logger.warn(`No MongoDB connection URI specified. Defaulting to '${uri}'`);
    }

    await this.mongoose.connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      ...mongooseConfig,
    });
  }
  async postConnect() {
    return await pSettle(
      Object.values(this.listAdapters).map(listAdapter => listAdapter.postConnect())
    );
  }

  disconnect() {
    return this.mongoose.disconnect();
  }

  // This will completely drop the backing database. Use wisely.
  dropDatabase() {
    return this.mongoose.connection.dropDatabase();
  }

  getDefaultPrimaryKeyConfig() {
    // Required here due to circular refs
    const { MongoId } = require('@keystonejs/fields-mongoid');
    return MongoId.primaryKeyDefaults[this.name].getConfig();
  }

  async checkDatabaseVersion() {
    let info;

    try {
      info = await new this.mongoose.mongo.Admin(this.mongoose.connection.db).buildInfo();
    } catch (error) {
      console.log(`Error reading version from MongoDB: ${error}`);
    }

    if (!versionGreaterOrEqualTo(info.versionArray, this.minVer)) {
      throw new Error(
        `MongoDB version ${info.version} is incompatible. Version ${this.minVer} or later is required.`
      );
    }
  }
}

const DEFAULT_MODEL_SCHEMA_OPTIONS = {
  // Later, we run `model.syncIndexes()` to ensure the indexes specified in the
  // mongoose config match what's in the database.
  // `model.syncIndexes()` will fail when the collection is new (ie; hasn't had
  // a write yet / doesn't exist in mongo).
  // By setting `autoCreate` here, mongoose will ensure the collection exists,
  // thus enabling `model.syncIndexes()` to succeed.
  autoCreate: true,

  // Because we're calling `model.syncIndexes()`, we don't want Mongoose to try
  // calling `model.ensureIndexes()` under the hood too soon (it can cause race
  // conditions with trying to access the database before it's properly setup),
  // so we turn that off now.
  autoIndex: false,
};

class MongooseListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter, config) {
    super(...arguments);

    const { configureMongooseSchema, mongooseSchemaOptions } = config;

    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
    this.mongoose = parentAdapter.mongoose;
    this.configureMongooseSchema = configureMongooseSchema;
    this.schema = new parentAdapter.mongoose.Schema(
      {},
      { ...DEFAULT_MODEL_SCHEMA_OPTIONS, ...mongooseSchemaOptions }
    );

    // Need to call postConnect() once all fields have registered and the database is connected to.
    this.model = null;
  }

  prepareFieldAdapter(fieldAdapter) {
    fieldAdapter.addToMongooseSchema(this.schema, this.mongoose);
  }

  /**
   * Note: It's not necessary to await the result of this function - it is only
   * if you want access to the underlying model should you await it. Otherwise,
   * the `.connect()` method of the parent adapter will handle the awaiting.
   *
   * @return Promise<>
   */
  async postConnect() {
    if (this.configureMongooseSchema) {
      this.configureMongooseSchema(this.schema, { mongoose: this.mongoose });
    }

    // 4th param is 'skipInit' which avoids calling `model.init()`.
    // We call model.init() later, after we have a connection up and running to
    // avoid issues with Mongoose's lazy queue and setting up the indexes.
    this.model = this.mongoose.model(this.key, this.schema, null, true);

    // Ensure we wait for any new indexes to be built
    await this.model.init();
    // Then ensure the indexes are all correct
    // The indexes can become out of sync if the database was modified
    // manually, or if the code has been updated. In both cases, the
    // _existence_ of an index (not the configuration) will cause Mongoose
    // to think everything is fine.
    // So, here we must manually force mongoose to check the _configuration_
    // of the existing indexes before moving on.
    // NOTE: Why bother with `model.init()` first? Because Mongoose will
    // always try to create new indexes on model creation in the background,
    // so we have to wait for that async process to finish before trying to
    // sync up indexes.
    // NOTE: There's a potential race condition here when two application
    // instances both try to recreate the indexes by first dropping then
    // creating. See
    // http://thecodebarbarian.com/whats-new-in-mongoose-5-2-syncindexes
    // NOTE: If an index has changed and needs recreating, this can have a
    // performance impact when dealing with large datasets!
    return this.model.syncIndexes();
  }

  _create(data) {
    return this.model.create(data);
  }

  _delete(id) {
    return this.model.findByIdAndRemove(id);
  }

  _update(id, data) {
    // Avoid any kind of injection attack by explicitly doing a `$set` operation
    // Return the modified item, not the original
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  _findAll() {
    return this.model.find();
  }

  _findById(id) {
    return this.model.findById(id);
  }

  _find(condition) {
    return this.model.find(condition);
  }

  _findOne(condition) {
    return this.model.findOne(condition);
  }

  graphQlQueryPathToMongoField(path) {
    const fieldAdapter = this.fieldAdaptersByPath[path];

    if (!fieldAdapter) {
      throw new Error(`Unable to find Mongo field which maps to graphQL path ${path}`);
    }

    return fieldAdapter.getMongoFieldName();
  }

  async _itemsQuery(args, { meta = false, from, include } = {}) {
    if (from && Object.keys(from).length) {
      const ids = await from.fromList.adapter._itemsQuery(
        { where: { id: from.fromId } },
        { include: from.fromField }
      );
      if (ids.length) {
        args = mergeWhereClause(args, { id: { $in: ids[0][from.fromField] || [] } });
      }
    }
    function graphQlQueryToMongoJoinQuery(query) {
      const _query = {
        ...query.where,
        ...mapKeyNames(
          // Grab all the modifiers
          pick(query, ['search', 'orderBy', 'skip', 'first']),
          // and prefix with a dollar symbol so they can be picked out by the
          // query builder tokeniser
          key => `$${key}`
        ),
      };

      return mapKeys(_query, field => {
        if (getType(field) !== 'Object' || !field.where) {
          return field;
        }

        // recurse on object (ie; relationship) types
        return graphQlQueryToMongoJoinQuery(field);
      });
    }

    let query;
    try {
      query = graphQlQueryToMongoJoinQuery(args);
    } catch (error) {
      return Promise.reject(error);
    }

    if (meta) {
      // Order is important here, which is why we do it last (v8 will append the
      // key, and keep them stable)
      query.$count = 'count';
    }

    const queryTree = queryParser({ listAdapter: this }, query, [], include);

    // Run the query against the given database and collection
    return this.model
      .aggregate(pipelineBuilder(queryTree))
      .exec()
      .then(mutationBuilder(queryTree.relationships))
      .then(foundItems => {
        if (meta) {
          // When there are no items, we get undefined back, so we simulate the
          // normal result of 0 items.
          if (!foundItems[0]) {
            return { count: 0 };
          }
          return foundItems[0];
        }
        return foundItems;
      });
  }
}

class MongooseFieldAdapter extends BaseFieldAdapter {
  constructor() {
    super(...arguments);

    // isIndexed is mutually exclusive with isUnique
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;

    // We don't currently have any mongoose-specific options
    // this.mongooseOptions = this.config.mongooseOptions || {};
  }

  addToMongooseSchema() {
    throw new Error(`Field type [${this.fieldName}] does not implement addToMongooseSchema()`);
  }

  buildValidator(validator) {
    return a => validator(a) || typeof a === 'undefined' || a === null;
  }

  mergeSchemaOptions(schemaOptions, { mongooseOptions }) {
    // Applying these config to all field types is probably wrong;
    // ie. unique constraints on Checkboxes, Files, etc. probably don't make sense
    if (this.isUnique) {
      // A value of anything other than `true` causes errors with Mongoose
      // constantly recreating indexes. Ie; if we just splat `unique` onto the
      // options object, it would be `undefined`, which would cause Mongoose to
      // drop and recreate all indexes.
      schemaOptions.unique = true;
    }
    if (this.isIndexed) {
      schemaOptions.index = true;
    }
    return { ...schemaOptions, ...mongooseOptions };
  }

  // The following methods provide helpers for constructing the return values of `getQueryConditions`.
  // Each method takes:
  //   `dbPath`: The database field/column name to be used in the comparison
  //   `f`: (non-string methods only) A value transformation function which converts from a string type
  //        provided by graphQL into a native adapter type.
  equalityConditions(dbPath, f = identity) {
    return {
      [this.path]: value => ({ [dbPath]: { $eq: f(value) } }),
      [`${this.path}_not`]: value => ({ [dbPath]: { $ne: f(value) } }),
    };
  }

  equalityConditionsInsensitive(dbPath, f = identity) {
    return {
      [`${this.path}_i`]: value => ({ [dbPath]: new RegExp(`^${escapeRegExp(f(value))}$`, 'i') }),
      [`${this.path}_not_i`]: value => ({
        [dbPath]: { $not: new RegExp(`^${escapeRegExp(f(value))}$`, 'i') },
      }),
    };
  }

  inConditions(dbPath, f = identity) {
    return {
      [`${this.path}_in`]: value => ({ [dbPath]: { $in: value.map(s => f(s)) } }),
      [`${this.path}_not_in`]: value => ({ [dbPath]: { $not: { $in: value.map(s => f(s)) } } }),
    };
  }

  orderingConditions(dbPath, f = identity) {
    return {
      [`${this.path}_lt`]: value => ({ [dbPath]: { $lt: f(value) } }),
      [`${this.path}_lte`]: value => ({ [dbPath]: { $lte: f(value) } }),
      [`${this.path}_gt`]: value => ({ [dbPath]: { $gt: f(value) } }),
      [`${this.path}_gte`]: value => ({ [dbPath]: { $gte: f(value) } }),
    };
  }

  stringConditions(dbPath, f = identity) {
    return {
      [`${this.path}_contains`]: value => ({
        [dbPath]: { $regex: new RegExp(escapeRegExp(f(value))) },
      }),
      [`${this.path}_not_contains`]: value => ({
        [dbPath]: { $not: new RegExp(escapeRegExp(f(value))) },
      }),
      [`${this.path}_starts_with`]: value => ({
        [dbPath]: { $regex: new RegExp(`^${escapeRegExp(f(value))}`) },
      }),
      [`${this.path}_not_starts_with`]: value => ({
        [dbPath]: { $not: new RegExp(`^${escapeRegExp(f(value))}`) },
      }),
      [`${this.path}_ends_with`]: value => ({
        [dbPath]: { $regex: new RegExp(`${escapeRegExp(f(value))}$`) },
      }),
      [`${this.path}_not_ends_with`]: value => ({
        [dbPath]: { $not: new RegExp(`${escapeRegExp(f(value))}$`) },
      }),
    };
  }

  stringConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    return {
      [`${this.path}_contains_i`]: value => ({ [dbPath]: { $regex: new RegExp(f(value), 'i') } }),
      [`${this.path}_not_contains_i`]: value => ({ [dbPath]: { $not: new RegExp(f(value), 'i') } }),
      [`${this.path}_starts_with_i`]: value => ({
        [dbPath]: { $regex: new RegExp(`^${f(value)}`, 'i') },
      }),
      [`${this.path}_not_starts_with_i`]: value => ({
        [dbPath]: { $not: new RegExp(`^${f(value)}`, 'i') },
      }),
      [`${this.path}_ends_with_i`]: value => ({
        [dbPath]: { $regex: new RegExp(`${f(value)}$`, 'i') },
      }),
      [`${this.path}_not_ends_with_i`]: value => ({
        [dbPath]: { $not: new RegExp(`${f(value)}$`, 'i') },
      }),
    };
  }

  getMongoFieldName() {
    return this.path;
  }
}

MongooseAdapter.defaultListAdapterClass = MongooseListAdapter;

module.exports = {
  MongooseAdapter,
  MongooseListAdapter,
  MongooseFieldAdapter,
};
