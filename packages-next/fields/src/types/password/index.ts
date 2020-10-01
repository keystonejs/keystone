import { Password } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';

import type { FieldType } from '@keystone-spike/types';
import type { BaseGeneratedListTypes } from '@keystone-spike/types';
import { resolveView } from '../../resolve-view';

const views = resolveView('password/views');

export const password = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: FieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Password,
  config,
  views,
  getBackingType(path) {
    return {
      [path]: {
        optional: true,
        type: 'string | null',
      },
    };
  },
});
