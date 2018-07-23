const {
  Mongoose,
  Types: { ObjectId },
} = require('mongoose');
const inflection = require('inflection');
const { escapeRegExp } = require('@keystonejs/utils');
const {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
} = require('@keystonejs/core/adapters');

const debugMongoose = () => !!process.env.DEBUG_MONGOOSE;

function getMongoURI({ dbName, name }) {
  return (
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    `mongodb://localhost/${dbName || inflection.dasherize(name).toLowerCase()}`
  );
}

function getIdQueryConditions(args) {
  const conditions = [];
  if (!args) {
    return conditions;
  }
  // id is how it looks in the schema
  if ('id' in args) {
    // _id is how it looks in the MongoDB
    conditions.push({ _id: { $eq: ObjectId(args.id) } });
  }
  // id is how it looks in the schema
  if ('id_not' in args) {
    // _id is how it looks in the MongoDB
    conditions.push({ _id: { $ne: ObjectId(args.id_not) } });
  }
  return conditions;
}

class MongooseAdapter extends BaseKeystoneAdapter {
  constructor() {
    super(...arguments);

    this.name = this.name || 'mongoose';

    this.mongoose = new Mongoose();
    if (debugMongoose()) {
      this.mongoose.set('debug', true);
    }
    this.listAdapterClass =
      this.listAdapterClass || this.defaultListAdapterClass;
  }

  connect(to, config) {
    const { name, dbName, ...adapterConnectOptions } = config;
    const uri = to || getMongoURI({ name, dbName });
    this.mongoose.connect(
      uri,
      { ...adapterConnectOptions }
    );
    const db = this.mongoose.connection;
    db.on('error', console.error.bind(console, 'Mongoose connection error'));
    db.once('open', () => console.log('Connection success'));
  }

  close() {
    return this.mongoose.connection.close();
  }

  dropDatabase() {
    // This will completely drop the backing database. Use wisely.
    return this.mongoose.connection.dropDatabase();
  }
}

class MongooseListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter, config) {
    super(...arguments);

    const { mongoose } = parentAdapter;
    const { configureMongooseSchema, mongooseSchemaOptions } = config;

    this.mongoose = mongoose;
    this.configureMongooseSchema = configureMongooseSchema;
    this.schema = new mongoose.Schema({}, mongooseSchemaOptions);

    // Need to call prepareModel() once all fields have registered.
    this.model = null;
  }

  prepareFieldAdapter(fieldAdapter) {
    fieldAdapter.addToMongooseSchema(this.schema, this.mongoose);
  }

  prepareModel() {
    if (this.configureMongooseSchema) {
      this.configureMongooseSchema(this.schema, { mongoose: this.mongoose });
    }
    this.model = this.mongoose.model(this.key, this.schema);
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

  itemsQueryConditions(args, depthGuard = 0) {
    if (!args) {
      return [];
    }

    // TODO: can depthGuard be an instance variable, to track the recursion
    // depth instead of passing it through to the individual fields and back
    // again?
    if (depthGuard > 1) {
      throw new Error(
        'Nesting where args deeper than 1 level is not currently supported'
      );
    }

    return this.fieldAdapters.reduce(
      (conds, fieldAdapater) => {
        const fieldConditions = fieldAdapater.getQueryConditions(
          args,
          this,
          depthGuard + 1
        );

        if (fieldConditions && !Array.isArray(fieldConditions)) {
          console.warn(
            `${this.key}.${fieldAdapater.path} (${
              fieldAdapater.fieldName
            }) returned a non-array for .getQueryConditions(). This is probably a mistake. Ignoring.`
          );
          return conds;
        }

        // Nothing to do
        if (!fieldConditions || !fieldConditions.length) {
          return conds;
        }

        return [
          ...conds,
          ...fieldConditions.map(condition => {
            if (condition && condition.$isComplexStage) {
              return condition;
            }
            return { [fieldAdapater.path]: condition };
          }),
        ];
      },
      // Special case for `_id` where it presents as `id` in the graphQL schema,
      // and isn't a field type
      getIdQueryConditions(args)
    );
  }
  itemsQuery(args, { meta = false } = {}) {
    const conditions = this.itemsQueryConditions(args.where);

    const pipeline = [];
    const postAggregateMutation = [];

    // TODO: Order isn't important. Might as well put all the simple `$match`s
    // first, and complex ones last.
    // TODO: Change this to a `for...of` loop
    let iterator = conditions[Symbol.iterator]();
    let itr = iterator.next();
    while (!itr.done) {
      // Gather up all the simple matches
      let simpleMatches = [];
      while (!itr.done && !itr.value.$isComplexStage) {
        simpleMatches.push(itr.value);
        itr = iterator.next();
      }

      if (simpleMatches.length) {
        pipeline.push({
          $match: {
            $and: simpleMatches,
          },
        });
      }

      // Push all the complex stages onto the pipeline as-is
      while (!itr.done && itr.value.$isComplexStage) {
        pipeline.push(...itr.value.pipeline);
        if (itr.value.mutator) {
          postAggregateMutation.push(itr.value.mutator);
        }
        itr = iterator.next();
      }
    }

    if (args.search) {
      // TODO: Implement configurable search fields for lists
      pipeline.push({
        $match: {
          name: new RegExp(`${escapeRegExp(args.search)}`, 'i'),
        },
      });
    }

    if (args.orderBy) {
      const [orderField, orderDirection] = args.orderBy.split('_');

      pipeline.push({
        $sort: {
          [orderField]: orderDirection === 'ASC' ? 1 : -1,
        },
      });
    }

    if (args.skip < Infinity && args.skip > 0) {
      pipeline.push({
        $skip: args.skip,
      });
    }

    if (args.first < Infinity && args.first > 0) {
      pipeline.push({
        $limit: args.first,
      });
    }

    if (meta) {
      pipeline.push({
        $count: 'count',
      });
    }

    if (!pipeline.length) {
      return this.findAll();
    }

    // Map _id => id
    // Normally, mongoose would do this for us, but because we're breaking out
    // and going straight Mongo, gotta do it ourselves.
    pipeline.push({
      $addFields: {
        id: '$_id',
      },
    });
    return this.model
      .aggregate(pipeline)
      .exec()
      .then(data => {
        if (meta) {
          return data[0];
        }

        return (
          data
            .map((item, index, list) =>
              // Iterate over all the mutations
              postAggregateMutation.reduce(
                // And pass through the result to the following mutator
                (mutatedItem, mutation) => mutation(mutatedItem, index, list),
                // Starting at the original item
                item
              )
            )
            // If anything gets removed, we clear it out here
            .filter(Boolean)
        );
      });
  }
  itemsQueryMeta(args) {
    return this.itemsQuery(args, { meta: true });
  }
}

class MongooseFieldAdapter extends BaseFieldAdapter {
  addToMongooseSchema() {
    throw new Error(
      `Field type [${this.fieldName}] does not implement addToMongooseSchema()`
    );
  }

  getQueryConditions() {
    return [];
  }
}

MongooseAdapter.defaultListAdapterClass = MongooseListAdapter;

module.exports = {
  MongooseAdapter,
  MongooseListAdapter,
  MongooseFieldAdapter,
};
