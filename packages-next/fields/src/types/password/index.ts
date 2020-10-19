import { Password } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';

import type { FieldType } from '@keystone-spike/types';
import type { BaseGeneratedListTypes } from '@keystone-spike/types';
import { resolveView } from '../../resolve-view';

const views = resolveView('password/views');

type PasswordFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  minLength?: number;
};

export const password = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: PasswordFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Password,
  config,
  views,
  getAdminMeta() {
    return {
      minLength: config.minLength !== undefined ? config.minLength : 8,
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
