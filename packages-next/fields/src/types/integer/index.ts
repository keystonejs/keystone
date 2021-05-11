import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  sortDirectionEnum,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type IntegerFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & { index?: 'index' | 'unique' };

export const integer =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    ...config
  }: IntegerFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  () =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      index,
    })({
      ...config,
      input: {
        uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.Int }) } : undefined,
        create: { arg: types.arg({ type: types.Int }) },
        update: { arg: types.arg({ type: types.Int }) },
        orderBy: { arg: types.arg({ type: sortDirectionEnum }) },
      },
      output: types.field({ type: types.Int }),
      views: resolveView('integer/views'),
    });
