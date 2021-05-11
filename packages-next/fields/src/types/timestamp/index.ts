import {
  BaseGeneratedListTypes,
  fieldType,
  types,
  FieldTypeFunc,
  sortDirectionEnum,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type TimestampFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    index?: 'index' | 'unique';
  };

export const timestamp =
  <TGeneratedListTypes extends BaseGeneratedListTypes>(
    config: TimestampFieldConfig<TGeneratedListTypes> = {}
  ): FieldTypeFunc =>
  () => {
    const inputResolver = (value: string | null | undefined) => {
      if (value === null || value === undefined) {
        return value;
      }
      return new Date(value);
    };
    return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'DateTime' })({
      ...config,
      input: {
        create: { arg: types.arg({ type: types.String }), resolve: inputResolver },
        update: { arg: types.arg({ type: types.String }), resolve: inputResolver },
        orderBy: { arg: types.arg({ type: sortDirectionEnum }) },
      },
      output: types.field({
        type: types.String,
        resolve({ value }) {
          if (value === null) return null;
          return value.toISOString();
        },
      }),
      views: resolveView('timestamp/views'),
    });
  };
