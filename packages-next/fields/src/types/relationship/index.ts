import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  fieldType,
  types,
  AdminMetaRootVal,
  getFindManyArgs,
  QueryMeta,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

// This is the default display mode for Relationships
type SelectDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a Select field
    displayMode?: 'select';
    /**
     * The path of the field to use from the related list for item labels in the select.
     * Defaults to the labelField configured on the related list.
     */
    labelField?: string;
  };
};

type CardsDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a list of Cards
    displayMode: 'cards';
    /* The set of fields to render in the default Card component **/
    cardFields: string[];
    /** Causes the default Card component to render as a link to navigate to the related item */
    linkToItem?: boolean;
    /** Determines whether removing a related item in the UI will delete or unlink it */
    removeMode?: 'disconnect' | 'none'; // | 'delete';
    /** Configures inline create mode for cards (alternative to opening the create modal) */
    inlineCreate?: { fields: string[] };
    /** Configures inline edit mode for cards */
    inlineEdit?: { fields: string[] };
    /** Configures whether a select to add existing items should be shown or not */
    inlineConnect?: boolean;
  };
};

type CountDisplayConfig = {
  many: true;
  ui?: {
    // Sets the relationship to display as a count
    displayMode: 'count';
  };
};

export type RelationshipFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  many?: boolean;
  ref: string;
  ui?: {
    hideCreate?: boolean;
  };
} & (SelectDisplayConfig | CardsDisplayConfig | CountDisplayConfig);

export const relationship = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  many = false,
  ref,
  ...config
}: RelationshipFieldConfig<TGeneratedListTypes>): FieldTypeFunc => meta => {
  const [listKey, fieldKey] = ref.split('.');
  const commonConfig = {
    views: resolveView('relationship/views'),
    getAdminMeta: (
      adminMetaRoot: AdminMetaRootVal
    ): Parameters<
      typeof import('@keystone-next/fields/types/relationship/views').controller
    >[0]['fieldMeta'] => {
      if (!meta.lists[listKey]) {
        throw new Error(
          `The ref [${ref}] on relationship [${meta.listKey}.${meta.fieldKey}] is invalid`
        );
      }
      return {
        refListKey: listKey,
        many,
        hideCreate: config.ui?.hideCreate ?? false,
        ...(config.ui?.displayMode === 'cards'
          ? {
              displayMode: 'cards',
              cardFields: config.ui.cardFields,
              linkToItem: config.ui.linkToItem ?? false,
              removeMode: config.ui.removeMode ?? 'disconnect',
              inlineCreate: config.ui.inlineCreate ?? null,
              inlineEdit: config.ui.inlineEdit ?? null,
              inlineConnect: config.ui.inlineConnect ?? false,
            }
          : config.ui?.displayMode === 'count'
          ? { displayMode: 'count' }
          : {
              displayMode: 'select',
              refLabelField: adminMetaRoot.listsByKey[listKey].labelField,
            }),
      };
    },
  };
  const listTypes = meta.lists[listKey].types;
  if (many) {
    return fieldType({ kind: 'relation', mode: 'many', list: listKey, field: fieldKey })({
      ...commonConfig,
      input: {
        where: {
          arg: types.arg({ type: listTypes.manyRelationWhere }),
          async resolve(value, context, inputResolvers) {
            if (value === null) {
              throw new Error('A many relation filter cannot be set to null');
            }
            return Object.fromEntries(
              await Promise.all(
                Object.entries(value).map(async ([key, val]) => {
                  if (val === null) {
                    throw new Error(
                      `The key ${key} in a many relation filter cannot be set to null`
                    );
                  }
                  return [key, await inputResolvers[listKey].where(val!)];
                })
              )
            );
          },
        },
        create: {
          arg: types.arg({
            type: types.nonNull(listTypes.relateTo.many.create),
            defaultValue: { connect: [], create: [] },
          }),
          async resolve(value, context, inputResolvers) {
            return {
              connect: await Promise.all([
                ...value.connect.map(x => inputResolvers[listKey].uniqueWhere(x)),
                ...value.create.map(async x => ({ id: await inputResolvers[listKey].create(x) })),
              ]),
            };
          },
        },
        update: {
          arg: types.arg({
            type: types.nonNull(listTypes.relateTo.many.update),
            defaultValue: { connect: [], create: [], disconnect: [], disconnectAll: false },
          }),
          async resolve(value, context, inputResolvers) {
            const disconnects = Promise.all(
              value.disconnect.map(x => inputResolvers[listKey].uniqueWhere(x))
            );
            const connects = Promise.all([
              ...value.connect.map(x => inputResolvers[listKey].uniqueWhere(x)),
              ...value.create.map(x => inputResolvers[listKey].create(x)),
            ]);
            const [disconnect, connect] = await Promise.all([disconnects, connects]);
            if (value.disconnectAll) {
              return {
                set: connect,
              };
            }
            return {
              disconnect: disconnect as any,
              connect,
            };
          },
        },
      },
      output: types.field({
        args: getFindManyArgs(listTypes),
        type: types.nonNull(types.list(types.nonNull(listTypes.output))),
        resolve({ value }, args) {
          return value.findMany(args);
        },
      }),
      extraOutputFields: {
        [`_${meta.fieldKey}Meta`]: types.field({
          type: QueryMeta,
          args: getFindManyArgs(listTypes),
          resolve({ value }, args) {
            return {
              getCount: () => value.count(args),
            };
          },
        }),
      },
    });
  }
  return fieldType({ kind: 'relation', mode: 'one', list: listKey, field: fieldKey })({
    ...commonConfig,
    input: {
      where: {
        arg: types.arg({ type: listTypes.where }),
        resolve(value, context, inputResolvers) {
          return inputResolvers[listKey].where(value!);
        },
      },
      create: {
        arg: types.arg({ type: listTypes.relateTo.one.create }),
        async resolve(value, context, inputResolvers) {
          if (value === undefined) {
            return undefined;
          }
          if (value === null) {
            throw new Error(
              `${listTypes.relateTo.one.create.graphQLType.name} cannot be set to null`
            );
          }
          const numOfKeys = Object.keys(value).length;
          if (numOfKeys !== 1) {
            throw new Error(
              `If ${listTypes.relateTo.one.create.graphQLType.name} is passed, only one key can be passed but ${numOfKeys} must be passed`
            );
          }
          if (value.connect) {
            return {
              connect: await inputResolvers[listKey].uniqueWhere(value.connect),
            };
          }
          if (value.create) {
            return {
              connect: { id: await inputResolvers[listKey].create(value.create) },
            };
          }
        },
      },
      update: {
        arg: types.arg({ type: listTypes.relateTo.one.update }),
        async resolve(value, context, inputResolvers) {
          if (value === undefined) {
            return undefined;
          }
          if (value === null) {
            return { disconnect: true };
          }
          const numOfKeys = Object.keys(value).length;
          if (numOfKeys !== 1) {
            throw new Error(
              `If ${listTypes.relateTo.one.update.graphQLType.name} is passed, only one key can be passed but ${numOfKeys} must be passed`
            );
          }
          if (value.connect) {
            return {
              connect: await inputResolvers[listKey].uniqueWhere(value.connect),
            };
          }
          if (value.create) {
            return {
              connect: { id: await inputResolvers[listKey].create(value.create) },
            };
          }
        },
      },
    },
    output: types.field({
      type: listTypes.output,
      resolve({ value }) {
        return value();
      },
    }),
  });
};
