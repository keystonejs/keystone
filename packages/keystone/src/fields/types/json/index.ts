import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  JSONValue,
  FieldTypeFunc,
  CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
  graphql,
} from '../../../types';
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
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type json");
    }

    return jsonFieldTypePolyfilledForSQLite(meta.provider, {
      ...config,
      input: {
        create: { arg: graphql.arg({ type: graphql.JSON }) },
        update: { arg: graphql.arg({ type: graphql.JSON }) },
      },
      output: graphql.field({ type: graphql.JSON }),
      views: resolveView('json/views'),
      __legacy: {
        defaultValue,
        isRequired,
      },
    });
  };
