import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';
import { AutoIncrementImplementation, PrismaAutoIncrementInterface } from './Implementation';

export type AutoIncrementFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: FieldDefaultValue<number>;
};

export const autoIncrement = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: AutoIncrementFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'AutoIncrement',
    implementation: AutoIncrementImplementation,
    adapter: PrismaAutoIncrementInterface,
  },
  config,
  views: resolveView('integer/views'),
});
