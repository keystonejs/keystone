import {
  BaseGeneratedListTypes,
  FieldData,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  types,
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
          create: { arg: types.arg({ type: types.Int }) },
          update: { arg: types.arg({ type: types.Int }) },
          orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
        },
        output: types.field({ type: types.Int }),
        __legacy: { filters: getFilters(meta, types.Int), defaultValue, isRequired },
      });
    }
    if (config.dataType === 'enum') {
      const enumName = `${meta.listKey}${inflection.classify(meta.fieldKey)}Type`;
      const graphQLType = types.enum({
        name: enumName,
        values: types.enumValues(config.options.map(x => x.value)),
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
          create: { arg: types.arg({ type: graphQLType }) },
          update: { arg: types.arg({ type: graphQLType }) },
          orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
        },
        output: types.field({
          type: graphQLType,
        }),
        __legacy: { filters: getFilters(meta, graphQLType), defaultValue, isRequired },
      });
    }
    return fieldType({ kind: 'scalar', scalar: 'String', mode: 'optional', index })({
      ...commonConfig,
      input: {
        create: { arg: types.arg({ type: types.String }) },
        update: { arg: types.arg({ type: types.String }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({
        type: types.String,
      }),
      __legacy: { filters: getFilters(meta, types.String), defaultValue, isRequired },
    });
  };

const getFilters = (meta: FieldData, type: types.ScalarType<any> | types.EnumType<any>) => ({
  fields: {
    ...legacyFilters.fields.equalityInputFields(meta.fieldKey, type),
    ...legacyFilters.fields.inInputFields(meta.fieldKey, type),
  },
  impls: {
    ...legacyFilters.impls.equalityConditions(meta.fieldKey),
    ...legacyFilters.impls.inConditions(meta.fieldKey),
  },
});
