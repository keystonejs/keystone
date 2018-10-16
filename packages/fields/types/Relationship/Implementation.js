const mongoose = require('mongoose');
const omitBy = require('lodash.omitby');
const { mergeWhereClause } = require('@voussoir/utils');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const { Implementation } = require('../../Implementation');
const {
  nestedMutation,
  processQueuedDisconnections,
  processQueuedConnections,
  tellForeignItemToDisconnect,
} = require('./nested-mutations');

class Relationship extends Implementation {
  constructor() {
    super(...arguments);
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
  }

  tryResolveRefList() {
    const { listKey, path, refListKey, refFieldPath } = this;
    const refList = this.getListByKey(refListKey);

    if (!refList) {
      throw new Error(`Unable to resolve related list '${refListKey}' from ${listKey}.${path}`);
    }

    let refField;

    if (refFieldPath) {
      refField = refList.getFieldByPath(refFieldPath);

      if (!refField) {
        throw new Error(
          `Unable to resolve two way relationship field '${refListKey}.${refFieldPath}' from ${listKey}.${path}`
        );
      }
    }

    return { refList, refField };
  }

  get gqlOutputFields() {
    const { many } = this.config;

    const { refList } = this.tryResolveRefList();

    if (many) {
      const filterArgs = refList.getGraphqlFilterFragment().join('\n');
      return [
        `${this.path}(${filterArgs}): [${refList.gqlNames.outputTypeName}]`,
        `_${this.path}Meta(${filterArgs}): _QueryMeta`,
      ];
    }

    return [`${this.path}: ${refList.gqlNames.outputTypeName}`];
  }

  extendAdminMeta(meta) {
    const {
      refListKey: ref,
      refFieldPath,
      config: { many },
    } = this;
    return { ...meta, ref, refFieldPath, many };
  }

  get gqlQueryInputFields() {
    const { many } = this.config;
    const { refList } = this.tryResolveRefList();
    if (many) {
      return [
        `""" condition must be true for all nodes """
        ${this.path}_every: ${refList.gqlNames.whereInputName}`,
        `""" condition must be true for at least 1 node """
        ${this.path}_some: ${refList.gqlNames.whereInputName}`,
        `""" condition must be false for all nodes """
        ${this.path}_none: ${refList.gqlNames.whereInputName}`,
        `""" is the relation field null """
        ${this.path}_is_null: Boolean`,
      ];
    } else {
      return [`${this.path}: ${refList.gqlNames.whereInputName}`, `${this.path}_is_null: Boolean`];
    }
  }

  get gqlOutputFieldResolvers() {
    const { many } = this.config;
    const { refList } = this.tryResolveRefList();

    // to-one relationships are much easier to deal with.
    if (!many) {
      return {
        [this.path]: (item, _, context) => {
          // The field may have already been filled in during an early DB lookup
          // (ie; joining when doing a filter)
          const id = item[this.path] && item[this.path]._id ? item[this.path]._id : item[this.path];

          if (!id) {
            return null;
          }

          const filteredQueryArgs = { where: { id: id.toString() } };

          // We do a full query to ensure things like access control are applied
          return refList
            .manyQuery(filteredQueryArgs, context, refList.gqlNames.listQueryName)
            .then(items => (items && items.length ? items[0] : null));
        },
      };
    }

    const buildManyQueryArgs = (item, args) => {
      let ids = [];
      if (item[this.path]) {
        ids = item[this.path]
          .map(value => {
            // The field may have already been filled in during an early DB lookup
            // (ie; joining when doing a filter)
            if (value && value._id) {
              return value._id;
            }

            return value;
          })
          .filter(value => value);
      }
      return mergeWhereClause(args, { id_in: ids });
    };

    return {
      [this.path]: (item, args, context, { fieldName }) => {
        const filteredQueryArgs = buildManyQueryArgs(item, args);
        return refList.manyQuery(filteredQueryArgs, context, fieldName);
      },

      [`_${this.path}Meta`]: (item, args, context, { fieldName }) => {
        const filteredQueryArgs = buildManyQueryArgs(item, args);
        return refList.manyQueryMeta(filteredQueryArgs, context, fieldName);
      },
    };
  }

  async createUpdatePreHook(input, currentValue, context, getItem) {
    const { many, required } = this.config;

    const { refList, refField } = this.tryResolveRefList();

    // Early out for null'd field
    if (!required && !input) {
      return input;
    }

    return await nestedMutation({
      input,
      currentValue,
      localField: this,
      localList: this.getListByKey(this.listKey),
      refList,
      refField,
      getItem,
      many,
      context,
    });
  }

  createFieldPreHook(data, context, createdPromise) {
    return this.createUpdatePreHook(data, undefined, context, createdPromise);
  }

  updateFieldPreHook(data, item, context) {
    const getItem = Promise.resolve(item);
    return this.createUpdatePreHook(data, item[this.path], context, getItem);
  }

  async updateFieldPostHook(fieldData, item, context) {
    // We have to wait to the post hook so we have the item's id to connect to!
    await processQueuedDisconnections({ context });
    await processQueuedConnections({ context });
  }

  async createFieldPostHook(data, item, context) {
    // We have to wait to the post hook so we have the item's id to connect to!
    // NOTE: We don't do any disconnects here (it's not possible to disconnect
    // something for a newly created item thanks to the order of operations)
    await processQueuedConnections({ context });
  }

  deleteFieldPreHook(data, item, context) {
    // Early out for null'd field
    if (!data) {
      return;
    }

    const { many } = this.config;
    const { refList, refField } = this.tryResolveRefList();

    // No related field to unlink
    if (!refField) {
      return;
    }

    const itemsToDisconnect = many ? data : [data];

    itemsToDisconnect
      // The data comes in as an ObjectId, so we have to convert it
      .map(itemToDisconnect => itemToDisconnect.toString())
      .forEach(itemToDisconnect => {
        tellForeignItemToDisconnect({
          context,
          getItem: Promise.resolve(item),
          local: {
            list: this.getListByKey(this.listKey),
            field: this,
          },
          foreign: {
            list: refList,
            field: refField,
            id: itemToDisconnect,
          },
        });
      });

    // TODO: Cascade _deletion_ of any related items (not just setting the
    // reference to null)
    // Accept a config option for cascading: https://www.prisma.io/docs/1.4/reference/service-configuration/data-modelling-(sdl)-eiroozae8u/#the-@relation-directive
    // Beware of circular delete hooks!
  }

  async deleteFieldPostHook(fieldData, item, context) {
    // We have to wait to the post hook so we have the item's id to discconect.
    await processQueuedDisconnections({ context });
  }

  get gqlAuxTypes() {
    const { refList } = this.tryResolveRefList();
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
    if (this.config.many) {
      return [
        `
        input ${refList.gqlNames.relateToManyInputName} {
          # Provide data to create a set of new ${refList.key}. Will also connect.
          create: [${refList.gqlNames.createInputName}]

          # Provide a filter to link to a set of existing ${refList.key}.
          connect: [${refList.gqlNames.whereUniqueInputName}]

          # Provide a filter to remove to a set of existing ${refList.key}.
          disconnect: [${refList.gqlNames.whereUniqueInputName}]

          # Remove all ${refList.key} in this list.
          disconnectAll: Boolean
        }
      `,
      ];
    }

    return [
      `
      input ${refList.gqlNames.relateToOneInputName} {
        # Provide data to create a new ${refList.key}.
        create: ${refList.gqlNames.createInputName}

        # Provide a filter to link to an existing ${refList.key}.
        connect: ${refList.gqlNames.whereUniqueInputName}

        # Provide a filter to remove to an existing ${refList.key}.
        disconnect: ${refList.gqlNames.whereUniqueInputName}

        # Remove the existing ${refList.key} (if any).
        disconnectAll: Boolean
      }
    `,
    ];
  }
  get gqlUpdateInputFields() {
    const { refList } = this.tryResolveRefList();
    if (this.config.many) {
      return [`${this.path}: ${refList.gqlNames.relateToManyInputName}`];
    }

    return [`${this.path}: ${refList.gqlNames.relateToOneInputName}`];
  }
  get gqlCreateInputFields() {
    return this.gqlUpdateInputFields;
  }
  getDefaultValue() {
    return null;
  }
}

class MongoSelectInterface extends MongooseFieldAdapter {
  constructor(...args) {
    super(...args);
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
  }

  addToMongooseSchema(schema) {
    const {
      refListKey: ref,
      config: { many, mongooseOptions },
    } = this;
    const type = many ? [ObjectId] : ObjectId;
    const unique = this.config.unique;
    schema.add({
      [this.path]: { type, ref, unique, ...mongooseOptions },
    });
  }

  getRefListAdapter() {
    return this.getListByKey(this.refListKey).adapter;
  }

  getQueryConditions() {
    return {
      [`${this.path}_is_null`]: value => {
        if (value) {
          return { [this.path]: { $not: { $exists: true, $ne: null } } };
        }
        return { [this.path]: { $exists: true, $ne: null } };
      },
    };
  }

  hasQueryCondition(condition) {
    return Object.keys(this.getRelationshipQueryConditions()).includes(condition);
  }

  getRelationshipQueryConditions() {
    const refListAdapter = this.getRefListAdapter();
    const from = refListAdapter.model.collection.name;

    const buildRelationship = (filterType, uid) => {
      return {
        from, // the collection name to join with
        field: this.path, // The field on this collection
        // A mutation to run on the data post-join. Useful for merging joined
        // data back into the original object.
        // Executed on a depth-first basis for nested relationships.
        postQueryMutation: (parentObj /*, keyOfRelationship, rootObj, pathToParent*/) => {
          return omitBy(
            parentObj,
            /*
            {
              ...parentObj,
              // Given there could be sorting and limiting that's taken place, we
              // want to overwrite the entire object rather than merging found items
              // in.
              [field]: parentObj[keyOfRelationship],
            },
            */
            // Clean up the result to remove the intermediate results
            (_, keyToOmit) => keyToOmit.startsWith(uid)
          );
        },
        // The conditions under which an item from the 'orders' collection is
        // considered a match and included in the end result
        // All the keys on an 'order' are available, plus 3 special keys:
        // 1) <uid>_<field>_every - is `true` when every joined item matches the
        //    query
        // 2) <uid>_<field>_some - is `true` when some joined item matches the
        //    query
        // 3) <uid>_<field>_none - is `true` when none of the joined items match
        //    the query
        matchTerm: { [`${uid}_${this.path}_${filterType}`]: true },
        // Flag this is a to-many relationship
        many: this.config.many,
      };
    };

    return {
      [this.path]: (value, query, uid) => buildRelationship('every', uid),
      [`${this.path}_every`]: (value, query, uid) => buildRelationship('every', uid),
      [`${this.path}_some`]: (value, query, uid) => buildRelationship('some', uid),
      [`${this.path}_none`]: (value, query, uid) => buildRelationship('none', uid),
    };
  }
}

module.exports = {
  Relationship,
  MongoSelectInterface,
};
