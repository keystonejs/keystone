import inflection from 'inflection';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  schema,
  filters,
} from '../../../types';
// @ts-ignore
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

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
      isIndexed?: boolean;
      isUnique?: boolean;
    };

export const select =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
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

    const index = getIndexType({ isIndexed, isUnique });

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
            arg: schema.arg({ type: filters[meta.provider].Int.optional }),
            resolve: filters.resolveCommon,
          },
          create: { arg: schema.arg({ type: schema.Int }) },
          update: { arg: schema.arg({ type: schema.Int }) },
          orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
        },
        output: schema.field({ type: schema.Int }),
        __legacy: { defaultValue, isRequired },
      });
    }
    if (config.dataType === 'enum') {
      const enumName = `${meta.listKey}${inflection.classify(meta.fieldKey)}Type`;
      const graphQLType = schema.enum({
        name: enumName,
        values: schema.enumValues(config.options.map(x => x.value)),
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
            arg: schema.arg({ type: filters[meta.provider].enum(graphQLType).optional }),
            resolve: filters.resolveCommon,
          },
          create: { arg: schema.arg({ type: graphQLType }) },
          update: { arg: schema.arg({ type: graphQLType }) },
          orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
        },
        output: schema.field({
          type: graphQLType,
        }),
        __legacy: { defaultValue, isRequired },
      });
    }
    return fieldType({ kind: 'scalar', scalar: 'String', mode: 'optional', index })({
      ...commonConfig,
      input: {
        where: {
          arg: schema.arg({ type: filters[meta.provider].String.optional }),
          resolve: filters.resolveString,
        },
        create: { arg: schema.arg({ type: schema.String }) },
        update: { arg: schema.arg({ type: schema.String }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.String,
      }),
      __legacy: { defaultValue, isRequired },
    });
  };
