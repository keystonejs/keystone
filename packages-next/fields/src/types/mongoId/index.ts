// @ts-ignore
import { MongoId } from '@keystonejs/fields-mongoid';
import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type MongoIdFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
>;

const views = resolveView('mongoId/views');

export const mongoId = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: MongoIdFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: MongoId,
  config: config,
  views,
  getBackingType(path) {
    if (path === 'id') {
      return {
        [path]: {
          optional: false,
          type: 'string',
        },
      };
    }
    return {
      [path]: {
        optional: true,
        type: 'string | null',
      },
    };
  },
});
