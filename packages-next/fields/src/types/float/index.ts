import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  fieldType,
  types,
  orderDirectionEnum,
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
  () =>
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
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({ type: types.Float }),
      views: resolveView('float/views'),
    });
