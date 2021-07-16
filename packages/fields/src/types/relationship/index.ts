import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  CommonFieldConfig,
  fieldType,
  schema,
  AdminMetaRootVal,
  FieldDefaultValue,
  QueryMeta,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

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
    defaultValue?: FieldDefaultValue<Record<string, any>, TGeneratedListTypes>;
    withMeta?: boolean;
  } & (SelectDisplayConfig | CardsDisplayConfig | CountDisplayConfig);

export const relationship =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    many = false,
    ref,
    defaultValue,
    withMeta = true,
    ...config
  }: RelationshipFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    const [foreignListKey, foreignFieldKey] = ref.split('.');
    const commonConfig = {
      ...config,
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
        if (config.ui?.displayMode === 'cards') {
          // we're checking whether the field which will be in the admin meta at the time that getAdminMeta is called.
          // in newer versions of keystone, it will be there and it will not be there for older versions of keystone.
          // this is so that relationship fields doesn't break in confusing ways
          // if people are using a slightly older version of keystone
          const currentField = adminMetaRoot.listsByKey[meta.listKey].fields.find(
            x => x.path === meta.fieldKey
          );
          if (currentField) {
            const allForeignFields = new Set(
              adminMetaRoot.listsByKey[foreignListKey].fields.map(x => x.path)
            );
            for (const [configOption, foreignFields] of [
              ['ui.cardFields', config.ui.cardFields],
              ['ui.inlineCreate.fields', config.ui.inlineCreate?.fields ?? []],
              ['ui.inlineEdit.fields', config.ui.inlineEdit?.fields ?? []],
            ] as const) {
              for (const foreignField of foreignFields) {
                if (!allForeignFields.has(foreignField)) {
                  throw new Error(
                    `The ${configOption} option on the relationship field at ${meta.listKey}.${meta.fieldKey} includes the "${foreignField}" field but that field does not exist on the "${foreignListKey}" list`
                  );
                }
              }
            }
          }
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
                refLabelField: adminMetaRoot.listsByKey[foreignListKey].labelField,
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
    if (!meta.lists[foreignListKey]) {
      throw new Error(
        `Unable to resolve related list '${foreignListKey}' from ${meta.listKey}.${meta.fieldKey}`
      );
    }
    const listTypes = meta.lists[foreignListKey].types;
    if (many) {
      const whereInputResolve =
        (key: string) => async (value: any, resolve?: (val: any) => Promise<any>) => {
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
          create: {
            arg: schema.arg({
              type: listTypes.relateTo.many.create,
            }),
            async resolve(value, context, resolve) {
              return resolve(value);
            },
          },
          update: {
            arg: schema.arg({
              type: listTypes.relateTo.many.update,
            }),
            async resolve(value, context, resolve) {
              return resolve(value);
            },
          },
        },
        output: schema.field({
          args: listTypes.findManyArgs,
          type: schema.list(schema.nonNull(listTypes.output)),
          resolve({ value }, args) {
            return value.findMany(args);
          },
        }),
        extraOutputFields: withMeta
          ? {
              [`_${meta.fieldKey}Meta`]: schema.field({
                type: QueryMeta,
                args: listTypes.findManyArgs,
                deprecationReason: `This query will be removed in a future version. Please use ${meta.fieldKey}Count instead.`,
                resolve({ value }, args) {
                  return { getCount: () => value.count(args) };
                },
              }),
              [`${meta.fieldKey}Count`]: schema.field({
                type: schema.Int,
                args: {
                  where: schema.arg({ type: schema.nonNull(listTypes.where), defaultValue: {} }),
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
            }
          : {},
        __legacy: {
          filters: {
            fields: {
              [`${meta.fieldKey}_every`]: schema.arg({ type: listTypes.where }),
              [`${meta.fieldKey}_some`]: schema.arg({ type: listTypes.where }),
              [`${meta.fieldKey}_none`]: schema.arg({ type: listTypes.where }),
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
        create: {
          arg: schema.arg({ type: listTypes.relateTo.one.create }),
          async resolve(value, context, resolve) {
            return resolve(value);
          },
        },
        update: {
          arg: schema.arg({ type: listTypes.relateTo.one.update }),
          async resolve(value, context, resolve) {
            return resolve(value);
          },
        },
      },
      output: schema.field({
        type: listTypes.output,
        resolve({ value }) {
          return value();
        },
      }),
      __legacy: {
        filters: {
          fields: {
            [meta.fieldKey]: schema.arg({ type: listTypes.where }),
            [`${meta.fieldKey}_is_null`]: schema.arg({ type: schema.Boolean }),
          },
          impls: {
            [meta.fieldKey]: async (value: any, resolve?: (val: any) => Promise<any>) => {
              return { [meta.fieldKey]: await resolve!(value) };
            },
            [`${meta.fieldKey}_is_null`]: value =>
              value ? { [meta.fieldKey]: null } : { NOT: { [meta.fieldKey]: null } },
          },
        },
        defaultValue,
      },
    });
  };
