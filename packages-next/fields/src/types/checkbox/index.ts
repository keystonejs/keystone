import { Checkbox } from '@keystonejs/fields';
import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  defaultValue?: boolean;
};

const views = resolveView('checkbox/views');

export const checkbox = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: CheckboxFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: Checkbox,
  config: config,
  views,
  getBackingType(path) {
    return {
      [path]: {
        optional: true,
        type: 'boolean | null',
      },
    };
  },
});
