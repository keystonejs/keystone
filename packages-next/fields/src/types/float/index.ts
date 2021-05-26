import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  fieldType,
  types,
  orderDirectionEnum,
  filters,
  legacyFilters,
  FieldDefaultValue,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type FloatFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    index?: 'index' | 'unique';
    defaultValue?: FieldDefaultValue<number>;
    isRequired?: boolean;
  };

export const float =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    isRequired,
    defaultValue,
    ...config
  }: FloatFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Float',
      index,
    })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].Float.optional }) },
        uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.Float }) } : undefined,
        create: { arg: types.arg({ type: types.Float }) },
        update: { arg: types.arg({ type: types.Float }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({ type: types.Float }),
      views: resolveView('float/views'),
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, types.Float),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, types.Float),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, types.Float),
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
