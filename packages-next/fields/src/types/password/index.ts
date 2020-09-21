import { Password } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';

import type { FieldType } from '@keystone-spike/types';
import type { BaseGeneratedListTypes } from '@keystone-spike/types';

export const password = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: FieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Password,
  config,
  views: '@keystone-spike/fields/src/types/password/views',
  getBackingType(path) {
    return {
      [path]: {
        optional: true,
        type: 'string | null',
      },
    };
  },
});
