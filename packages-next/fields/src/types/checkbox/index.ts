import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type CheckboxFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  defaultValue?: FieldDefaultValue<boolean>;
  isRequired?: boolean;
};

export const checkbox = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: CheckboxFieldConfig<TGeneratedListTypes> = {}
): FieldTypeFunc => () => {
  if (config.index === 'unique') {
    throw Error("{ index: 'unique' } is not a supported option for field type checkbox");
  }

  return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'Boolean' })({
    ...config,
    input: {
      create: { arg: types.arg({ type: types.Boolean }) },
      update: { arg: types.arg({ type: types.Boolean }) },
      orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
    },
    output: types.field({
      type: types.Boolean,
    }),
    views: resolveView('checkbox/views'),
  });
};
