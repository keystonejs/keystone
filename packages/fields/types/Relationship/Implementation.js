const mongoose = require('mongoose');
const pSettle = require('p-settle');
const cuid = require('cuid');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');
const { ParameterError } = require('./graphqlErrors');

function relationFilterPipeline({ path, query, many, refListAdapter, joinPathName }) {
  return [
    {
      // JOIN
      $lookup: {
        // the MongoDB name of the collection - this is potentially different
        // from the Mongoose name due to pluralization, etc. This guarantees the
        // correct name.
        from: refListAdapter.model.collection.name,
        as: joinPathName,
        let: { [path]: `$${path}` },
        pipeline: [
          {
            $match: {
              ...query,
              $expr: { [many ? '$in' : '$eq']: ['$_id', `$$${path}`] },
            },
          },
        ],
      },
    },
    // Filter out empty array results (the $lookup will return a document with
    // an empty array when no matches are found in the related field)
    // TODO: This implies a `some` filter. For an `every` filter, we would need
    // to somehow check that the resulting size of `path` equals the original
    // document's size. In the case of one-to-one, we'd have to check that the
    // resulting size is exactly 1 (which is the same as `$ne: []`?)
    { $match: { [joinPathName]: { $exists: true, $ne: [] } } },
  ];
}

function postAggregateMutationFactory({ path, many, joinPathName, refListAdapter }) {
  // Recreate Mongoose instances of the sub items every time to allow for
  // further operations to be performed on those sub items via Mongoose.
  return item => {
    if (!item) {
      return;
    }

    let joinedItems;

    if (many) {
      joinedItems = item[path].map(itemId => {
        const joinedItemIndex = item[joinPathName].findIndex(({ _id }) => _id.equals(itemId));

        if (joinedItemIndex === -1) {
          return itemId;
        }

        // Extract that element out of the array (so the next iteration is a bit
        // faster)
        const joinedItem = item[joinPathName].splice(joinedItemIndex, 1)[0];
        return refListAdapter.model(joinedItem);
      });

      // At this point, we should have spliced out all of the items
      if (item[joinPathName].length > 0) {
        // I don't see why this should ever happen, but just in case...
        throw new Error(
          `Expected results from MongoDB aggregation '${joinPathName}' to be a subset of the original items, bet left with:\n${JSON.stringify(
            item[joinPathName]
          )}`
        );
      }
    } else {
      const joinedItem = item[joinPathName][0];
      // eslint-disable-next-line no-underscore-dangle
      if (!joinedItem || !joinedItem._id.equals(item[path])) {
        // Shouldn't be possible due to the { $exists: true, $ne: [] }
        // aggregation step above, but in case that fails or doesn't behave
        // as expected, we can catch that now.
        throw new Error(
          'Expected MongoDB aggregation to correctly filter to a single related item, but no item found.'
        );
      }
      joinedItems = refListAdapter.model(joinedItem);
    }

    const newItemValues = {
      ...item,
      [path]: joinedItems,
    };

    // Get rid of the temporary data key we used to join on
    // Should be an empty array now that we spliced all the values out above
    delete newItemValues[joinPathName];

    return newItemValues;
  };
}

class Relationship extends Implementation {
  constructor() {
    super(...arguments);
  }
  getGraphqlOutputFields() {
    const { many, ref } = this.config;
    const type = many ? `[${ref}]` : ref;
    return `${this.path}: ${type}`;
  }

  extendAdminMeta(meta) {
    const { many, ref } = this.config;
    return { ...meta, ref, many };
  }
  getGraphqlQueryArgs() {
    const { many, ref } = this.config;
    const list = this.getListByKey(ref);
    if (many) {
      return `
        # condition must be true for all nodes
        ${this.path}_every: ${list.gqlNames.whereInputName}
        # condition must be true for at least 1 node
        ${this.path}_some: ${list.gqlNames.whereInputName}
        # condition must be false for all nodes
        ${this.path}_none: ${list.gqlNames.whereInputName}
        # is the relation field null
        ${this.path}_is_null: Boolean
      `;
    } else {
      return `
        ${this.path}: ${list.gqlNames.whereInputName}
        ${this.path}_is_null: Boolean
      `;
    }
  }
  getGraphqlOutputFieldResolvers() {
    const { many, ref } = this.config;
    return {
      [this.path]: item => {
        if (many) {
          return this.getListByKey(ref).adapter.find({
            _id: { $in: item[this.path] },
          });
        } else {
          // The field may have already been filled in during an early DB lookup
          // (ie; joining when doing a filter)
          // eslint-disable-next-line no-underscore-dangle
          if (item[this.path] && item[this.path]._id) {
            return item[this.path];
          }
          return this.getListByKey(ref).adapter.findById(item[this.path]);
        }
      },
    };
  }

  async preHook(data, fieldKey, context) {
    const { many, ref, required } = this.config;

    // Early out for null'd field
    if (!required && !data) {
      return data;
    }

    const validateInput = input => {
      if (input.id && input.create) {
        throw new ParameterError({
          message: `Cannot provide both an id and create data when linking ${
            this.listKey
          }.${fieldKey} to a ${ref}`,
        });
      }

      if (!input.id && (!input.create || Object.keys(input.create).length === 0)) {
        throw new ParameterError({
          message: `Must provide one of 'id' or 'create' data when linking ${
            this.listKey
          }.${fieldKey} to a ${ref}`,
        });
      }
    };

    const resolveToId = async input => {
      if (input.id) {
        // TODO: Should related lists without 'read' perm be able to set the ID here?
        // It is a way of leaking data by testing if certain ids exist.
        return input.id;
      }

      // Create related item. Will check for access control itself, no need to
      // do anything extra here.
      const { id } = await this.getListByKey(ref).createMutation(input.create, context);
      return id;
    };

    if (!many) {
      try {
        // Only a single item, much simpler logic
        validateInput(data);
        return await resolveToId(data);
      } catch (error) {
        const wrappingError = new Error(
          `Unable to create a new ${ref} as set on ${this.listKey}.${fieldKey}`
        );

        error.path = [fieldKey];

        if (error.name !== 'ParameterError') {
          error.path.push('create');
        }

        // Setup the correct path on the nested error objects
        wrappingError.errors = [error];

        throw wrappingError;
      }
    }

    // Multiple items received
    // TODO: Start Database transaction

    const resolvedData = (await pSettle(
      data.map(async input => {
        // awaited because `p-settle` expects promises only
        await validateInput(input);
        return resolveToId(input);
      })
    ))
      // Inject the index as a key into the settled data for later use
      .map((item, index) => ({ ...item, index }));

    const errored = resolvedData.filter(({ isRejected }) => isRejected);

    if (errored.length) {
      const error = new Error(
        `Unable to create ${errored.length} new ${ref} as set on ${this.listKey}.${fieldKey}`
      );

      // Setup the correct path on the nested error objects
      error.errors = errored.map(({ reason, index }) => {
        reason.path = [fieldKey, index];

        if (reason.name !== 'ParameterError') {
          reason.path.push('create');
        }
        return reason;
      });

      // TODO: Rollback Database transaction

      throw error;
    }

    // TODO: Commit Database transaction

    // At this point, we know everything resolved successfully
    // Map back from `p-settle`'s data structure to the raw value
    return resolvedData.map(({ value }) => value);
  }

  createFieldPreHook(data, fieldKey, context) {
    return this.preHook(data, fieldKey, context);
  }

  updateFieldPreHook(data, fieldKey, originalItem, context) {
    return this.preHook(data, fieldKey, context);
  }

  getGraphqlAuxiliaryTypes() {
    // We need an input type that is specific to creating nested items when
    // creating a relationship, ie;
    //
    // eg: Creating a new post at the same time as a new user
    // mutation createUser() {
    //   posts: [{ create: { title: 'Foobar' } }]
    // }
    //
    // Or, the inverse: Creating a new user at the same time as a new post
    // mutation createPost() {
    //   author: { create: { email: 'eg@example.com' } }
    // }
    //
    // Then there's the linking to existing records usecase:
    // mutation createPost() {
    //   author: { id: 'abc123' }
    // }
    return `
      input ${this.config.ref}RelationshipInput {
        # Provide an id to link to an existing ${this.config.ref}. Cannot be set if 'create' set.
        id: ID

        # Provide data to create a new ${this.config.ref}. Cannot be set if 'id' set.
        create: ${this.config.ref}CreateInput
      }
    `;
  }
  getGraphqlUpdateArgs() {
    const { many } = this.config;
    const inputType = `${this.config.ref}RelationshipInput`;
    const type = many ? `[${inputType}]` : inputType;
    return `${this.path}: ${type}`;
  }
  getGraphqlCreateArgs() {
    return this.getGraphqlUpdateArgs();
  }
  getDefaultValue() {
    return null;
  }
}

class MongoSelectInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { many, mongooseOptions, ref } = this.config;
    const type = many ? [ObjectId] : ObjectId;
    schema.add({
      [this.path]: { type, ref, ...mongooseOptions },
    });
  }

  getQueryConditions(args, list, depthGuard) {
    if (this.config.many) {
      return this.getQueryConditionsMany(args, list, depthGuard);
    }

    return this.getQueryConditionsSingle(args, list, depthGuard);
  }
  getQueryConditionsMany(args /*, last, depthGuard*/) {
    return [];
    Object.keys(args || {})
      .filter(filter => filter.startsWith(`${this.path}_`))
      .map(filter => filter);
  }
  getQueryConditionsSingle(args, list, depthGuard) {
    const conditions = [];

    if (!args) {
      return conditions;
    }

    const isNull = `${this.path}_is_null`;
    if (isNull in args) {
      if (args[isNull]) {
        conditions.push({ $not: { $exists: true, $ne: null } });
      } else {
        conditions.push({ $exists: true, $ne: null });
      }
    }

    if (this.path in args) {
      const refListAdapter = this.getListByKey(this.config.ref).adapter;
      const filters = refListAdapter.itemsQueryConditions(args[this.path], depthGuard);

      const query = {
        $and: filters,
      };

      // 99.999999999...% guaranteed not to conflict with anything else
      const joinPathName = cuid();

      conditions.push({
        // Must signal that this isn't some plain old '$and' query!
        $isComplexStage: true,
        pipeline: relationFilterPipeline({
          path: this.path,
          query,
          many: false,
          joinPathName,
          refListAdapter,
        }),
        mutator: postAggregateMutationFactory({
          path: this.path,
          many: false,
          joinPathName,
          refListAdapter,
        }),
      });
    }

    return conditions;
  }
}

module.exports = {
  Relationship,
  MongoSelectInterface,
};
