import { humanize } from '../../../lib/utils';
import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '../../../types';
import { graphql } from '../../..';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';
import { TimestampFieldMeta } from './views';

export type TimestampFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isIndexed?: boolean | 'unique';
    validation?: {
      isRequired?: boolean;
    };
    defaultValue?: string | { kind: 'now' };
    graphql?: {
      create?: {
        isNonNull?: boolean;
      };
    };
    db?: {
      updatedAt?: boolean;
    };
  } & (
      | { isNullable?: true }
      | {
          isNullable: false;
          graphql?: { read?: { isNonNull?: boolean } };
        }
    );

export const timestamp =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    validation,
    defaultValue,
    ...config
  }: TimestampFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if (typeof defaultValue === 'string') {
      try {
        graphql.DateTime.graphQLType.parseValue(defaultValue);
      } catch (err) {
        throw new Error(
          `The timestamp field at ${meta.listKey}.${
            meta.fieldKey
          } specifies defaultValue: ${defaultValue} but values must be provided as a full ISO8601 date-time string such as ${new Date().toISOString()}`
        );
      }
    }
    const parsedDefaultValue =
      typeof defaultValue === 'string'
        ? (graphql.DateTime.graphQLType.parseValue(defaultValue) as Date)
        : defaultValue;
    if (config.isNullable === false) {
      assertReadIsNonNullAllowed(meta, config);
    }
    assertCreateIsNonNullAllowed(meta, config);

    const mode = config.isNullable === false ? 'required' : 'optional';

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'DateTime',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'string'
          ? {
              kind: 'literal',
              value: defaultValue,
            }
          : defaultValue === undefined
          ? undefined
          : { kind: 'now' },
      updatedAt: config.db?.updatedAt,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const value = args.resolvedData[meta.fieldKey];
          if ((validation?.isRequired || config.isNullable === false) && value === null) {
            args.addValidationError(`${fieldLabel} is required`);
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].DateTime[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull
              ? graphql.nonNull(graphql.DateTime)
              : graphql.DateTime,
            defaultValue:
              config.graphql?.create?.isNonNull && parsedDefaultValue instanceof Date
                ? parsedDefaultValue
                : undefined,
          }),
          resolve(val) {
            if (val === undefined) {
              if (parsedDefaultValue === undefined && config.db?.updatedAt) {
                return undefined;
              }
              if (parsedDefaultValue instanceof Date || parsedDefaultValue === undefined) {
                val = parsedDefaultValue ?? null;
              } else {
                val = new Date();
              }
            }
            return val;
          },
        },
        update: { arg: graphql.arg({ type: graphql.DateTime }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type:
          config.isNullable === false && config.graphql?.read?.isNonNull
            ? graphql.nonNull(graphql.DateTime)
            : graphql.DateTime,
      }),
      views: resolveView('timestamp/views'),
      getAdminMeta(): TimestampFieldMeta {
        return {
          defaultValue: defaultValue ?? null,
          isRequired: validation?.isRequired ?? false,
          updatedAt: config.db?.updatedAt ?? false,
        };
      },
    });
  };
