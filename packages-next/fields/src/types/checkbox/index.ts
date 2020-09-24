import { Checkbox } from '@keystonejs/fields';
import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-spike/types';
import type { BaseGeneratedListTypes } from '@keystone-spike/types';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  defaultValue?: boolean;
};

export const checkbox = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: CheckboxFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Checkbox,
  config: config,
  views: '@keystone-spike/fields/src/types/checkbox/views',
  getBackingType(path) {
    return {
      [path]: {
        optional: true,
        type: 'boolean | null',
      },
    };
  },
});
