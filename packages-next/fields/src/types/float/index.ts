import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  fieldType,
  types,
  orderDirectionEnum,
  filters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type FloatFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    index?: 'index' | 'unique';
  };

export const float =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    ...config
  }: FloatFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Float',
      index,
    })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].Float.optional }) },
        uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.Float }) } : undefined,
        create: { arg: types.arg({ type: types.Float }) },
        update: { arg: types.arg({ type: types.Float }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({ type: types.Float }),
      views: resolveView('float/views'),
    });
