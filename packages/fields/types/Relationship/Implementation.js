const mongoose = require('mongoose');
const cuid = require('cuid');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

function relationFilterPipeline({
  path,
  query,
  many,
  refListAdapter,
  joinPathName,
}) {
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

function postAggregateMutationFactory({
  path,
  many,
  joinPathName,
  refListAdapter,
}) {
  // Recreate Mongoose instances of the sub items every time to allow for
  // further operations to be performed on those sub items via Mongoose.
  return item => {
    if (!item) {
      return;
    }

    let joinedItems;

    if (many) {
      joinedItems = item[path].map(itemId => {
        const joinedItemIndex = item[joinPathName].findIndex(({ _id }) =>
          _id.equals(itemId)
        );

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
  getGraphqlSchema() {
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
    if (many) {
      return `
        # condition must be true for all nodes
        ${this.path}_every: ${ref}WhereInput
        # condition must be true for at least 1 node
        ${this.path}_some: ${ref}WhereInput
        # condition must be false for all nodes
        ${this.path}_none: ${ref}WhereInput
        # is the relation field null
        ${this.path}_is_null: Boolean
      `;
    } else {
      return `
        ${this.path}: ${ref}WhereInput
        ${this.path}_is_null: Boolean
      `;
    }
  }
  isGraphqlQueryArg(arg) {
    if (this.config.many) {
      return (
        [
          `${this.path}_every`,
          `${this.path}_some`,
          `${this.path}_none`,
          `${this.path}_is_null`,
        ].indexOf(arg) !== -1
      );
    } else {
      return arg === this.path || arg === `${this.path}_is_null`;
    }
  }
  getGraphqlFieldResolvers() {
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
  getGraphqlUpdateArgs() {
    const { many } = this.config;
    const type = many ? '[String]' : 'String';
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
      const refListAdapter = this.field.getListByKey(this.config.ref).adapter;
      const filters = refListAdapter.itemsQueryConditions(
        args[this.path],
        depthGuard
      );

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
