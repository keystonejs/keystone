import { humanize } from '../../../lib/utils';
import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
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

export type BigIntFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique';
    defaultValue?: bigint | { kind: 'autoincrement' };
    validation?: {
      isRequired?: boolean;
      min?: bigint;
      max?: bigint;
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

export const bigInt =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    defaultValue: _defaultValue,
    validation,
    ...config
  }: BigIntFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    const defaultValue = _defaultValue ?? null;
    const hasAutoIncDefault =
      typeof defaultValue == 'object' &&
      defaultValue !== null &&
      defaultValue.kind === 'autoincrement';

    const isNullable = getResolvedIsNullable(validation, config.db);

    if (hasAutoIncDefault) {
      if (meta.provider === 'sqlite' || meta.provider === 'mysql') {
        throw new Error(
          `The bigInt field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' }, this is not supported on ${meta.provider}`
        );
      }
      if (isNullable !== false) {
        throw new Error(
          `The bigInt field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' } but doesn't specify db.isNullable: false.\n` +
            `Having nullable autoincrements on Prisma currently incorrectly creates a non-nullable column so it is not allowed.\n` +
            `https://github.com/prisma/prisma/issues/8663`
        );
      }
    }

    if (
      validation?.min !== undefined &&
      validation?.max !== undefined &&
      validation.min > validation.max
    ) {
      throw new Error(
        `The bigInt field at ${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`
      );
    }

    assertReadIsNonNullAllowed(meta, config, isNullable);

    assertCreateIsNonNullAllowed(meta, config);

    const mode = isNullable === false ? 'required' : 'optional';

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'BigInt',
      // This will resolve to 'index' if the boolean is true, otherwise other values - false will be converted to undefined
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'bigint'
          ? { kind: 'literal', value: defaultValue }
          : defaultValue?.kind === 'autoincrement'
          ? { kind: 'autoincrement' }
          : undefined,
      map: config.db?.map,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const value = args.resolvedData[meta.fieldKey];

          if (
            (validation?.isRequired || isNullable === false) &&
            (value === null ||
              (args.operation === 'create' && value === undefined && !hasAutoIncDefault))
          ) {
            args.addValidationError(`${fieldLabel} is required`);
          }
          if (typeof value === 'number') {
            if (validation?.min !== undefined && value < validation.min) {
              args.addValidationError(
                `${fieldLabel} must be greater than or equal to ${validation.min}`
              );
            }

            if (validation?.max !== undefined && value > validation.max) {
              args.addValidationError(
                `${fieldLabel} must be less than or equal to ${validation.max}`
              );
            }
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.BigInt }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].BigInt[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull
              ? graphql.nonNull(graphql.BigInt)
              : graphql.BigInt,
            defaultValue:
              config.graphql?.create?.isNonNull && typeof defaultValue === 'bigint'
                ? defaultValue
                : undefined,
          }),
          resolve(value) {
            if (value === undefined && typeof defaultValue === 'bigint') {
              return defaultValue;
            }
            return value;
          },
        },
        update: { arg: graphql.arg({ type: graphql.BigInt }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull ? graphql.nonNull(graphql.BigInt) : graphql.BigInt,
      }),
      views: resolveView('bigInt/views'),
      getAdminMeta() {
        return {
          validation: {
            min: validation?.min === undefined ? null : validation.min.toString(),
            max: validation?.max === undefined ? null : validation.max.toString(),
            isRequired: validation?.isRequired ?? false,
          },
          defaultValue: typeof defaultValue === 'bigint' ? defaultValue.toString() : defaultValue,
        };
      },
    });
  };
