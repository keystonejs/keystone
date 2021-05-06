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

export type RelationshipFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  many?: boolean;
  ref: string;
  ui?: {
    hideCreate?: boolean;
  };
} & (SelectDisplayConfig | CardsDisplayConfig);

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
          : {
              displayMode: 'select',
              refLabelField: adminMetaRoot.listsByKey[listKey].labelField,
            }),
      };
    },
  };
  if (many) {
    return fieldType({ kind: 'relation', mode: 'many', list: listKey, field: fieldKey })({
      ...commonConfig,
      output: types.field({
        args: getFindManyArgs(meta.lists[listKey].types),
        type: types.nonNull(types.list(types.nonNull(meta.lists[listKey].types.output))),
        resolve({ value }, args) {
          return value.findMany(args);
        },
      }),
      extraOutputFields: {
        [`_${meta.fieldKey}Meta`]: types.field({
          type: QueryMeta,
          args: getFindManyArgs(meta.lists[listKey].types),
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
    output: types.field({
      type: meta.lists[listKey].types.output,
      resolve({ value }) {
        return value();
      },
    }),
  });
};
