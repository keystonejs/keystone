// @ts-ignore
import { AutoIncrement } from '@keystonejs/fields-auto-increment';
import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type AutoIncrementFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes>;

const views = resolveView('integer/views');

export const autoIncrement = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: AutoIncrementFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: AutoIncrement,
  config: config,
  views,
  getBackingType(path) {
    if (path === 'id') {
      return {
        [path]: {
          optional: false,
          type: 'number',
        },
      };
    }
    return {
      [path]: {
        optional: true,
        type: 'number | null',
      },
    };
  },
});
