import { humanize } from '../../../lib/utils';
import {
  fieldType,
  FieldTypeFunc,
  BaseGeneratedListTypes,
  CommonFieldConfig,
  graphql,
  orderDirectionEnum,
  Decimal,
  filters,
  FieldData,
} from '../../../types';
import { resolveView } from '../../resolve-view';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';

export type DecimalFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    validation?: {
      min?: string;
      max?: string;
      isRequired?: boolean;
    };
    precision?: number;
    scale?: number;
    defaultValue?: string;
    isIndexed?: boolean | 'unique';
    graphql?: { create?: { isNonNull?: boolean } };
  } & (
      | { isNullable?: true }
      | {
          isNullable: false;
          graphql?: { read?: { isNonNull?: boolean } };
        }
    );

function parseDecimalValueOption(meta: FieldData, value: string, name: string) {
  let decimal: Decimal;
  try {
    decimal = new Decimal(value);
  } catch (err) {
    throw new Error(
      `The decimal field at ${meta.listKey}.${meta.fieldKey} specifies ${name}: ${value}, this is not valid decimal value.`
    );
  }
  if (!decimal.isFinite()) {
    throw new Error(
      `The decimal field at ${meta.listKey}.${meta.fieldKey} specifies ${name}: ${value} which is not finite but ${name} must be finite.`
    );
  }
  return decimal;
}

export const decimal =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    precision = 18,
    scale = 4,
    validation,
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

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    const max =
      validation?.max === undefined
        ? undefined
        : parseDecimalValueOption(meta, validation.max, 'validation.max');
    const min =
      validation?.max === undefined
        ? undefined
        : parseDecimalValueOption(meta, validation.max, 'validation.max');

    if (min !== undefined && max !== undefined && max.greaterThanOrEqualTo(min)) {
      throw new Error(
        `The decimal field at ${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`
      );
    }

    if (defaultValue !== undefined) {
      parseDecimalValueOption(meta, defaultValue, 'defaultValue');
    }

    if (config.isNullable === false) {
      assertReadIsNonNullAllowed(meta, config);
    }
    assertCreateIsNonNullAllowed(meta, config);

    const index = isIndexed === true ? 'index' : isIndexed || undefined;
    const dbField = {
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Decimal',
      nativeType: `Decimal(${precision}, ${scale})`,
      index,
      default:
        defaultValue === undefined ? undefined : { kind: 'literal' as const, value: defaultValue },
    } as const;
    return fieldType(dbField)({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const val: Decimal | null | undefined = args.resolvedData[meta.fieldKey];

          if ((val === null || (val !== undefined && val.isNaN())) && validation?.isRequired) {
            args.addValidationError(`${fieldLabel} is required`);
          }
          if (val != null) {
            if (min !== undefined && val.lessThan(min)) {
              args.addValidationError(`${fieldLabel} must be greater than or equal to ${min}`);
            }

            if (max !== undefined && val.greaterThan(max)) {
              args.addValidationError(`${fieldLabel} must be less than or equal to ${max}`);
            }
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Decimal.optional }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({ type: graphql.Decimal }),
          resolve(val) {
            if (val === undefined) {
              if (defaultValue === undefined) {
                return null;
              }
              return new Decimal(defaultValue);
            }
            return val;
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.Decimal }),
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
        defaultValue: defaultValue ?? null,
        precision,
        scale,
      }),
    });
  };
