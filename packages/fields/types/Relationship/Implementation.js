const mongoose = require('mongoose');
const pSettle = require('p-settle');
const omitBy = require('lodash.omitby');
const { mergeWhereClause } = require('@keystonejs/utils');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');
const { ParameterError } = require('./graphqlErrors');

class Relationship extends Implementation {
  constructor() {
    super(...arguments);
  }
  getGraphqlOutputFields() {
    const { many, ref } = this.config;

    if (many) {
      return `${this.path}(
        ${this.getListByKey(ref).getGraphqlFilterFragment()}
      ): [${ref}]`;
    }

    return `${this.path}: ${ref}`;
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

    // to-one relationships are much easier to deal with.
    if (!many) {
      return {
        [this.path]: (item, _, context) => {
          // The field may have already been filled in during an early DB lookup
          // (ie; joining when doing a filter)
          // eslint-disable-next-line no-underscore-dangle
          const id = item[this.path] && item[this.path]._id ? item[this.path]._id : item[this.path];

          if (!id) {
            return null;
          }

          const filteredQueryArgs = { where: { id: id.toString() } };

          // We do a full query to ensure things like access control are applied
          return this.getListByKey(ref)
            .manyQuery(filteredQueryArgs, context, this.listQueryName)
            .then(items => (items && items.length ? items[0] : null));
        },
      };
    }

    return {
      [this.path]: (item, args, context) => {
        // TODO - use args.where / args.first, etc.
        let ids = [];
        if (item[this.path]) {
          ids = item[this.path]
            .map(value => {
              // The field may have already been filled in during an early DB lookup
              // (ie; joining when doing a filter)
              // eslint-disable-next-line no-underscore-dangle
              if (value && value._id) {
                // eslint-disable-next-line no-underscore-dangle
                return value._id;
              }

              return value;
            })
            .filter(value => value);
        }
        const filteredQueryArgs = mergeWhereClause(args, { id_in: ids });
        return this.getListByKey(ref).manyQuery(filteredQueryArgs, context, this.listQueryName);
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

  getRefListAdapter() {
    return this.getListByKey(this.config.ref).adapter;
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
        match: [{ [`${uid}_${this.path}_${filterType}`]: true }],
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
