import { Relationship } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type RelationshipFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  many?: boolean;
  ref: string;
  admin?: {
    hideCreate?: boolean;
  };
};

const views = resolveView('relationship/views');

export const relationship = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: RelationshipFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Relationship,
  config,
  views,
  getAdminMeta(listKey, path, adminMeta) {
    const refListKey = config.ref.split('.')[0];
    return {
      refListKey,
      refLabelField: adminMeta.lists[refListKey].labelField,
      many: config.many ?? false,
      hideCreate: config.admin?.hideCreate ?? false,
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
