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

export type IntegerFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    index?: 'index' | 'unique';
    defaultValue?: FieldDefaultValue<number>;
    isRequired?: boolean;
  };

export const integer =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    isRequired,
    defaultValue,
    ...config
  }: IntegerFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({ kind: 'scalar', mode: 'optional', scalar: 'Int', index })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].Int.optional }) },
        uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.Int }) } : undefined,
        create: { arg: types.arg({ type: types.Int }) },
        update: { arg: types.arg({ type: types.Int }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({ type: types.Int }),
      views: resolveView('integer/views'),
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, types.Int),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, types.Int),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, types.Int),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey),
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
        isRequired,
        defaultValue,
      },
    });
