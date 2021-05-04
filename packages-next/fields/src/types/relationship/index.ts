import {
  FieldType,
  BaseGeneratedListTypes,
  FieldDefaultValue,
  FieldTypeFunc,
  fieldType,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';
import { Relationship, PrismaRelationshipInterface } from './Implementation';

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
  many,
  ref,
  ...config
}: RelationshipFieldConfig<TGeneratedListTypes>): FieldTypeFunc => meta => {
  const [listKey, fieldKey] = ref.split('.');
  if (many) {
    return fieldType({ kind: 'relation', mode: 'many', list: listKey, field: fieldKey })({
      output: types.field({
        // args:meta.
        type: types.nonNull(types.list(types.nonNull(meta.lists[listKey].types.output))),
        resolve() {},
      }),
    });
  }
};

const x = {
  type: {
    type: 'Relationship',
    isRelationship: true, // Used internally for this special case
    implementation: Relationship,
    adapter: PrismaRelationshipInterface,
  },
  config,
  views: resolveView('relationship/views'),
  getAdminMeta: (
    listKey,
    path,
    adminMetaRoot
  ): Parameters<
    typeof import('@keystone-next/fields/types/relationship/views').controller
  >[0]['fieldMeta'] => {
    const refListKey = config.ref.split('.')[0];
    if (!adminMetaRoot.listsByKey[refListKey]) {
      throw new Error(`The ref [${config.ref}] on relationship [${listKey}.${path}] is invalid`);
    }
    return {
      refListKey,
      many: config.many ?? false,
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
            refLabelField: adminMetaRoot.listsByKey[refListKey].labelField,
          }),
    };
  },
};
