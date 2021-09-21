import { humanize } from '../../../lib/utils';
import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  graphql,
  filters,
} from '../../../types';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';

export type IntegerFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: number | { kind: 'autoincrement' };
    isIndexed?: boolean | 'unique';
    validation?: {
      isRequired?: boolean;
      min?: number;
      max?: number;
    };
    graphql?: {
      create?: {
        isNonNull?: boolean;
      };
    };
  } & ({ isNullable?: true } | { isNullable: false; graphql?: { read?: { isNonNull?: boolean } } });

// These are the max and min ints available to a 32 bit number
const MAX_INT = 2147483647;
const MIN_INT = -2147483648;

export const integer =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    defaultValue: _defaultValue,
    validation,
    ...config
  }: IntegerFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const defaultValue = _defaultValue ?? null;
    if (
      typeof defaultValue === 'object' &&
      defaultValue !== null &&
      defaultValue.kind === 'autoincrement'
    ) {
      if (meta.provider === 'sqlite') {
        throw new Error(
          `The integer field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' }, this is not supported on SQLite`
        );
      }
      if (config.isNullable !== false) {
        throw new Error(
          `The integer field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' } but doesn't specify isNullable: false.\n` +
            `Having nullable autoincrements on Prisma currently incorrectly creates a non-nullable column so it is not allowed.\n` +
            `https://github.com/prisma/prisma/issues/8663`
        );
      }
      if (validation?.isRequired) {
        throw new Error(
          `The integer field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' } and validation.isRequired: true, this is not allowed`
        );
      }
    }

    if (validation?.min !== undefined && !Number.isInteger(validation.min)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.min: ${validation.min} but it must be an integer`
      );
    }
    if (validation?.max !== undefined && !Number.isInteger(validation.max)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.max: ${validation.max} but it must be an integer`
      );
    }

    if (validation?.min !== undefined && (validation?.min > MAX_INT || validation?.min < MIN_INT)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.min: ${validation.min} which is outside of the range of a 32bit signed integer(${MIN_INT} - ${MAX_INT}) which is not allowed`
      );
    }
    if (validation?.max !== undefined && (validation?.max > MAX_INT || validation?.max < MIN_INT)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.max: ${validation.max} which is outside of the range of a 32bit signed integer(${MIN_INT} - ${MAX_INT}) which is not allowed`
      );
    }

    if (
      validation?.min !== undefined &&
      validation?.max !== undefined &&
      validation.min > validation.max
    ) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`
      );
    }

    if (config.isNullable === false) {
      assertReadIsNonNullAllowed(meta, config);
    }
    assertCreateIsNonNullAllowed(meta, config);

    const mode = config.isNullable === false ? 'required' : 'optional';

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'Int',
      // This will resolve to 'index' if the boolean is true, otherwise other values - false will be converted to undefined
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'number'
          ? { kind: 'literal', value: defaultValue }
          : defaultValue?.kind === 'autoincrement'
          ? { kind: 'autoincrement' }
          : undefined,
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
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Int }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Int[mode] }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull ? graphql.nonNull(graphql.Int) : graphql.Int,
          }),
          resolve(value) {
            if (value === undefined && typeof defaultValue === 'number') {
              return defaultValue;
            }
            return value;
          },
        },
        update: { arg: graphql.arg({ type: graphql.Int }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type:
          config.isNullable === false && config.graphql?.read?.isNonNull
            ? graphql.nonNull(graphql.Int)
            : graphql.Int,
      }),
      views: resolveView('integer/views'),
      getAdminMeta() {
        return {
          validation: {
            min: validation?.min ?? MIN_INT,
            max: validation?.max ?? MAX_INT,
            isRequired: validation?.isRequired ?? false,
          },
          defaultValue:
            defaultValue === null || typeof defaultValue === 'number'
              ? defaultValue
              : 'autoincrement',
        };
      },
    });
  };
