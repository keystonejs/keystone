import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { BaseKeystoneList, KeystoneContext } from '@keystone-next/types';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';
import { resolveNestedMany, resolveNestedSingle, cleanAndValidateInput } from './nested-mutations';

export type RelationshipSingleOperation = {
  connect?: any;
  create?: any;
  disconnect?: any;
  disconnectAll?: boolean | null;
};

export type RelationshipManyOperation = {
  connect?: any[] | null;
  create?: any[] | null;
  disconnect?: any[] | null;
  disconnectAll?: boolean | null;
};

export type RelationshipOperation = RelationshipSingleOperation | RelationshipManyOperation;

export class Relationship<P extends string> extends Implementation<P> {
  many: boolean;
  refFieldPath?: string;
  withMeta: boolean;
  ref: string;
  // adapter: PrismaRelationshipInterface<P>;
  constructor(
    path: P,
    {
      ref,
      many,
      withMeta,
      ...configArgs
    }: FieldConfigArgs & { ref: string; many?: boolean; withMeta?: boolean },
    extraArgs: FieldExtraArgs
  ) {
    super(path, { ref, many, withMeta, ...configArgs }, extraArgs);

    // JM: It bugs me this is duplicated in the field adapters but initialisation order makes it hard to avoid
    this.ref = ref;
    const [refListKey, refFieldPath] = ref.split('.');
    this.refListKey = refListKey;
    this.refFieldPath = refFieldPath;
    // FIXME: We should be able to sort by the "one" side of a relationship
    // but for now this isn't actually implemented, so we explicitly disable
    // ordering here.
    this.isOrderable = false;

    this.isRelationship = true;
    this.many = !!many;
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
      refField = refList.fieldsByPath[refFieldPath];

      if (!refField) {
        throw new Error(
          `Unable to resolve two way relationship field '${refListKey}.${refFieldPath}' from ${listKey}.${path}`
        );
      }
    }

    return { refList, refField };
  }

  gqlOutputFields({ schemaName }: { schemaName: string }) {
    const { refList } = this.tryResolveRefList();

    if (!refList.access[schemaName].read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

    if (this.many) {
      const filterArgs = refList.getGraphqlFilterFragment().join('\n');
      return [
        `${this.path}(${filterArgs}): [${refList.gqlNames.outputTypeName}!]!`,
        this.withMeta
          ? `_${this.path}Meta(${filterArgs}): _QueryMeta @deprecated(reason: "This query will be removed in a future version. Please use ${this.path}Count instead.")`
          : '',
        this.withMeta
          ? `${this.path}Count(${`where: ${refList.gqlNames.whereInputName}! = {}`}): Int!`
          : '',
      ];
    } else {
      return [`${this.path}: ${refList.gqlNames.outputTypeName}`];
    }
  }

  gqlQueryInputFields({ schemaName }: { schemaName: string }) {
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

  gqlOutputFieldResolvers({ schemaName }: { schemaName: string }) {
    const { refList } = this.tryResolveRefList();

    if (!refList.access[schemaName].read) {
      // It's not accessible in any way, so we can't expose the related field
      return [];
    }

    if (this.many) {
      return {
        [this.path]: (item: any, args: any, context: KeystoneContext, info: any) => {
          return refList.listQuery(args, context, info.fieldName, info, {
            fromList: this.getListByKey(this.listKey),
            fromId: item.id,
            fromField: this.path,
          });
        },

        ...(this.withMeta && {
          [`_${this.path}Meta`]: (item: any, args: any, context: KeystoneContext, info: any) => {
            return refList.listQueryMeta(args, context, info.fieldName, info, {
              fromList: this.getListByKey(this.listKey),
              fromId: item.id,
              fromField: this.path,
            });
          },
          [`${this.path}Count`]: async (
            item: any,
            args: any,
            context: KeystoneContext,
            info: any
          ) => {
            return (
              await refList.listQueryMeta(args, context, info.fieldName, info, {
                fromList: this.getListByKey(this.listKey),
                fromId: item.id,
                fromField: this.path,
              })
            ).getCount();
          },
        }),
      };
    } else {
      return {
        [this.path]: (item: any, _: any, context: KeystoneContext, info: any) => {
          // No ID set, so we return null for the value
          // @ts-ignore
          const id = item && (item[this.adapter.idPath] || (item[this.path] && item[this.path].id));
          if (!id) {
            return null;
          }
          const filteredQueryArgs = { where: { id: id.toString() } };
          // We do a full query to ensure things like access control are applied
          return refList
            .listQuery(filteredQueryArgs, context, refList.gqlNames.listQueryName, info)
            .then((items?: any[]) => (items && items.length ? items[0] : null));
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
  async resolveNestedOperations(
    operations: RelationshipOperation,
    item: any,
    context: KeystoneContext,
    mutationState: { afterChangeStack: any[]; transaction: {} }
  ) {
    const { refList, refField } = this.tryResolveRefList();
    const listInfo = {
      local: { list: this.getListByKey(this.listKey)!, field: this },
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
        currentValue: []
      });
    }

    let currentValue: string | string[];
    if (this.many) {
      const info = { fieldName: this.path };
      const _currentValue = item
        ? await refList.listQuery(
            {},
            { ...context, getListAccessControlForUser: () => true },
            info.fieldName,
            info,
            { fromList: this.getListByKey(this.listKey), fromId: item.id, fromField: this.path }
          )
        : [];
      currentValue = _currentValue.map(({ id }) => id.toString());
    } else {
      // @ts-ignore
      currentValue = item && (item[this.adapter.idPath] || (item[this.path] && item[this.path].id));
      currentValue = currentValue && currentValue.toString();
    }

    // Collect the IDs to be connected and disconnected. This step may trigger
    // createMutation calls in order to obtain these IDs if required.
    const localList = listInfo.local.list;
    const localField = listInfo.local.field;
    const target = `${localList.key}.${localField.path}<${refList.key}>`;
    const input = cleanAndValidateInput({ input: operations, many: this.many, localField, target });
    let resolved: { create: string[]; connect: string[]; disconnect: string[] };
    if (this.many) {
      resolved = await resolveNestedMany({
        currentValue: currentValue as string[],
        refList: listInfo.foreign.list,
        input,
        context,
        localField,
        target,
        mutationState,
      });
    } else {
      resolved = await resolveNestedSingle({
        currentValue: currentValue as string | undefined,
        refList: listInfo.foreign.list,
        input,
        context,
        localField,
        target,
        mutationState,
      });
    }
    const { create, connect, disconnect } = resolved;
    return { create, connect, disconnect, currentValue };
  }

  getGqlAuxTypes({ schemaName }: { schemaName: string }) {
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
  gqlUpdateInputFields({ schemaName }: { schemaName: string }) {
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
  gqlCreateInputFields({ schemaName }: { schemaName: string }) {
    return this.gqlUpdateInputFields({ schemaName });
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

export class PrismaRelationshipInterface<P extends string> extends PrismaFieldAdapter<P> {
  idPath: string;
  isUnique: boolean;
  isIndexed: boolean;
  refFieldPath?: string;
  constructor(
    fieldName: string,
    path: P,
    field: Relationship<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
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

  getQueryConditions<T>(dbPath: string) {
    return {
      [`${this.path}_is_null`]: (value: T | null) =>
        value ? { [dbPath]: null } : { NOT: { [dbPath]: null } },
    };
  }
}
