import {
  fieldType,
  FieldTypeFunc,
  BaseGeneratedListTypes,
  CommonFieldConfig,
  schema,
  orderDirectionEnum,
  Decimal,
  legacyFilters,
  FieldDefaultValue,
  filters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type DecimalFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isRequired?: boolean;
    precision?: number;
    scale?: number;
    defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
    isIndexed?: boolean;
    isUnique?: boolean;
  };

export const decimal =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    precision = 18,
    scale = 4,
    isRequired,
    defaultValue,
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
    const index = getIndexType({ isIndexed, isUnique });

    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Decimal',
      nativeType: `Decimal(${precision}, ${scale})`,
      index,
    })({
      ...config,
      input: {
        where: {
          arg: schema.arg({ type: filters[meta.provider].Decimal.optional }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: schema.arg({ type: schema.String }),
          resolve(val) {
            if (val == null) return val;
            return new Decimal(val);
          },
        },
        update: {
          arg: schema.arg({ type: schema.String }),
          resolve(val) {
            if (val == null) return val;
            return new Decimal(val);
          },
        },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.String,
        resolve({ value }) {
          if (value === null) return null;
          return value.toFixed(scale);
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
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.String),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.String),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey),
          },
        },
        isRequired,
        defaultValue,
      },
    });
  };
