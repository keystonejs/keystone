const mongoose = require('mongoose');

const pSettle = require('p-settle');
const {
  arrayToObject,
  escapeRegExp,
  pick,
  omit,
  getType,
  mapKeys,
  mapKeyNames,
  identity,
  mergeWhereClause,
  resolveAllKeys,
  versionGreaterOrEqualTo,
} = require('@keystonejs/utils');

const { BaseKeystoneAdapter, BaseListAdapter, BaseFieldAdapter } = require('@keystonejs/keystone');
const { pipelineBuilder } = require('./join-builder');
const { queryParser } = require('./query-parser');

const debugMongoose = () => !!process.env.DEBUG_MONGOOSE;

class MongooseAdapter extends BaseKeystoneAdapter {
  constructor() {
    super(...arguments);
    this.listAdapterClass = MongooseListAdapter;
    this.name = 'mongoose';
    this.mongoose = new mongoose.Mongoose();
    this.minVer = '4.0.0';
    if (debugMongoose()) {
      this.mongoose.set('debug', true);
    }
    this._manyModels = {};
  }

  async _connect() {
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
      throw new Error(`No MongoDB connection URI specified.`);
    }

    await this.mongoose.connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      ...mongooseConfig,
    });
  }
  async postConnect({ rels }) {
    // Setup all schemas
    Object.values(this.listAdapters).forEach(listAdapter => {
      listAdapter.fieldAdapters.forEach(fieldAdapter => {
        fieldAdapter.addToMongooseSchema(listAdapter.schema, listAdapter.mongoose, rels);
      });
    });

    // Setup models for N:N tables, I guess?
    for (const rel of rels.filter(({ cardinality }) => cardinality === 'N:N')) {
      await this._createAdjacencyTable(rel);
    }

    // Then...
    return await pSettle(
      Object.values(this.listAdapters).map(listAdapter => listAdapter._postConnect({ rels }))
    );
  }

  async _createAdjacencyTable({ left, tableName, columnNames }) {
    const schema = new this.mongoose.Schema({}, { ...DEFAULT_MODEL_SCHEMA_OPTIONS });

    const columnKey = `${left.listKey}.${left.path}`;
    const leftFkPath = columnNames[columnKey].near;

    const rightFkPath = columnNames[columnKey].far;

    schema.add({ [leftFkPath]: {} });
    schema.add({ [rightFkPath]: {} });
    // 4th param is 'skipInit' which avoids calling `model.init()`.
    // We call model.init() later, after we have a connection up and running to
    // avoid issues with Mongoose's lazy queue and setting up the indexes.
    const model = this.mongoose.model(tableName, schema, null, true);
    this._manyModels[tableName] = model;
    // Ensure we wait for any new indexes to be built
    await model.init();
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
    await model.syncIndexes();
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

    this.rels = undefined;
    this.realKeys = [];
  }

  /**
   * Note: It's not necessary to await the result of this function - it is only
   * if you want access to the underlying model should you await it. Otherwise,
   * the `.connect()` method of the parent adapter will handle the awaiting.
   *
   * @return Promise<>
   */
  async _postConnect({ rels }) {
    this.rels = rels;
    this.fieldAdapters.forEach(fieldAdapter => {
      fieldAdapter.rel = rels.find(
        ({ left, right }) =>
          left.adapter === fieldAdapter || (right && right.adapter === fieldAdapter)
      );
      if (fieldAdapter._hasRealKeys()) {
        this.realKeys.push(
          ...(fieldAdapter.realKeys ? fieldAdapter.realKeys : [fieldAdapter.path])
        );
      }
    });
    if (this.configureMongooseSchema) {
      this.configureMongooseSchema(this.schema, { mongoose: this.mongoose });
    }

    // 4th param is 'skipInit' which avoids calling `model.init()`.
    // We call model.init() later, after we have a connection up and running to
    // avoid issues with Mongoose's lazy queue and setting up the indexes.
    this.model = this.mongoose.model(this.key, this.schema, null, true);
    this.parentAdapter._manyModels[this.key] = this.model;
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

  _getModel(tableName) {
    return this.parentAdapter._manyModels[tableName];
  }

  ////////// Mutations //////////

  async _unsetOneToOneValues(realData) {
    // If there's a 1:1 FK in the real data we need to go and
    // delete it from any other item;
    await Promise.all(
      Object.entries(realData)
        .map(([key, value]) => ({ value, adapter: this.fieldAdaptersByPath[key] }))
        .filter(({ adapter }) => adapter && adapter.isRelationship)
        .filter(
          ({ value, adapter: { rel } }) =>
            rel.cardinality === '1:1' && rel.tableName === this.key && value !== null
        )
        .map(({ value, adapter: { rel: { tableName, columnName } } }) =>
          this._setNullByValue({ tableName, columnName, value })
        )
    );
  }

  async _unsetForeignOneToOneValues(data, id) {
    // If there's a 1:1 FK in the data on a different list we need to go and
    // delete it from any other item;
    await Promise.all(
      Object.keys(data)
        .map(key => ({ adapter: this.fieldAdaptersByPath[key] }))
        .filter(({ adapter }) => adapter && adapter.isRelationship)
        .filter(({ adapter: { rel } }) => rel.cardinality === '1:1' && rel.tableName !== this.key)
        .map(({ adapter: { rel: { tableName, columnName } } }) =>
          this._setNullByValue({ tableName, columnName, value: id })
        )
    );
  }

  async _processNonRealFields(data, processFunction) {
    return resolveAllKeys(
      arrayToObject(
        Object.entries(omit(data, this.realKeys)).map(([path, value]) => ({
          path,
          value,
          adapter: this.fieldAdaptersByPath[path],
        })),
        'path',
        processFunction
      )
    );
  }

  _getNearFar(fieldAdapter) {
    const { rel, path, listAdapter } = fieldAdapter;
    const { columnNames } = rel;
    const columnKey = `${listAdapter.key}.${path}`;
    return columnNames[columnKey];
  }

  async _createSingle(realData) {
    const item = (await this.model.create(realData)).toObject();

    const itemId = item._id;
    return { item, itemId };
  }

  async _setNullByValue({ tableName, columnName, value }) {
    return this._getModel(tableName).updateMany(
      { [columnName]: { $eq: value } },
      { [columnName]: null }
    );
  }

  async _createOrUpdateField({ value, adapter, itemId }) {
    const { cardinality, columnName, tableName } = adapter.rel;
    // N:N - put it in the many table
    // 1:N - put it in the FK col of the other table
    // 1:1 - put it in the FK col of the other table
    if (cardinality === '1:1') {
      if (value !== null) {
        await this._getModel(tableName).updateMany({ _id: value }, { [columnName]: itemId });
        return value;
      } else {
        return null;
      }
    } else {
      const values = value; // Rename this because we have a many situation
      if (values.length) {
        if (cardinality === 'N:N') {
          const { near, far } = this._getNearFar(adapter);
          return (
            await this._getModel(tableName).create(
              values.map(id => ({
                [near]: mongoose.Types.ObjectId(itemId),
                [far]: mongoose.Types.ObjectId(id),
              }))
            )
          ).map(x => x[far]);
        } else {
          await this._getModel(tableName).updateMany(
            { _id: { $in: values } },
            { [columnName]: itemId }
          );
          return values;
        }
      } else {
        return [];
      }
    }
  }

  async _create(data) {
    const realData = pick(data, this.realKeys);

    // Unset any real 1:1 fields
    await this._unsetOneToOneValues(realData);

    // Insert the real data into the table
    const { item, itemId } = await this._createSingle(realData);

    // For every non-real-field, update the corresponding FK/join table.
    const manyItem = await this._processNonRealFields(data, async ({ value, adapter }) =>
      this._createOrUpdateField({ value, adapter, itemId })
    );

    // This currently over-populates the returned item.
    // We should only be populating non-many fields, but the non-real-fields are generally many,
    // which we want to ignore, with the exception of 1:1 fields with the FK on the other table,
    // which we want to actually keep!
    return { ...item, ...manyItem };
  }

  async _update(id, data) {
    const realData = pick(data, this.realKeys);

    // Unset any real 1:1 fields
    await this._unsetOneToOneValues(realData);
    await this._unsetForeignOneToOneValues(data, id);

    // Update the real data
    // Avoid any kind of injection attack by explicitly doing a `$set` operation
    // Return the modified item, not the original
    const item = await this.model.findByIdAndUpdate(
      id,
      { $set: realData },
      { new: true, runValidators: true, context: 'query' }
    );

    // For every many-field, update the many-table
    await this._processNonRealFields(data, async ({ path, value: newValues, adapter }) => {
      const { cardinality, columnName, tableName } = adapter.rel;
      let value;
      // Future task: Is there some way to combine the following three
      // operations into a single query?

      if (cardinality !== '1:1') {
        // Work out what we've currently got
        let matchCol, selectCol;
        if (cardinality === 'N:N') {
          const { near, far } = this._getNearFar(adapter);
          matchCol = near;
          selectCol = far;
        } else {
          matchCol = columnName;
          selectCol = '_id';
        }
        const currentRefIds = (
          await this._getModel(tableName).aggregate([
            { $match: { [matchCol]: mongoose.Types.ObjectId(item.id) } },
          ])
        ).map(x => x[selectCol].toString());

        // Delete what needs to be deleted
        const needsDelete = currentRefIds.filter(x => !newValues.includes(x));
        if (needsDelete.length) {
          if (cardinality === 'N:N') {
            await this._getModel(tableName).deleteMany({
              $and: [
                { [matchCol]: { $eq: item._id } },
                { [selectCol]: { $in: needsDelete.map(id => mongoose.Types.ObjectId(id)) } },
              ],
            });
          } else {
            await this._getModel(tableName).updateMany(
              { [selectCol]: { $in: needsDelete.map(id => mongoose.Types.ObjectId(id)) } },
              { [columnName]: null }
            );
          }
        }
        value = newValues.filter(id => !currentRefIds.includes(id));
      } else {
        // If there are values, update the other side to point to me,
        // otherwise, delete the thing that was pointing to me
        if (newValues === null) {
          const selectCol = columnName === path ? '_id' : columnName;
          await this._setNullByValue({ tableName, columnName: selectCol, value: item.id });
        }
        value = newValues;
      }
      await this._createOrUpdateField({ value, adapter, itemId: item.id });
    });
    return (await this._itemsQuery({ where: { id: item.id }, first: 1 }))[0] || null;
  }

  async _delete(id) {
    id = mongoose.Types.ObjectId(id);
    // Traverse all other lists and remove references to this item
    // We can't just traverse our own fields, because we might have been
    // a silent partner in a relationship, so we have no self-knowledge of it.
    await Promise.all(
      Object.values(this.parentAdapter.listAdapters).map(adapter =>
        Promise.all(
          adapter.fieldAdapters
            .filter(
              a =>
                a.isRelationship &&
                a.refListKey === this.key &&
                this._getModel(a.rel.tableName) !== this.model
            ) // If I (a list adapter) an implicated in the .rel of this field adapter
            .map(fieldAdapter => {
              const { cardinality, columnName, tableName } = fieldAdapter.rel;
              if (cardinality === 'N:N') {
                // FIXME: There is a User <-> User case which isn't captured here.
                const { far } = this._getNearFar(fieldAdapter);
                return this._getModel(tableName).deleteMany({ [far]: { $eq: id } });
              } else {
                return this._setNullByValue({ tableName, columnName, value: id });
              }
            })
        )
      )
    );

    // Now traverse all self-referential relationships and sort them right out.
    await Promise.all(
      this.rels
        .filter(({ tableName, left }) => tableName === this.key && left.listKey === left.refListKey)
        .map(({ columnName, tableName }) =>
          this._setNullByValue({ tableName, columnName, value: id })
        )
    );

    // Delete the actual item
    return this.model.deleteOne({ _id: id }).then(result => result.deletedCount);
  }

  ////////// Queries //////////

  graphQlQueryPathToMongoField(path) {
    const fieldAdapter = this.fieldAdaptersByPath[path];

    if (!fieldAdapter) {
      throw new Error(`Unable to find Mongo field which maps to graphQL path ${path}`);
    }

    return fieldAdapter.getMongoFieldName();
  }

  async _itemsQuery(args, { meta = false, from, include } = {}) {
    if (from && Object.keys(from).length) {
      const { rel } = from.fromList.adapter.fieldAdaptersByPath[from.fromField];
      const { cardinality, tableName, columnName, columnNames } = rel;
      let ids = [];
      if (cardinality === 'N:N') {
        const a = from.fromList.adapter.fieldAdaptersByPath[from.fromField];
        const columnKey = `${from.fromList.adapter.key}.${a.path}`;
        ids = await this._getModel(tableName).aggregate([
          {
            $match: {
              [columnNames[columnKey].near]: { $eq: mongoose.Types.ObjectId(from.fromId) },
            },
          },
        ]);
        ids = ids.map(x => x[columnNames[columnKey].far]);
      } else {
        ids = await this._getModel(tableName).aggregate([
          { $match: { [columnName]: mongoose.Types.ObjectId(from.fromId) } },
        ]);
        ids = ids.map(x => x._id);
      }

      args = mergeWhereClause(args, { id: { $in: ids || [] } });
    }
    // Convert the args `where` clauses and modifiers into a data structure
    // which can be consumed by the queryParser. Modifiers are prefixed with a
    // $ symbol (e.g. skip => $skip) to be identified by the tokenizer.
    // `where` keys are removed, and nested queries are handled recursively.
    // { where: { a: 'A', b: { where: { c: 'C' } } }, skip: 10 }
    //       => { a: 'A', b: { c: 'C' }, $skip: 10 }
    const graphQlQueryToMongoJoinQuery = ({ where, ...modifiers }) => ({
      ...mapKeys(where || {}, whereElement =>
        getType(whereElement) === 'Object' && whereElement.where
          ? graphQlQueryToMongoJoinQuery(whereElement) // Recursively traverse relationship fields
          : whereElement
      ),
      ...mapKeyNames(
        pick(modifiers, ['search', 'sortBy', 'orderBy', 'skip', 'first']),
        key => `$${key}`
      ),
    });
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

    // 1:1 relationship magic
    const lookups = [];
    this.fieldAdapters
      .filter(a => a.isRelationship && a.rel.cardinality === '1:1' && a.rel.right === a.field)
      .forEach(a => {
        const { tableName, columnName } = a.rel;
        const tmpName = `__${a.path}`;
        lookups.push(
          {
            $lookup: {
              from: this._getModel(tableName).collection.name,
              as: tmpName,
              localField: '_id',
              foreignField: columnName,
            },
          },
          { $unwind: { path: `$${tmpName}`, preserveNullAndEmptyArrays: true } },
          { $addFields: { [a.path]: `$${tmpName}._id` } },
          { $project: { [tmpName]: 0 } }
        );
      });
    // Run the query against the given database and collection
    const pipeline = pipelineBuilder(queryTree);
    const ret = await this.model
      .aggregate([...pipeline, ...lookups])
      .exec()
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
    return ret;
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

  _hasRealKeys() {
    // We don't have a "real key" (i.e. a column in the table) if:
    //  * We're a N:N
    //  * We're the right hand side of a 1:1
    //  * We're the 1 side of a 1:N or N:1 (e.g we are the one with config: many)
    return !(
      this.isRelationship &&
      (this.config.many || (this.rel.cardinality === '1:1' && this.rel.right.adapter === this))
    );
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

module.exports = {
  MongooseAdapter,
  MongooseListAdapter,
  MongooseFieldAdapter,
};
