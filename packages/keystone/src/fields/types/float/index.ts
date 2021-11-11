// Float in GQL: A signed double-precision floating-point value.
import { humanize } from '../../../lib/utils';
import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  CommonFieldConfig,
  fieldType,
  orderDirectionEnum,
  filters,
} from '../../../types';
import { graphql } from '../../..';
import {
  assertCreateIsNonNullAllowed,
  assertReadIsNonNullAllowed,
  getResolvedIsNullable,
} from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';

export type FloatFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: number;
    isIndexed?: boolean | 'unique';
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
    db?: {
      isNullable?: boolean;
      map?: string;
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
    if (
      defaultValue !== undefined &&
      (typeof defaultValue !== 'number' || !Number.isFinite(defaultValue))
    ) {
      throw new Error(
        `The float field at ${meta.listKey}.${meta.fieldKey} specifies a default value of: ${defaultValue} but it must be a valid finite number`
      );
    }

    if (
      validation?.min !== undefined &&
      (typeof validation.min !== 'number' || !Number.isFinite(validation.min))
    ) {
      throw new Error(
        `The float field at ${meta.listKey}.${meta.fieldKey} specifies validation.min: ${validation.min} but it must be a valid finite number`
      );
    }

    if (
      validation?.max !== undefined &&
      (typeof validation.max !== 'number' || !Number.isFinite(validation.max))
    ) {
      throw new Error(
        `The float field at ${meta.listKey}.${meta.fieldKey} specifies validation.max: ${validation.max} but it must be a valid finite number`
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

    const isNullable = getResolvedIsNullable(validation, config.db);

    assertReadIsNonNullAllowed(meta, config, isNullable);

    assertCreateIsNonNullAllowed(meta, config);

    const mode = isNullable === false ? 'required' : 'optional';

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'Float',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'number' ? { kind: 'literal', value: defaultValue } : undefined,
      map: config.db?.map,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const value = args.resolvedData[meta.fieldKey];

          if ((validation?.isRequired || isNullable === false) && value === null) {
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
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Float }) } : undefined,
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
            if (value === undefined) {
              return defaultValue ?? null;
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
            min: validation?.min || null,
            max: validation?.max || null,
            isRequired: validation?.isRequired ?? false,
          },
          defaultValue: defaultValue ?? null,
        };
      },
    });
  };
