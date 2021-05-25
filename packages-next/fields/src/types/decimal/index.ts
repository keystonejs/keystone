import {
  fieldType,
  FieldTypeFunc,
  BaseGeneratedListTypes,
  types,
  filters,
  orderDirectionEnum,
  Decimal,
  legacyFilters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type DecimalFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    // isRequired?: boolean;
    precision?: number;
    scale?: number;
    index?: 'unique' | 'index';
    // defaultValue?: FieldDefaultValue<string>;
  };

export const decimal =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    precision = 18,
    scale = 4,
    ...config
  }: DecimalFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if (meta.provider === 'sqlite') {
      throw new Error('The decimal field does not support sqlite');
    }

    if (!Number.isInteger(scale)) {
      throw new Error(
        `The scale for decimal fields must be an integer but the scale for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`
      );
    }

    if (!Number.isInteger(precision)) {
      throw new Error(
        `The precision for decimal fields must be an integer but the precision for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`
      );
    }

    if (scale > precision) {
      throw new Error(
        `The scale configured for decimal field at ${meta.listKey}.${meta.fieldKey} (${scale}) ` +
          `must not be larger than the field's precision (${precision})`
      );
    }

    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Decimal',
      nativeType: `Decimal(${precision}, ${scale})`,
      index,
    })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].Decimal.optional }) },
        uniqueWhere:
          index === 'unique'
            ? { arg: types.arg({ type: types.String }), resolve: x => new Decimal(x) }
            : undefined,
        create: {
          arg: types.arg({ type: types.String }),
          resolve(val) {
            if (val == null) return val;
            return new Decimal(val);
          },
        },
        update: {
          arg: types.arg({ type: types.String }),
          resolve(val) {
            if (val == null) return val;
            return new Decimal(val);
          },
        },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({
        type: types.String,
        resolve({ value }) {
          return value?.toString() ?? null;
        },
      }),
      views: resolveView('decimal/views'),
      getAdminMeta: () => ({
        precision,
        scale,
      }),
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, types.String),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, types.String),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey),
          },
        },
      },
    });
  };
