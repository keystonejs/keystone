import { Relationship } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
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
    removeMode?: 'disconnect'; // | 'delete';
    /** Configures inline create mode for cards (alternative to opening the create modal) */
    inlineCreate?: { fields: string[] };
    /** Configures inline edit mode for cards */
    inlineEdit?: { fields: string[] };
  };
};

export type RelationshipFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  many?: boolean;
  ref: string;
  ui?: {
    hideCreate?: boolean;
  };
} & (SelectDisplayConfig | CardsDisplayConfig);

const views = resolveView('relationship/views');

export const relationship = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: RelationshipFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Relationship,
  config,
  views,
  getAdminMeta(
    listKey,
    path,
    adminMeta
  ): Parameters<
    typeof import('@keystone-next/fields/types/relationship/views').controller
  >[0]['fieldMeta'] {
    const refListKey = config.ref.split('.')[0];
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
          }
        : {
            displayMode: 'select',
            refLabelField: adminMeta.lists[refListKey].labelField,
          }),
    };
  },
  getBackingType(path) {
    return {
      [path]: {
        optional: true,
        type: 'string | null',
      },
    };
  },
});
