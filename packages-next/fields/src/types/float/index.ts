import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  fieldType,
  types,
  sortDirectionEnum,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type FloatFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  index?: 'index' | 'unique';
};

export const float = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  index,
  ...config
}: FloatFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc => () =>
  fieldType({
    kind: 'scalar',
    mode: 'optional',
    scalar: 'Float',
    index,
  })({
    ...config,
    input: {
      uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.Float }) } : undefined,
      create: { arg: types.arg({ type: types.Float }) },
      update: { arg: types.arg({ type: types.Float }) },
      sortBy: { arg: types.arg({ type: sortDirectionEnum }) },
    },
    output: types.field({ type: types.Int }),
    views: resolveView('float/views'),
  });
