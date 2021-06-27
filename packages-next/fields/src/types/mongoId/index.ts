import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { MongoIdImplementation, PrismaMongoIdInterface } from './Implementation';

export type MongoIdFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  ui?: {
    displayMode?: 'input' | 'textarea';
  };
  defaultValue?: FieldDefaultValue<string>;
};

export const mongoId = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: MongoIdFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'MongoId',
    implementation: MongoIdImplementation,
    adapter: PrismaMongoIdInterface,
  },
  config,
  views: resolveView('text/views'),
  getAdminMeta: () => ({ displayMode: config.ui?.displayMode ?? 'input' }),
});
