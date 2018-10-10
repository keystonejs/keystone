const mongoose = require('mongoose');
const inflection = require('inflection');
const {
  escapeRegExp,
  pick,
  getType,
  mapKeys,
  mapKeyNames,
  objMerge,
  createLazyDeferred,
} = require('@voussoir/utils');
const {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
} = require('@voussoir/core/adapters');
const joinBuilder = require('@voussoir/mongo-join-builder');
const pSettle = require('p-settle');
const logger = require('@voussoir/logger')('mongoose');

const simpleTokenizer = require('./tokenizers/simple');
const relationshipTokenizer = require('./tokenizers/relationship');
const getRelatedListAdapterFromQueryPathFactory = require('./tokenizers/relationship-path');

const debugMongoose = () => !!process.env.DEBUG_MONGOOSE;

const idQueryConditions = {
  // id is how it looks in the schema
  // _id is how it looks in the MongoDB
  id: value => ({ _id: { $eq: mongoose.Types.ObjectId(value) } }),
  id_not: value => ({ _id: { $ne: mongoose.Types.ObjectId(value) } }),
  id_in: value => ({ _id: { $in: value.map(id => mongoose.Types.ObjectId(id)) } }),
  id_not_in: value => ({ _id: { $not: { $in: value.map(id => mongoose.Types.ObjectId(id)) } } }),
};

const modifierConditions = {
  // TODO: Implement configurable search fields for lists
  $search: value => {
    if (!value || (getType(value) === 'String' && !value.trim())) {
      return undefined;
    }
    return {
      $match: {
        name: new RegExp(`${escapeRegExp(value)}`, 'i'),
      },
    };
  },

  $orderBy: value => {
    const [orderField, orderDirection] = value.split('_');

    return {
      $sort: {
        [orderField]: orderDirection === 'DESC' ? -1 : 1,
      },
    };
  },

  $skip: value => {
    if (value < Infinity && value > 0) {
      return {
        $skip: value,
      };
    }
  },

  $first: value => {
    if (value < Infinity && value > 0) {
      return {
        $limit: value,
      };
    }
  },

  $count: value => ({
    $count: value,
  }),
};

class MongooseAdapter extends BaseKeystoneAdapter {
  constructor() {
    super(...arguments);

    this.name = this.name || 'mongoose';
    this.setupTasks = [];

    this.mongoose = new mongoose.Mongoose();
    if (debugMongoose()) {
      this.mongoose.set('debug', true);
    }
    this.mongoose.set('autoCreate', true);
    this.listAdapterClass = this.listAdapterClass || this.defaultListAdapterClass;
  }

  pushSetupTask(task) {
    this.setupTasks.push(task);
  }

  async connect(to, config = {}) {
    const dbName = config.dbName || inflection.dasherize(config.name).toLowerCase();
    // NOTE: We pull out `name` here, but don't use it, so it
    // doesn't conflict with the options the user wants passed to mongodb.
    const { name: _, ...adapterConnectOptions } = config;

    let uri = to;
    if (!uri) {
      logger.warn('No MongoDB connection specified. Falling back to local instance on port 27017');
      // Default to the localhost instance
      uri = 'mongodb://localhost:27017/';
    }

    try {
      await this.mongoose.connect(
        uri,
        // NOTE: We still pass in the dbName for the case where `to` is set, but
        // doesn't have a name in the uri.
        // For the case where `to` does not have a name, and `dbName` is set, the
        // expected behaviour is for the name to be set to `dbName`.
        // For the case where `to` has a name, and `dbName` is not set, we are
        // forcing the name to be the dasherized of the Keystone name.
        // For the case where both are set, the expected behaviour is for it to be
        // overwritten.
        { useNewUrlParser: true, ...adapterConnectOptions, dbName }
      );
      const taskResults = await pSettle(
        this.setupTasks.map(func => func(this.mongoose.connection))
      );
      const errors = taskResults.filter(({ isRejected }) => isRejected);

      if (errors.length) {
        const error = new Error('Mongoose connection error');
        error.errors = errors.map(({ reason }) => reason);
        throw error;
      }
    } catch (error) {
      // close the database connection if it was opened
      try {
        await this.close();
      } catch (closeError) {
        // Add the inability to close the database connection as an additional
        // error
        error.errors = error.errors || [];
        error.errors.push(closeError);
      }
      // re-throw the error
      throw error;
    }
  }

  close() {
    return new Promise((resolve, reject) => {
      this.mongoose.connection.close(true, error => {
        if (error) {
          return reject(error);
        }
        resolve(this.mongoose.disconnect());
      });
    });
  }

  // This will completely drop the backing database. Use wisely.
  dropDatabase() {
    return this.mongoose.connection.dropDatabase();
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
    this.pushSetupTask = parentAdapter.pushSetupTask.bind(parentAdapter);
    this.mongoose = parentAdapter.mongoose;
    this.configureMongooseSchema = configureMongooseSchema;
    this.schema = new parentAdapter.mongoose.Schema(
      {},
      { ...DEFAULT_MODEL_SCHEMA_OPTIONS, ...mongooseSchemaOptions }
    );

    // Need to call prepareModel() once all fields have registered.
    this.model = null;

    this.queryBuilder = joinBuilder({
      tokenizer: {
        // executed for simple query components (eg; 'fulfilled: false' / name: 'a')
        simple: simpleTokenizer({
          getRelatedListAdapterFromQueryPath: getRelatedListAdapterFromQueryPathFactory(this),
          modifierConditions,
        }),
        // executed for complex query components (eg; items: { ... })
        relationship: relationshipTokenizer({
          getRelatedListAdapterFromQueryPath: getRelatedListAdapterFromQueryPathFactory(this),
        }),
      },
    });
  }

  getFieldAdapterByQueryConditionKey(queryCondition) {
    return this.fieldAdapters.find(adapter => adapter.hasQueryCondition(queryCondition));
  }

  getSimpleQueryConditions() {
    return {
      ...idQueryConditions,
      ...objMerge(this.fieldAdapters.map(fieldAdapter => fieldAdapter.getQueryConditions())),
    };
  }

  getRelationshipQueryConditions() {
    return objMerge(
      this.fieldAdapters.map(fieldAdapter => fieldAdapter.getRelationshipQueryConditions())
    );
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
  prepareModel() {
    if (this.configureMongooseSchema) {
      this.configureMongooseSchema(this.schema, { mongoose: this.mongoose });
    }

    // 4th param is 'skipInit' which avoids calling `model.init()`.
    // We call model.init() later, after we have a connection up and running to
    // avoid issues with Mongoose's lazy queue and setting up the indexes.
    this.model = this.mongoose.model(this.key, this.schema, null, true);

    const deferredIndex = createLazyDeferred();

    // Ensure we wait for any new indexes to be built
    const setupIndexes = () => {
      return this.model
        .init()
        .then(() => {
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
        })
        .then(() => {
          deferredIndex.resolve();
        })
        .catch(error => {
          // Ensure we capture any issues with creating indexes
          logger.error(error);
          deferredIndex.reject(error);
          throw error;
        });
    };
    this.pushSetupTask(setupIndexes);
    return deferredIndex.promise.then(() => this.model);
  }

  create(data) {
    return this.model.create(data);
  }

  delete(id) {
    return this.model.findByIdAndRemove(id);
  }

  update(id, update, options) {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  findAll() {
    return this.model.find();
  }

  findById(id) {
    return this.model.findById(id);
  }

  find(condition) {
    return this.model.find(condition);
  }

  findOne(condition) {
    return this.model.findOne(condition);
  }

  itemsQuery(args, { meta = false } = {}) {
    function graphQlQueryToMongoJoinQuery(query) {
      const joinQuery = {
        ...query.where,
        ...mapKeyNames(
          // Grab all the modifiers
          pick(query || {}, ['search', 'orderBy', 'skip', 'first']),
          // and prefix with a dollar symbol so they can be picked out by the
          // query builder tokeniser
          key => `$${key}`
        ),
      };

      return mapKeys(joinQuery, field => {
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

    return this.queryBuilder(query, pipeline => this.model.aggregate(pipeline).exec()).then(
      data => {
        if (meta) {
          // When there are no items, we get undefined back, so we simulate the
          // normal result of 0 items.
          if (!data[0]) {
            return { count: 0 };
          }
          return data[0];
        }

        return data;
      }
    );
  }

  itemsQueryMeta(args) {
    return this.itemsQuery(args, { meta: true });
  }
}

class MongooseFieldAdapter extends BaseFieldAdapter {
  addToMongooseSchema() {
    throw new Error(`Field type [${this.fieldName}] does not implement addToMongooseSchema()`);
  }

  getQueryConditions() {
    return {};
  }

  getRelationshipQueryConditions() {
    return {};
  }

  getRefListAdapter() {
    return undefined;
  }

  hasQueryCondition() {
    return false;
  }
}

MongooseAdapter.defaultListAdapterClass = MongooseListAdapter;

module.exports = {
  MongooseAdapter,
  MongooseListAdapter,
  MongooseFieldAdapter,
};
