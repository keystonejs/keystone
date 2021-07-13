import {
  BaseGeneratedListTypes,
  FieldData,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  schema,
  filters,
} from '@keystone-next/types';
// @ts-ignore
import inflection from 'inflection';
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
          where: { arg: schema.arg({ type: filters[meta.provider].Int.optional }) },
          create: { arg: schema.arg({ type: schema.Int }) },
          update: { arg: schema.arg({ type: schema.Int }) },
          orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
        },
        output: schema.field({ type: schema.Int }),
        __legacy: { filters: getFilters(meta, schema.Int), defaultValue, isRequired },
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
          where: { arg: schema.arg({ type: filters[meta.provider].enum(graphQLType).optional }) },
          create: { arg: schema.arg({ type: graphQLType }) },
          update: { arg: schema.arg({ type: graphQLType }) },
          orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
        },
        output: schema.field({
          type: graphQLType,
        }),
        __legacy: { filters: getFilters(meta, graphQLType), defaultValue, isRequired },
      });
    }
    return fieldType({ kind: 'scalar', scalar: 'String', mode: 'optional', index })({
      ...commonConfig,
      input: {
        where: { arg: schema.arg({ type: filters[meta.provider].String.optional }) },
        create: { arg: schema.arg({ type: schema.String }) },
        update: { arg: schema.arg({ type: schema.String }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.String,
      }),
      __legacy: { filters: getFilters(meta, schema.String), defaultValue, isRequired },
    });
  };

const getFilters = (meta: FieldData, type: schema.ScalarType<any> | schema.EnumType<any>) => ({
  fields: {
    ...legacyFilters.fields.equalityInputFields(meta.fieldKey, type),
    ...legacyFilters.fields.inInputFields(meta.fieldKey, type),
  },
  impls: {
    ...legacyFilters.impls.equalityConditions(meta.fieldKey),
    ...legacyFilters.impls.inConditions(meta.fieldKey),
  },
});
