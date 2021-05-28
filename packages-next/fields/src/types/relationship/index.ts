import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  fieldType,
  types,
  AdminMetaRootVal,
  FieldDefaultValue,
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

export type RelationshipFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    many?: boolean;
    ref: string;
    ui?: {
      hideCreate?: boolean;
    };
    defaultValue?: FieldDefaultValue<Record<string, any>>;
  } & (SelectDisplayConfig | CardsDisplayConfig | CountDisplayConfig);

export const relationship =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    many = false,
    ref,
    defaultValue,
    ...config
  }: RelationshipFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    const [foreignListKey, foreignFieldKey] = ref.split('.');
    const commonConfig = {
      views: resolveView('relationship/views'),
      getAdminMeta: (
        adminMetaRoot: AdminMetaRootVal
      ): Parameters<
        typeof import('@keystone-next/fields/types/relationship/views').controller
      >[0]['fieldMeta'] => {
        if (!meta.lists[foreignListKey]) {
          throw new Error(
            `The ref [${ref}] on relationship [${meta.listKey}.${meta.fieldKey}] is invalid`
          );
        }
        return {
          refListKey: foreignListKey,
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
                refLabelField: adminMetaRoot.listsByKey[foreignListKey].labelField,
              }),
        };
      },
    };
    const listTypes = meta.lists[foreignListKey].types;
    if (many) {
      const whereInputResolve =
        (key: string) => async (value: any, resolve?: (val: any) => Promise<any>) => {
          if (value === null) {
            throw new Error('i wonder what should happen here');
          }
          return { [meta.fieldKey]: { [key]: await resolve!(value) } };
        };
      return fieldType({
        kind: 'relation',
        mode: 'many',
        list: foreignListKey,
        field: foreignFieldKey,
      })({
        ...commonConfig,
        input: {
          where: {
            arg: types.arg({ type: listTypes.manyRelationWhere }),
            async resolve(value, context, resolve) {
              return resolve(value);
            },
          },
          create: {
            arg: types.arg({
              type: listTypes.relateTo.many.create,
            }),
            async resolve(value, context, resolve) {
              return resolve(value);
            },
          },
          update: {
            arg: types.arg({
              type: listTypes.relateTo.many.update,
            }),
            async resolve(value, context, resolve) {
              return resolve(value);
            },
          },
        },
        output: types.field({
          args: listTypes.findManyArgs,
          type: types.nonNull(types.list(types.nonNull(listTypes.output))),
          resolve({ value }, args) {
            return value.findMany(args);
          },
        }),
        extraOutputFields: {
          [`${meta.fieldKey}Count`]: types.field({
            type: types.nonNull(types.Int),
            args: {
              where: types.arg({ type: types.nonNull(listTypes.where), defaultValue: {} }),
            },
            resolve({ value }, args) {
              return value.count({
                where: args.where,
                orderBy: [],
                sortBy: undefined,
                first: undefined,
                search: undefined,
                skip: 0,
              });
            },
          }),
          [`_${meta.fieldKey}Meta`]: types.field({
            type: QueryMeta,
            args: listTypes.findManyArgs,
            resolve({ value }, args) {
              return { getCount: () => value.count(args) };
            },
          }),
        },
        __legacy: {
          filters: {
            fields: {
              [`${meta.fieldKey}_every`]: types.arg({ type: listTypes.where }),
              [`${meta.fieldKey}_some`]: types.arg({ type: listTypes.where }),
              [`${meta.fieldKey}_none`]: types.arg({ type: listTypes.where }),
            },
            impls: {
              [`${meta.fieldKey}_every`]: whereInputResolve('every'),
              [`${meta.fieldKey}_some`]: whereInputResolve('some'),
              [`${meta.fieldKey}_none`]: whereInputResolve('none'),
            },
          },
          defaultValue,
        },
      });
    }
    return fieldType({
      kind: 'relation',
      mode: 'one',
      list: foreignListKey,
      field: foreignFieldKey,
    })({
      ...commonConfig,
      input: {
        where: {
          arg: types.arg({ type: listTypes.where }),
          resolve(value, context, resolve) {
            if (value === null) {
              return null;
            }
            return resolve(value);
          },
        },
        create: {
          arg: types.arg({ type: listTypes.relateTo.one.create }),
          async resolve(value, context, resolve) {
            return resolve(value);
          },
        },
        update: {
          arg: types.arg({ type: listTypes.relateTo.one.update }),
          async resolve(value, context, resolve) {
            return resolve(value);
          },
        },
      },
      output: types.field({
        type: listTypes.output,
        resolve({ value }) {
          return value();
        },
      }),
      __legacy: {
        filters: {
          fields: {
            [`${meta.fieldKey}_is_null`]: types.arg({ type: types.Boolean }),
            [meta.fieldKey]: types.arg({ type: listTypes.where }),
          },
          impls: {
            [`${meta.fieldKey}_is_null`]: value =>
              value ? { [meta.fieldKey]: null } : { NOT: { [meta.fieldKey]: null } },
            [meta.fieldKey]: async (value: any, resolve?: (val: any) => Promise<any>) => {
              if (value === null) {
                throw new Error('i wonder what should happen here');
              }
              return { [meta.fieldKey]: await resolve!(value) };
            },
          },
        },
        defaultValue,
      },
    });
  };
