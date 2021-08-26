import {
  fieldType,
  FieldTypeFunc,
  BaseGeneratedListTypes,
  CommonFieldConfig,
  graphql,
  orderDirectionEnum,
  Decimal,
  FieldDefaultValue,
  filters,
} from '../../../types';
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
    const dbField = {
      kind: 'scalar' as const,
      mode: 'optional' as const,
      scalar: 'Decimal' as const,
      nativeType: `Decimal(${precision}, ${scale})`,
      index,
    };
    return fieldType(dbField)({
      ...config,
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Decimal.optional }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({ type: graphql.String }),
          resolve(val) {
            if (val == null) return val;
            return new Decimal(val);
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.String }),
          resolve(val) {
            if (val == null) return val;
            return new Decimal(val);
          },
        },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
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
      __legacy: { isRequired, defaultValue },
    });
  };
