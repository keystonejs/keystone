import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Checkbox, PrismaCheckboxInterface } from './Implementation';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  FieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<boolean>;
    isRequired?: boolean;
  };

export const checkbox = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: CheckboxFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Checkbox',
    implementation: Checkbox,
    adapter: PrismaCheckboxInterface,
  },
  config,
  views: resolveView('checkbox/views'),
});
