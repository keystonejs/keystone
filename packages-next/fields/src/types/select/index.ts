import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  types,
} from '@keystone-next/types';
// @ts-ignore
import inflection from 'inflection';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type SelectFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> &
  (
    | {
        options: { label: string; value: string }[];
        dataType?: 'string' | 'enum';
        // defaultValue?: FieldDefaultValue<string>;
      }
    | {
        options: { label: string; value: number }[];
        dataType: 'integer';
        // defaultValue?: FieldDefaultValue<number>;
      }
  ) & {
    ui?: {
      displayMode?: 'select' | 'segmented-control';
    };
    // isRequired?: boolean;
    index?: 'index' | 'unique';
  };

export const select = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  index,
  ...config
}: SelectFieldConfig<TGeneratedListTypes>): FieldTypeFunc => meta => {
  const getAdminMeta = () => ({
    options: config.options,
    dataType: config.dataType ?? 'string',
    displayMode: config.ui?.displayMode ?? 'select',
  });
  if (config.dataType === 'integer') {
    return fieldType({
      kind: 'scalar',
      scalar: 'Int',
      mode: 'optional',
      index,
    })({
      ...config,
      views: resolveView('select/views'),
      getAdminMeta,
      ui: config.ui,
      input: {
        create: { arg: types.arg({ type: types.Int }) },
        update: { arg: types.arg({ type: types.Int }) },
      },
      output: types.field({ type: types.Int }),
    });
  }
  if (config.dataType === 'enum') {
    const enumName = `${meta.listKey}${inflection.classify(meta.fieldKey)}Type`;
    const graphQLType = types.enum({
      name: enumName,
      values: types.enumValues(config.options.map(x => x.value)),
    });
    return fieldType({
      kind: 'enum',
      values: config.options.map(x => x.value),
      mode: 'optional',
      name: enumName,
      index,
    })({
      views: resolveView('select/views'),
      getAdminMeta,
      input: {
        create: { arg: types.arg({ type: graphQLType }) },
        update: { arg: types.arg({ type: graphQLType }) },
      },
      output: types.field({
        type: graphQLType,
      }),
    });
  }
  return fieldType({
    kind: 'scalar',
    scalar: 'String',
    mode: 'optional',
    index,
  })({
    views: resolveView('select/views'),
    getAdminMeta,
    input: {
      create: { arg: types.arg({ type: types.String }) },
      update: { arg: types.arg({ type: types.String }) },
    },
    output: types.field({
      type: types.String,
    }),
  });
};
