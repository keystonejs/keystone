import {
  BaseModelTypeInfo,
  JSONValue,
  FieldTypeFunc,
  CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
} from '../../../types';
import { graphql } from '../../..';

export type JsonFieldConfig<ModelTypeInfo extends BaseModelTypeInfo> =
  CommonFieldConfig<ModelTypeInfo> & {
    defaultValue?: JSONValue;
    db?: { map?: string };
  };

export const json =
  <ModelTypeInfo extends BaseModelTypeInfo>({
    defaultValue = null,
    ...config
  }: JsonFieldConfig<ModelTypeInfo> = {}): FieldTypeFunc<ModelTypeInfo> =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type json");
    }

    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        input: {
          create: {
            arg: graphql.arg({ type: graphql.JSON }),
            resolve(val) {
              return val === undefined ? defaultValue : val;
            },
          },
          update: { arg: graphql.arg({ type: graphql.JSON }) },
        },
        output: graphql.field({ type: graphql.JSON }),
        views: '@keystone-6/core/fields/types/json/views',
        getAdminMeta: () => ({ defaultValue }),
      },
      {
        default:
          defaultValue === null
            ? undefined
            : { kind: 'literal', value: JSON.stringify(defaultValue) },
        map: config.db?.map,
      }
    );
  };
