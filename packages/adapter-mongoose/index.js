const {
  Mongoose,
  Types: { ObjectId },
} = require('mongoose');
const inflection = require('inflection');
const { escapeRegExp, pick, getType, mapKeys, mapKeyNames, objMerge } = require('@voussoir/utils');
const {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
} = require('@voussoir/core/adapters');
const joinBuilder = require('@voussoir/mongo-join-builder');
const pReflect = require('p-reflect');

const simpleTokenizer = require('./tokenizers/simple');
const relationshipTokenizer = require('./tokenizers/relationship');
const getRelatedListAdapterFromQueryPathFactory = require('./tokenizers/relationship-path');

const debugMongoose = () => !!process.env.DEBUG_MONGOOSE;

const idQueryConditions = {
  // id is how it looks in the schema
  // _id is how it looks in the MongoDB
  id: value => ({ _id: { $eq: ObjectId(value) } }),
  id_not: value => ({ _id: { $ne: ObjectId(value) } }),
  id_in: value => ({ _id: { $in: value.map(id => ObjectId(id)) } }),
  id_not_in: value => ({ _id: { $not: { $in: value.map(id => ObjectId(id)) } } }),
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

    this.mongoose = new Mongoose();
    if (debugMongoose()) {
      this.mongoose.set('debug', true);
    }
    this.listAdapterClass = this.listAdapterClass || this.defaultListAdapterClass;
  }

  pushSetupTask(task) {
    // We wrap the promise with pReflect so we're handling rejections immediate
    // to avoid node throwing "Unhandled rejected promise" warnings (and
    // potentially killing the process in the future)
    this.setupTasks.push(pReflect(task));
  }

  async connect(to, config = {}) {
    const dbName = config.dbName || inflection.dasherize(config.name).toLowerCase();
    // NOTE: We pull out `name` here, but don't use it, so it
    // doesn't conflict with the options the user wants passed to mongodb.
    const { name: _, ...adapterConnectOptions } = config;

    let uri = to;
    if (!uri) {
      console.warn('No MongoDB connection specified. Falling back to local instance on port 27017');
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
      const taskResults = await Promise.all(this.setupTasks);
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

  async dropDatabase() {
    // This will completely drop the backing database. Use wisely.
    await this.mongoose.connection.dropDatabase();
    // Mongoose doesn't know we called dropDatabase on Mongo directly, so we
    // have to recreate the indexes
    await Promise.all(
      this.mongoose.modelNames().map(modelName => this.mongoose.model(modelName).ensureIndexes())
    );
  }
}

class MongooseListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter, config) {
    super(...arguments);

    const { configureMongooseSchema, mongooseSchemaOptions } = config;

    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
    this.pushSetupTask = parentAdapter.pushSetupTask.bind(parentAdapter);
    this.mongoose = parentAdapter.mongoose;
    this.configureMongooseSchema = configureMongooseSchema;
    this.schema = new parentAdapter.mongoose.Schema({}, mongooseSchemaOptions);

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
    this.model = this.mongoose.model(this.key, this.schema);

    // Ensure we wait for any indexes to be built
    const setupIndexes = this.model.init();
    this.pushSetupTask(setupIndexes);
    return setupIndexes.then(() => this.model);
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
