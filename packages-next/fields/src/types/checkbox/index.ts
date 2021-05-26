import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  filters,
  legacyFilters,
  orderDirectionEnum,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<boolean>;
    isRequired?: boolean;
  };

export const checkbox =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    ...config
  }: CheckboxFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).index === 'unique') {
      throw Error("{ index: 'unique' } is not a supported option for field type checkbox");
    }

    return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'Boolean' })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].Boolean.optional }) },
        create: { arg: types.arg({ type: types.Boolean }) },
        update: { arg: types.arg({ type: types.Boolean }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({
        type: types.Boolean,
      }),
      views: resolveView('checkbox/views'),
      __legacy: {
        filters: {
          fields: legacyFilters.fields.equalityInputFields(meta.fieldKey, types.Boolean),
          impls: legacyFilters.impls.equalityConditions(meta.fieldKey),
        },
        isRequired,
        defaultValue,
      },
    });
  };
