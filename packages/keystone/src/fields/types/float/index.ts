// Float in GQL: A signed double-precision floating-point value.
import { humanize } from '../../../lib/utils';
import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  CommonFieldConfig,
  graphql,
  fieldType,
  orderDirectionEnum,
  filters,
} from '../../../types';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';

export type FloatFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: number;
    isIndexed?: boolean | 'unique';
    isNullable?: boolean;
    validation?: {
      min?: number;
      max?: number;
      isRequired?: boolean;
    };
    graphql?: {
      create?: {
        isNonNull?: boolean;
      };
      read?: {
        isNonNull?: boolean;
      };
    };
  };

export const float =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    validation,
    defaultValue,
    ...config
  }: FloatFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    // let us think about states and errors

    // Min value too low/high
    // Max value too low/high

    if (defaultValue !== undefined && typeof defaultValue !== 'number') {
      throw new Error(
        `The float field at ${meta.listKey}.${meta.fieldKey} specifies a default value of: ${defaultValue} but it must be a valid number`
      );
    }

    if (validation?.min !== undefined && typeof validation.min !== 'number') {
      throw new Error(
        `The float field at ${meta.listKey}.${meta.fieldKey} specifies validation.min: ${validation.min} but it must be a valid number`
      );
    }

    if (validation?.max !== undefined && typeof validation.min !== 'number') {
      throw new Error(
        `The float field at ${meta.listKey}.${meta.fieldKey} specifies validation.max: ${validation.max} but it must be a valid number`
      );
    }

    if (
      validation?.min !== undefined &&
      validation?.max !== undefined &&
      validation.min > validation.max
    ) {
      throw new Error(
        `The float field at ${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`
      );
    }

    assertReadIsNonNullAllowed(meta, config);
    assertCreateIsNonNullAllowed(meta, config);

    const mode = config.isNullable === false ? 'required' : 'optional';

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'Float',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'number' ? { kind: 'literal', value: defaultValue } : undefined,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const value = args.resolvedData[meta.fieldKey];

          if (
            validation?.isRequired &&
            (value === null || (args.operation === 'create' && value === undefined))
          ) {
            args.addValidationError(`${fieldLabel} is required`);
          }

          if (typeof value === 'number') {
            if (validation?.max !== undefined && value > validation.max) {
              args.addValidationError(
                `${fieldLabel} must be less than or equal to ${validation.max}`
              );
            }

            if (validation?.min !== undefined && value < validation.min) {
              args.addValidationError(
                `${fieldLabel} must be greater than or equal to ${validation.min}`
              );
            }
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Float[mode] }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull
              ? graphql.nonNull(graphql.Float)
              : graphql.Float,
            defaultValue:
              config.graphql?.create?.isNonNull && typeof defaultValue === 'number'
                ? defaultValue
                : undefined,
          }),
          resolve(value) {
            if (value === undefined && typeof defaultValue === 'number') {
              return defaultValue;
            }
            return value;
          },
        },
        update: { arg: graphql.arg({ type: graphql.Float }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull ? graphql.nonNull(graphql.Float) : graphql.Float,
      }),
      views: resolveView('float/views'),
      getAdminMeta() {
        return {
          validation: {
            min: validation?.min ?? 0,
            max: validation?.max ?? 0,
            isRequired: validation?.isRequired ?? false,
          },
          defaultValue: defaultValue ?? null,
        };
      },
      __legacy: { isRequired: validation?.isRequired, defaultValue },
    });
  };
