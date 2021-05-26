import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  JSONValue,
  FieldTypeFunc,
  CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type JsonFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<JSONValue>;
    isRequired?: boolean;
  };

export const json =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    ...config
  }: JsonFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    jsonFieldTypePolyfilledForSQLite(meta.provider, {
      ...config,
      input: {
        create: { arg: types.arg({ type: types.JSON }) },
        update: { arg: types.arg({ type: types.JSON }) },
      },
      output: types.field({ type: types.JSON }),
      views: resolveView('json/views'),
      __legacy: {
        defaultValue,
        isRequired,
      },
    });
