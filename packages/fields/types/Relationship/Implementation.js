const mongoose = require('mongoose');
const omitBy = require('lodash.omitby');
const { mergeWhereClause } = require('@keystonejs/utils');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const { Implementation } = require('../../Implementation');
const nestedMutations = require('./nested-mutations');

class Relationship extends Implementation {
  constructor() {
    super(...arguments);
  }
  getGraphqlOutputFields() {
    const { many, ref } = this.config;

    if (many) {
      const filterArgs = this.getListByKey(ref)
        .getGraphqlFilterFragment()
        .join('\n');
      return [
        `${this.path}(${filterArgs}): [${ref}]`,
        `_${this.path}Meta(${filterArgs}): _QueryMeta`,
      ];
    }

    return [`${this.path}: ${ref}`];
  }

  extendAdminMeta(meta) {
    const { many, ref } = this.config;
    return { ...meta, ref, many };
  }
  getGraphqlQueryArgs() {
    const { many, ref } = this.config;
    const list = this.getListByKey(ref);
    if (many) {
      return [
        `""" condition must be true for all nodes """
        ${this.path}_every: ${list.gqlNames.whereInputName}`,
        `""" condition must be true for at least 1 node """
        ${this.path}_some: ${list.gqlNames.whereInputName}`,
        `""" condition must be false for all nodes """
        ${this.path}_none: ${list.gqlNames.whereInputName}`,
        `""" is the relation field null """
        ${this.path}_is_null: Boolean`,
      ];
    } else {
      return [`${this.path}: ${list.gqlNames.whereInputName}`, `${this.path}_is_null: Boolean`];
    }
  }

  getGraphqlOutputFieldResolvers() {
    const { many, ref } = this.config;
    const refList = this.getListByKey(ref);

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
          return refList
            .manyQuery(filteredQueryArgs, context, this.listQueryName)
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
            // eslint-disable-next-line no-underscore-dangle
            if (value && value._id) {
              // eslint-disable-next-line no-underscore-dangle
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

  async createUpdatePreHook(input, currentValue, fieldKey, context) {
    const {
      listKey,
      config: { many, ref, required },
    } = this;

    // Early out for null'd field
    if (!required && !input) {
      return input;
    }

    const refList = this.getListByKey(ref);

    return await nestedMutations({
      input,
      currentValue,
      fieldKey,
      listKey,
      many,
      ref,
      refList,
      context,
    });
  }

  createFieldPreHook(data, fieldKey, context) {
    return this.createUpdatePreHook(data, undefined, fieldKey, context);
  }

  updateFieldPreHook(data, fieldKey, originalItem, context) {
    return this.createUpdatePreHook(data, originalItem[fieldKey], fieldKey, context);
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
    if (this.config.many) {
      return [
        `
        input ${this.config.ref}RelateToManyInput {
          # Provide data to create a set of new ${this.config.ref}. Will also connect.
          create: [${this.config.ref}CreateInput]

          # Provide a filter to link to a set of existing ${this.config.ref}.
          connect: [${this.config.ref}WhereUniqueInput]

          # Provide a filter to remove to a set of existing ${this.config.ref}.
          disconnect: [${this.config.ref}WhereUniqueInput]

          # Remove all ${this.config.ref} in this list.
          disconnectAll: Boolean
        }
      `,
      ];
    }

    return [
      `
      input ${this.config.ref}RelateToOneInput {
        # Provide data to create a new ${this.config.ref}.
        create: ${this.config.ref}CreateInput

        # Provide a filter to link to an existing ${this.config.ref}.
        connect: ${this.config.ref}WhereUniqueInput

        # Provide a filter to remove to an existing ${this.config.ref}.
        disconnect: ${this.config.ref}WhereUniqueInput

        # Remove the existing ${this.config.ref} (if any).
        disconnectAll: Boolean
      }
    `,
    ];
  }
  getGraphqlUpdateArgs() {
    if (this.config.many) {
      return [`${this.path}: ${this.config.ref}RelateToManyInput`];
    }

    return [`${this.path}: ${this.config.ref}RelateToOneInput`];
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
