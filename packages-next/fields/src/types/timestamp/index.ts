import {
  BaseGeneratedListTypes,
  fieldType,
  types,
  FieldTypeFunc,
  orderDirectionEnum,
  filters,
  legacyFilters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type TimestampFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    index?: 'index' | 'unique';
  };

export const timestamp =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    ...config
  }: TimestampFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const inputResolver = (value: string | null | undefined) => {
      if (value === null || value === undefined) {
        return value;
      }
      return new Date(value);
    };
    return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'DateTime', index })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].DateTime.optional }) },
        create: { arg: types.arg({ type: types.String }), resolve: inputResolver },
        update: { arg: types.arg({ type: types.String }), resolve: inputResolver },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({
        type: types.String,
        resolve({ value }) {
          if (value === null) return null;
          return value.toISOString();
        },
      }),
      views: resolveView('timestamp/views'),
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, types.String),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, types.String),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, types.String),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey),
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
      },
    });
  };
