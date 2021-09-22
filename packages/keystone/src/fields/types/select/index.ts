import inflection from 'inflection';
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
// @ts-ignore
import { resolveView } from '../../resolve-view';

export type SelectFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> &
    (
      | {
          /**
           * When a value is provided as just a string, it will be formatted in the same way
           * as field labels are to create the label.
           */
          options: ({ label: string; value: string } | string)[];

          /**
           * If `enum` is provided on SQLite, it will use an enum in GraphQL but a string in the database.
           */
          type?: 'string' | 'enum';
          defaultValue?: string;
        }
      | {
          options: { label: string; value: number }[];
          type: 'integer';
          defaultValue?: number;
        }
    ) & {
      ui?: {
        displayMode?: 'select' | 'segmented-control';
      };
      /**
       * @default true
       */
      isNullable?: boolean;
      validation?: {
        /**
         * @default false
         */
        isRequired?: boolean;
      };
      isIndexed?: boolean | 'unique';
    };

export const select =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    ui: { displayMode = 'select', ...ui } = {},
    isNullable = true,
    defaultValue: _defaultValue,
    ...config
  }: SelectFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    const commonConfig = {
      ...config,
      ui,
      views: resolveView('select/views'),
      getAdminMeta: () => ({
        options: config.options,
        kind: config.type ?? 'string',
        displayMode: displayMode,
        isRequired: config.validation?.isRequired ?? false,
      }),
    };

    const defaultValue = _defaultValue ?? null;

    const mode = isNullable === false ? 'required' : 'optional';
    const commonDbFieldOptions = {
      mode,
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        defaultValue === null
          ? undefined
          : { kind: 'literal' as const, value: defaultValue as any },
    } as const;

    const options = config.options.map(option => {
      if (typeof option === 'string') {
        return {
          label: humanize(option),
          value: option,
        };
      }
      return option;
    });

    const enumName = `${meta.listKey}${inflection.classify(meta.fieldKey)}Type`;

    const dbField =
      config.type === 'integer'
        ? ({ kind: 'scalar', scalar: 'String', ...commonDbFieldOptions } as const)
        : config.type === 'enum' && meta.provider !== 'sqlite'
        ? ({
            kind: 'enum',
            values: options.map(x => x.value as string),
            name: enumName,
            ...commonDbFieldOptions,
          } as const)
        : ({ kind: 'scalar', scalar: 'String', ...commonDbFieldOptions } as const);

    const graphQLType =
      config.type === 'integer'
        ? graphql.Int
        : config.type === 'enum'
        ? graphql.enum({
            name: enumName,
            values: graphql.enumValues(options.map(x => x.value as string)),
          })
        : graphql.String;

    const values = new Set(options.map(x => x.value));

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    return fieldType(dbField)({
      ...commonConfig,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const value = args.resolvedData[meta.fieldKey];
          if (value != null) {
            if (!values.has(value)) {
              args.addValidationError(`${value} is not a possible value for ${fieldLabel}`);
            }
          }
          if (
            config.validation?.isRequired &&
            (value === null || (value === undefined && args.operation === 'create'))
          ) {
            args.addValidationError(`${fieldLabel} is required`);
          }
          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        where: (config.type === undefined || config.type === 'string'
          ? {
              arg: graphql.arg({ type: filters[meta.provider].String[mode] }),
              resolve: mode === 'optional' ? filters.resolveString : undefined,
            }
          : {
              arg: graphql.arg({
                type:
                  graphQLType.kind === 'enum'
                    ? // while the enum filters are technically postgres only
                      // the enum filters are essentially a subset of
                      // the string filters so this is fine
                      filters.postgresql.enum(graphQLType)[mode]
                    : filters[meta.provider].Int[mode],
              }),
              resolve: mode === 'optional' ? filters.resolveCommon : undefined,
            }) as any,
        create: {
          arg: graphql.arg({ type: graphQLType }),
          resolve(val) {
            if (val === undefined) {
              return defaultValue;
            }
            return val;
          },
        },
        update: { arg: graphql.arg({ type: graphQLType }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphQLType }),
    });
  };
