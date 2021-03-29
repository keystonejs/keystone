// @ts-ignore
import { MongoId } from '@keystone-next/fields-mongoid-legacy';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type MongoIdFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: FieldDefaultValue<string>;
};

export const mongoId = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: MongoIdFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: MongoId,
  config,
  views: resolveView('mongoId/views'),
});
