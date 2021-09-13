import inflection from 'inflection';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
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
          options: { label: string; value: string }[];
          dataType?: 'string' | 'enum';
          defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
        }
      | {
          options: { label: string; value: number }[];
          dataType: 'integer';
          defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
        }
    ) & {
      ui?: {
        displayMode?: 'select' | 'segmented-control';
      };
      isRequired?: boolean;
      isIndexed?: boolean | 'unique';
    };

export const select =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    ui: { displayMode = 'select', ...ui } = {},
    isRequired,
    defaultValue,
    ...config
  }: SelectFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    const commonConfig = {
      ...config,
      ui,
      views: resolveView('select/views'),
      getAdminMeta: () => ({
        options: config.options,
        dataType: config.dataType ?? 'string',
        displayMode: displayMode,
      }),
    };

    const index = isIndexed === true ? 'index' : isIndexed || undefined;

    if (config.dataType === 'integer') {
      return fieldType({
        kind: 'scalar',
        scalar: 'Int',
        mode: 'optional',
        index,
      })({
        ...commonConfig,
        input: {
          where: {
            arg: graphql.arg({ type: filters[meta.provider].Int.optional }),
            resolve: filters.resolveCommon,
          },
          create: { arg: graphql.arg({ type: graphql.Int }) },
          update: { arg: graphql.arg({ type: graphql.Int }) },
          orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
        },
        output: graphql.field({ type: graphql.Int }),
        __legacy: { defaultValue, isRequired },
      });
    }
    if (config.dataType === 'enum') {
      const enumName = `${meta.listKey}${inflection.classify(meta.fieldKey)}Type`;
      const graphQLType = graphql.enum({
        name: enumName,
        values: graphql.enumValues(config.options.map(x => x.value)),
      });
      // i do not like this "let's just magically use strings on sqlite"
      return fieldType(
        meta.provider === 'sqlite'
          ? { kind: 'scalar', scalar: 'String', mode: 'optional', index }
          : {
              kind: 'enum',
              values: config.options.map(x => x.value),
              mode: 'optional',
              name: enumName,
              index,
            }
      )({
        ...commonConfig,
        input: {
          where: {
            arg: graphql.arg({ type: filters[meta.provider].enum(graphQLType).optional }),
            resolve: filters.resolveCommon,
          },
          create: { arg: graphql.arg({ type: graphQLType }) },
          update: { arg: graphql.arg({ type: graphQLType }) },
          orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
        },
        output: graphql.field({
          type: graphQLType,
        }),
        __legacy: { defaultValue, isRequired },
      });
    }
    return fieldType({ kind: 'scalar', scalar: 'String', mode: 'optional', index })({
      ...commonConfig,
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].String.optional }),
          resolve: filters.resolveString,
        },
        create: { arg: graphql.arg({ type: graphql.String }) },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
      }),
      __legacy: { defaultValue, isRequired },
    });
  };
