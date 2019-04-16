const mongoose = require('mongoose');
const omitBy = require('lodash.omitby');
const { mergeWhereClause } = require('@keystone-alpha/utils');
const { MongooseFieldAdapter } = require('@keystone-alpha/adapter-mongoose');
const { KnexFieldAdapter } = require('@keystone-alpha/adapter-knex');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const { Implementation } = require('../../Implementation');
const { resolveNested } = require('./nested-mutations');
const { enqueueBacklinkOperations } = require('./backlinks');

class Relationship extends Implementation {
  constructor() {
    super(...arguments);
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
    this.isRelationship = true;
    this.withMeta = typeof this.config.withMeta !== 'undefined' ? this.config.withMeta : true;
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

    if (!refList.access.read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

    if (many) {
      const filterArgs = refList.getGraphqlFilterFragment().join('\n');
      return [
        `${this.path}(${filterArgs}): [${refList.gqlNames.outputTypeName}]`,
        this.withMeta ? `_${this.path}Meta(${filterArgs}): _QueryMeta` : '',
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

    if (!refList.access.read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

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

    if (!refList.access.read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

    // to-one relationships are much easier to deal with.
    if (!many) {
      return {
        [this.path]: (item, _, context) => {
          // No ID set, so we return null for the value
          if (!item[this.path]) {
            return null;
          }
          const filteredQueryArgs = { where: { id: item[this.path].toString() } };
          // We do a full query to ensure things like access control are applied
          return refList
            .listQuery(filteredQueryArgs, context, refList.gqlNames.listQueryName)
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
            if (value && value.id) {
              return value.id;
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
        return refList.listQuery(filteredQueryArgs, context, fieldName);
      },

      ...(this.withMeta && {
        [`_${this.path}Meta`]: (item, args, context, { fieldName }) => {
          const filteredQueryArgs = buildManyQueryArgs(item, args);
          return refList.listQueryMeta(filteredQueryArgs, context, fieldName);
        },
      }),
    };
  }

  /**
   * @param operations {Object}
   * {
   *   disconnectAll?: Boolean, (default: false),
   *   disconnect?: Array<where>, (default: []),
   *   connect?: Array<where>, (default: []),
   *   create?: Array<data>, (default: []),
   * }
   * NOTE: If `disconnectAll` is `true`, `disconnect` is ignored.
   * `where` is a WhereUniqueInput (eg; { id: "abc123" })
   * `data` is an input of the type expected for the ref list (eg; { data: { name: "Sarah" } })
   *
   * @return {Object}
   * {
   *   disconnect: Array<ID>,
   *   connect: Array<ID>,
   *   create: Array<ID>,
   * }
   * The indexes within the return arrays are guaranteed to match the indexes as
   * passed in `operations`.
   * Due to Access Control, it is possible thata some operations result in a
   * value of `null`. Be sure to guard against this in your code (or use the
   * .convertResolvedOperationsToFieldValue() method which handles this for
   * you).
   * NOTE: If `disconnectAll` is true, `disconnect` will be an array of all
   * previous stored values, which means indecies may not match those passed in
   * `operations`.
   */
  async resolveNestedOperations(operations, item, context, getItem, mutationState) {
    const { many, isRequired } = this.config;

    const { refList, refField } = this.tryResolveRefList();
    const listInfo = {
      local: { list: this.getListByKey(this.listKey), field: this },
      foreign: { list: refList, field: refField },
    };

    // Possible early out for null'd field
    // prettier-ignore
    if (
      !operations
      && (
        // If the field is not required, and the value is `null`, we can ignore
        // it and move on.
        !isRequired
        // This field will be backlinked to this field's containing item, so we
        // can safely ignore it now expecing the backlinking process in the
        // calling code to take care of it.
        || (refField && this.getListByKey(refField.refListKey) === listInfo.local.list)
      )
    ) {
      // Don't release the zalgo; always return a promise.
      return Promise.resolve({
        create: [],
        connect: [],
        disconnect: [],
      });
    }

    let currentValue = item && item[this.path];
    if (many) {
      currentValue = (currentValue || []).map(id => id.toString());
    } else {
      currentValue = currentValue && currentValue.toString();
    }

    // Collect the IDs to be connected and disconnected. This step may trigger
    // createMutation calls in order to obtain these IDs if required.
    const { create = [], connect = [], disconnect = [] } = await resolveNested({
      input: operations,
      currentValue,
      listInfo,
      many,
      context,
      mutationState,
    });

    // Enqueue backlink operations for the connections and disconnections
    if (refField) {
      enqueueBacklinkOperations(
        { connect: [...create, ...connect], disconnect },
        mutationState.queues,
        getItem || Promise.resolve(item),
        listInfo.local,
        listInfo.foreign
      );
    }

    return { create, connect, disconnect };
  }

  // This function codifies the order of operations for nested mutations:
  // 1. disconnectAll
  // 2. disconnect
  // 3. create
  // 4. connect
  convertResolvedOperationsToFieldValue({ create, connect, disconnect }, item) {
    if (this.config.many) {
      const currentValue = ((item && item[this.path]) || []).map(id => id.toString());
      return [...currentValue.filter(id => !disconnect.includes(id)), ...connect, ...create].filter(
        id => !!id
      );
    } else {
      const currentValue = (item && item[this.path] && item[this.path].toString()) || null;
      return create && create[0]
        ? create[0]
        : connect && connect[0]
        ? connect[0]
        : disconnect && disconnect[0]
        ? null
        : currentValue;
    }
  }

  registerBacklink(data, item, mutationState) {
    // Early out for null'd field
    if (!data) {
      return;
    }

    const { refList, refField } = this.tryResolveRefList();
    if (refField) {
      enqueueBacklinkOperations(
        { disconnect: this.config.many ? data : [data] },
        mutationState.queues,
        Promise.resolve(item),
        { list: this.getListByKey(this.listKey), field: this },
        { list: refList, field: refField }
      );
    }
    // TODO: Cascade _deletion_ of any related items (not just setting the
    // reference to null)
    // Accept a config option for cascading: https://www.prisma.io/docs/1.4/reference/service-configuration/data-modelling-(sdl)-eiroozae8u/#the-@relation-directive
    // Beware of circular delete hooks!
  }

  getGqlAuxTypes() {
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
    //   author: { connect: { id: 'abc123' } }
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

class MongoRelationshipInterface extends MongooseFieldAdapter {
  constructor(...args) {
    super(...args);
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
    this.isRelationship = true;
  }

  addToMongooseSchema(schema) {
    const {
      refListKey: ref,
      config: { many },
    } = this;
    const type = many ? [ObjectId] : ObjectId;
    const schemaOptions = { type, ref };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }

  getRefListAdapter() {
    return this.getListByKey(this.refListKey).adapter;
  }

  getQueryConditions(dbPath) {
    return {
      [`${this.path}_is_null`]: value => ({
        [dbPath]: value ? { $not: { $exists: true, $ne: null } } : { $exists: true, $ne: null },
      }),
    };
  }

  getRelationshipQueryCondition(queryKey, uid) {
    const filterType = {
      [this.path]: 'every',
      [`${this.path}_every`]: 'every',
      [`${this.path}_some`]: 'some',
      [`${this.path}_none`]: 'none',
    }[queryKey];

    return {
      from: this.getRefListAdapter().model.collection.name, // the collection name to join with
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
  }

  supportsRelationshipQuery(query) {
    return [this.path, `${this.path}_every`, `${this.path}_some`, `${this.path}_none`].includes(
      query
    );
  }
}

class KnexRelationshipInterface extends KnexFieldAdapter {
  constructor(...args) {
    super(...args);
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
    this.refListId = `${refListKey}_id`;
    this.isRelationship = true;
  }

  getRefListAdapter() {
    return this.getListByKey(this.refListKey).adapter;
  }

  createColumn(table) {
    return table.integer(this.path).unsigned();
  }

  createForiegnKey(table, schemaName) {
    return table
      .foreign(this.path)
      .references('id')
      .inTable(`${schemaName}.${this.refListKey}`);
  }

  getQueryConditions(dbPath) {
    return {
      [`${this.path}_is_null`]: value => b =>
        value ? b.whereNull(dbPath) : b.whereNotNull(dbPath),
    };
  }
  supportsRelationshipQuery(query) {
    return [this.path, `${this.path}_every`, `${this.path}_some`, `${this.path}_none`].includes(
      query
    );
  }
}

module.exports = {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
};
