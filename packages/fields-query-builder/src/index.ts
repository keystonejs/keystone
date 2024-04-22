import {
  type BaseListTypeInfo,
  fieldType,
  type FieldTypeFunc,
  type CommonFieldConfig,
  orderDirectionEnum,
  JSONValue,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { filters } from '@keystone-6/core/fields';
import { getNamedType } from "graphql";

export type FilterDepenancy = {
  list?: string; // The specific list the dependency is part of.
  field?: string; // The specific field within the list that forms the dependency.
};
type FilterConfig = {
  isIndexed?: boolean | "unique";
  ui?: {
    style?: "default" | "antd";
  };
  fields?: JSONValue | null;
  dependency?: FilterDepenancy | null;
};
export type FilterFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & FilterConfig;
export type FilterViewConfig = {
  style: "default" | "antd";
  fields: JSONValue | null;
  dependency: FilterDepenancy | null;
};

export function queryBuilder<ListTypeInfo extends BaseListTypeInfo>({
  isIndexed,
  ...config
}: FilterFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const mode = isIndexed === "unique" ? "required" : "optional";
  return (meta) =>
    fieldType({
      kind: "scalar",
      mode: "optional",
      scalar: "String",
      index: isIndexed === true ? "index" : isIndexed || undefined,
    })({
      ...config,
      input: {
        uniqueWhere:
          isIndexed === "unique"
            ? { arg: graphql.arg({ type: graphql.String }) }
            : undefined,
        where: {
          arg: graphql.arg({
            type: filters[meta.provider].String[mode],
          }),
          resolve: mode === "required" ? undefined : filters.resolveString,
        },
        create: {
          arg: graphql.arg({ type: graphql.String }),
          resolve(value) {
            return value;
          },
        },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
        resolve({ value }) {
          return value;
        },
      }),
      views: "@keystone-6/fields-query-builder/views",
      getAdminMeta() {
        const fields = config.fields || {};
        if (config.dependency?.field) {
          // Handle field-specific dependencies.
          const field = config.dependency.field.split(".")[0];
          if (!config.dependency?.list) {
            // Determine the list of the dependency if not explicitly set.
            config.dependency.list = getNamedType(
              meta.lists[meta.listKey].types.output.graphQLType.getFields()[
                field
              ].type,
            ).name;
          }
        }
        return {
          style: config.ui?.style || null,
          fields: fields || null,
          dependency: config.dependency || null,
        };
      },
    });
}
