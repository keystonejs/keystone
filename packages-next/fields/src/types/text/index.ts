import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  types,
  sortDirectionEnum,
  FieldTypeFunc,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type TextFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  defaultValue?: FieldDefaultValue<string>;
  index?: 'index' | 'unique';
  ui?: {
    displayMode?: 'input' | 'textarea';
  };
};

export const text = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  index,
  ...config
}: TextFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc => () =>
  fieldType({ kind: 'scalar', mode: 'optional', scalar: 'String', index })({
    ...config,
    input: {
      uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.String }) } : undefined,
      create: { arg: types.arg({ type: types.String }) },
      update: { arg: types.arg({ type: types.String }) },
      sortBy: { arg: types.arg({ type: sortDirectionEnum }) },
    },
    output: types.field({
      type: types.String,
    }),
    views: resolveView('text/views'),
    getAdminMeta() {
      return { displayMode: config.ui?.displayMode ?? 'input' };
    },
  });
