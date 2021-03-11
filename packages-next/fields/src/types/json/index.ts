// @ts-ignore
import { JsonFieldType } from './base-field-type';
// import { Json } from '@keystone-next/fields-legacy';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type JsonFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  defaultValue?: FieldDefaultValue<string>;
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  ui?: {
    displayMode?: 'textarea' | 'input';
  };
};

export const json = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: JsonFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: JsonFieldType,
  config,
  views: resolveView('json/views'),
  getAdminMeta: () => ({ displayMode: config.ui?.displayMode ?? 'textarea' }),
});
