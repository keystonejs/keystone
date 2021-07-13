import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  JSONValue,
  FieldTypeFunc,
  CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
  schema,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type JsonFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<JSONValue, TGeneratedListTypes>;
    isRequired?: boolean;
  };

export const json =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    ...config
  }: JsonFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type json');
    }

    return jsonFieldTypePolyfilledForSQLite(meta.provider, {
      ...config,
      input: {
        create: { arg: schema.arg({ type: schema.JSON }) },
        update: { arg: schema.arg({ type: schema.JSON }) },
      },
      output: schema.field({ type: schema.JSON }),
      views: resolveView('json/views'),
      __legacy: {
        defaultValue,
        isRequired,
      },
    });
  };
