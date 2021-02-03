import mongoose from 'mongoose';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';

import { Implementation } from '../../Implementation';
import { resolveNested } from './nested-mutations';

export class Relationship extends Implementation {
  constructor(path, { ref, many, withMeta }) {
    super(...arguments);

    // JM: It bugs me this is duplicated in the field adapters but initialisation order makes it hard to avoid
    const [refListKey, refFieldPath] = ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
    this.isOrderable = true;

    this.isRelationship = true;
    this.many = many;
    this.withMeta = typeof withMeta !== 'undefined' ? withMeta : true;
  }

  get _supportsUnique() {
    return true;
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

  gqlOutputFields({ schemaName }) {
    const { refList } = this.tryResolveRefList();

    if (!refList.access[schemaName].read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

    if (this.many) {
      const filterArgs = refList.getGraphqlFilterFragment().join('\n');
      return [
        `${this.path}(${filterArgs}): [${refList.gqlNames.outputTypeName}!]!`,
        this.withMeta ? `_${this.path}Meta(${filterArgs}): _QueryMeta` : '',
      ];
    } else {
      return [`${this.path}: ${refList.gqlNames.outputTypeName}`];
    }
  }

  extendAdminMeta(meta) {
    const { refListKey: ref, refFieldPath, many } = this;
    return { ...meta, ref, refFieldPath, many };
  }

  gqlQueryInputFields({ schemaName }) {
    const { refList } = this.tryResolveRefList();

    if (!refList.access[schemaName].read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

    if (this.many) {
      return [
        `""" condition must be true for all nodes """
        ${this.path}_every: ${refList.gqlNames.whereInputName}`,
        `""" condition must be true for at least 1 node """
        ${this.path}_some: ${refList.gqlNames.whereInputName}`,
        `""" condition must be false for all nodes """
        ${this.path}_none: ${refList.gqlNames.whereInputName}`,
      ];
    } else {
      return [`${this.path}: ${refList.gqlNames.whereInputName}`, `${this.path}_is_null: Boolean`];
    }
  }

  gqlOutputFieldResolvers({ schemaName }) {
    const { refList } = this.tryResolveRefList();

    if (!refList.access[schemaName].read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

    if (this.many) {
      return {
        [this.path]: (item, args, context, info) => {
          return refList.listQuery(args, context, info.fieldName, info, {
            fromList: this.getListByKey(this.listKey),
            fromId: item.id,
            fromField: this.path,
          });
        },

        ...(this.withMeta && {
          [`_${this.path}Meta`]: (item, args, context, info) => {
            return refList.listQueryMeta(args, context, info.fieldName, info, {
              fromList: this.getListByKey(this.listKey),
              fromId: item.id,
              fromField: this.path,
            });
          },
        }),
      };
    } else {
      return {
        [this.path]: (item, _, context, info) => {
          // No ID set, so we return null for the value
          const id = item && (item[this.adapter.idPath] || (item[this.path] && item[this.path].id));
          if (!id) {
            return null;
          }
          const filteredQueryArgs = { where: { id: id.toString() } };
          // We do a full query to ensure things like access control are applied
          return refList
            .listQuery(filteredQueryArgs, context, refList.gqlNames.listQueryName, info)
            .then(items => (items && items.length ? items[0] : null));
        },
      };
    }
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
   * value of `null`. Be sure to guard against this in your code.
   * NOTE: If `disconnectAll` is true, `disconnect` will be an array of all
   * previous stored values, which means indecies may not match those passed in
   * `operations`.
   */
  async resolveNestedOperations(operations, item, context, getItem, mutationState) {
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
        !this.isRequired
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

    let currentValue;
    if (this.many) {
      const info = { fieldName: this.path };
      currentValue = item
        ? await refList.listQuery(
            {},
            { ...context, getListAccessControlForUser: () => true },
            info.fieldName,
            info,
            { fromList: this.getListByKey(this.listKey), fromId: item.id, fromField: this.path }
          )
        : [];
      currentValue = currentValue.map(({ id }) => id.toString());
    } else {
      currentValue = item && (item[this.adapter.idPath] || (item[this.path] && item[this.path].id));
      currentValue = currentValue && currentValue.toString();
    }

    // Collect the IDs to be connected and disconnected. This step may trigger
    // createMutation calls in order to obtain these IDs if required.
    const { create = [], connect = [], disconnect = [] } = await resolveNested({
      input: operations,
      currentValue,
      listInfo,
      many: this.many,
      context,
      mutationState,
    });

    return { create, connect, disconnect, currentValue };
  }

  getGqlAuxTypes({ schemaName }) {
    const { refList } = this.tryResolveRefList();
    const schemaAccess = refList.access[schemaName];
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
    if (
      schemaAccess.read ||
      schemaAccess.create ||
      schemaAccess.update ||
      schemaAccess.delete ||
      schemaAccess.auth
    ) {
      const operations = [];
      if (this.many) {
        if (refList.access[schemaName].create) {
          operations.push(`# Provide data to create a set of new ${refList.key}. Will also connect.
          create: [${refList.gqlNames.createInputName}]`);
        }

        operations.push(
          `# Provide a filter to link to a set of existing ${refList.key}.
          connect: [${refList.gqlNames.whereUniqueInputName}]`,
          `# Provide a filter to remove to a set of existing ${refList.key}.
          disconnect: [${refList.gqlNames.whereUniqueInputName}]`,
          `# Remove all ${refList.key} in this list.
          disconnectAll: Boolean`
        );
        return [
          `input ${refList.gqlNames.relateToManyInputName} {
          ${operations.join('\n')}
        }
      `,
        ];
      } else {
        if (schemaAccess.create) {
          operations.push(`# Provide data to create a new ${refList.key}.
        create: ${refList.gqlNames.createInputName}`);
        }

        operations.push(
          `# Provide a filter to link to an existing ${refList.key}.
        connect: ${refList.gqlNames.whereUniqueInputName}`,
          `# Provide a filter to remove to an existing ${refList.key}.
        disconnect: ${refList.gqlNames.whereUniqueInputName}`,
          `# Remove the existing ${refList.key} (if any).
        disconnectAll: Boolean`
        );
        return [
          `input ${refList.gqlNames.relateToOneInputName} {
          ${operations.join('\n')}
        }
      `,
        ];
      }
    } else {
      return [];
    }
  }
  gqlUpdateInputFields({ schemaName }) {
    const { refList } = this.tryResolveRefList();
    const schemaAccess = refList.access[schemaName];
    if (
      schemaAccess.read ||
      schemaAccess.create ||
      schemaAccess.update ||
      schemaAccess.delete ||
      schemaAccess.auth
    ) {
      if (this.many) {
        return [`${this.path}: ${refList.gqlNames.relateToManyInputName}`];
      } else {
        return [`${this.path}: ${refList.gqlNames.relateToOneInputName}`];
      }
    } else {
      return [];
    }
  }
  gqlCreateInputFields({ schemaName }) {
    return this.gqlUpdateInputFields({ schemaName });
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

export class MongoRelationshipInterface extends MongooseFieldAdapter {
  constructor(...args) {
    super(...args);
    this.idPath = this.dbPath;

    // JM: It bugs me this is duplicated in the implementation but initialisation order makes it hard to avoid
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
    this.isRelationship = true;
  }

  addToMongooseSchema(schema, _mongoose, rels) {
    // If we're relating to 'many' things, we don't store ids in this table
    if (!this.field.many) {
      // If we're the right hand side of a 1:1 relationship, do nothing.
      const { right, cardinality } = rels.find(
        ({ left, right }) => left.adapter === this || (right && right.adapter === this)
      );
      if (cardinality === '1:1' && right && right.adapter === this) {
        return;
      }

      // Otherwise, we're are hosting a foreign key
      const { refListKey, config } = this;
      const type = mongoose.Types.ObjectId;
      schema.add({ [this.path]: this.mergeSchemaOptions({ type, ref: refListKey }, config) });
    }
  }

  getQueryConditions(dbPath) {
    return {
      [`${this.path}_is_null`]: value => ({
        [dbPath]: value ? { $not: { $exists: true, $ne: null } } : { $exists: true, $ne: null },
      }),
    };
  }
}

export class KnexRelationshipInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);
    this.idPath = this.dbPath;
    this.isRelationship = true;

    // Default isIndexed to true if it's not explicitly provided
    // Mutually exclusive with isUnique
    this.isUnique = typeof this.config.isUnique === 'undefined' ? false : !!this.config.isUnique;
    this.isIndexed =
      typeof this.config.isIndexed === 'undefined'
        ? !this.config.isUnique
        : !!this.config.isIndexed;

    // JM: It bugs me this is duplicated in the implementation but initialisation order makes it hard to avoid
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
  }

  // Override the isNotNullable defaulting logic; default to false, not field.isRequired
  // Non-nullability of foreign keys in a one-to-many configuration causes problems with complicates creates
  // It implies a precedence in ordering of create operations and can break the nexted create resolvers
  // Also, if a pair of list both have a non-nullable relationship with the other, all inserts on either will fail
  get isNotNullable() {
    if (this._isNotNullable) return this._isNotNullable;

    return (this._isNotNullable = !!(typeof this.knexOptions.isNotNullable === 'undefined'
      ? false
      : this.knexOptions.isNotNullable));
  }

  addToTableSchema(table, rels) {
    // If we're relating to 'many' things, we don't store ids in this table
    if (!this.field.many) {
      // If we're the right hand side of a 1:1 relationship, do nothing.
      const { right, cardinality } = rels.find(
        ({ left, right }) => left.adapter === this || (right && right.adapter === this)
      );
      if (cardinality === '1:1' && right && right.adapter === this) {
        return;
      }
      // The foreign key needs to do this work for us; we don't know what type it is
      const refList = this.getListByKey(this.refListKey);
      const refId = refList.getPrimaryKey();
      const foreignKeyConfig = {
        path: this.path,
        isUnique: this.isUnique,
        isIndexed: this.isIndexed,
        isNotNullable: this.isNotNullable,
      };
      refId.adapter.addToForeignTableSchema(table, foreignKeyConfig);
    }
  }

  getQueryConditions(dbPath) {
    return {
      [`${this.path}_is_null`]: value => b =>
        value ? b.whereNull(dbPath) : b.whereNotNull(dbPath),
    };
  }
}

export class PrismaRelationshipInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
    this.idPath = `${this.dbPath}Id`;
    this.isRelationship = true;

    // Default isIndexed to true if it's not explicitly provided
    // Mutually exclusive with isUnique
    this.isUnique = typeof this.config.isUnique === 'undefined' ? false : !!this.config.isUnique;
    this.isIndexed =
      typeof this.config.isIndexed === 'undefined'
        ? !this.config.isUnique
        : !!this.config.isIndexed;

    // JM: It bugs me this is duplicated in the implementation but initialisation order makes it hard to avoid
    const [refListKey, refFieldPath] = this.config.ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
  }

  getQueryConditions(dbPath) {
    return {
      [`${this.path}_is_null`]: value => (value ? { [dbPath]: null } : { NOT: { [dbPath]: null } }),
    };
  }
}
