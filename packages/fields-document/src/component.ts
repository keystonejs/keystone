import path from 'path';
import {
  BaseListTypeInfo,
  JSONValue,
  FieldTypeFunc,
  CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

export type ComponentFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    db?: { map?: string };
  };

const views = path.join(path.dirname(__dirname), 'component-views');

export const component =
  <ListTypeInfo extends BaseListTypeInfo>({
    ...config
  }: ComponentFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type json");
    }

    const resolve = (val: JSONValue | undefined) =>
      val === null && meta.provider === 'postgresql' ? 'DbNull' : val;

    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        input: {
          create: {
            arg: graphql.arg({ type: graphql.JSON }),
            resolve(val) {
              return resolve(val === undefined ? defaultValue : val);
            },
          },
          update: { arg: graphql.arg({ type: graphql.JSON }), resolve },
        },
        output: graphql.field({ type: graphql.JSON }),
        views,
        getAdminMeta: () => ({}),
      },
      {
        default:
          defaultValue === null
            ? undefined
            : {
                kind: 'literal',
                value: JSON.stringify(defaultValue),
              },
        map: config.db?.map,
        mode: 'required',
      }
    );
  };
