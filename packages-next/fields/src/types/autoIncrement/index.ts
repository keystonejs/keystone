// @ts-ignore
import { AutoIncrement } from '@keystone-next/fields-auto-increment-legacy';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type AutoIncrementFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: FieldDefaultValue<number>;
};

export const autoIncrement = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: AutoIncrementFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: AutoIncrement,
  config,
  views: resolveView('integer/views'),
});
