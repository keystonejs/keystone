import {
  BaseGeneratedListTypes,
  fieldType,
  graphql,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '../../../types';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';

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

const RFC_3339_REGEX =
  /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;

function parseDate(input: string): Date {
  if (!RFC_3339_REGEX.test(input)) {
    throw new Error();
  }
  return new Date(input);
}

function inputResolver(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return value;
  }
  return parseDate(value);
}

export const timestamp =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    validation,
    defaultValue,
    ...config
  }: TimestampFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if (typeof defaultValue === 'string') {
      parseDate(defaultValue);
    }
    if (config.isNullable === false) {
      assertReadIsNonNullAllowed(meta, config);
    }
    assertCreateIsNonNullAllowed(meta, config);

    const mode = config.isNullable === false ? 'required' : 'optional';

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
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].DateTime[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull
              ? graphql.nonNull(graphql.String)
              : graphql.String,
            defaultValue:
              config.graphql?.create?.isNonNull && typeof defaultValue === 'string'
                ? defaultValue
                : undefined,
          }),
          resolve(val) {
            if (val === undefined) {
              if (typeof defaultValue === 'string' || defaultValue === undefined) {
                val = defaultValue ?? null;
              } else {
                val = new Date().toISOString();
              }
            }
            return inputResolver(val);
          },
        },
        update: { arg: graphql.arg({ type: graphql.String }), resolve: inputResolver },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
        resolve({ value }) {
          if (value === null) return null;
          return value.toISOString();
        },
      }),
      views: resolveView('timestamp/views'),
    });
  };
