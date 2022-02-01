import { getNamedType, isLeafType } from 'graphql';
import {
  BaseListTypeInfo,
  BaseItem,
  CommonFieldConfig,
  FieldTypeFunc,
  fieldType,
  ListGraphQLTypes,
  getGqlNames,
} from '../../../types';
import { graphql } from '../../..';
import { resolveView } from '../../resolve-view';

type VirtualFieldGraphQLField<Item extends BaseItem> = graphql.Field<
  Item,
  any,
  graphql.OutputType,
  string
>;

export type VirtualFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    field:
      | VirtualFieldGraphQLField<ListTypeInfo['item']>
      | ((
          lists: Record<string, ListGraphQLTypes>
        ) => VirtualFieldGraphQLField<ListTypeInfo['item']>);
    unreferencedConcreteInterfaceImplementations?: readonly graphql.ObjectType<any>[];
    ui?: {
      /**
       * Defines what the Admin UI should fetch from this field, it's interpolated into a query like this:
       * ```graphql
       * query {
       *   item(where: { id: "..." }) {
       *     field${ui.query}
       *   }
       * }
       * ```
       *
       * This is only needed when you your field returns a GraphQL type other than a scalar(String and etc.)
       * or an enum or you need to provide arguments to the field.
       */
      query?: string;
    };
  };

export const virtual =
  <ListTypeInfo extends BaseListTypeInfo>({
    field,
    ...config
  }: VirtualFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    const usableField = typeof field === 'function' ? field(meta.lists) : field;
    const namedType = getNamedType(usableField.type.graphQLType);
    const hasRequiredArgs =
      usableField.args &&
      Object.values(
        usableField.args as Record<string, graphql.Arg<graphql.InputType, boolean>>
      ).some(x => x.type.kind === 'non-null' && x.defaultValue === undefined);
    if (
      (!isLeafType(namedType) || hasRequiredArgs) &&
      !config.ui?.query &&
      (config.ui?.itemView?.fieldMode !== 'hidden' || config.ui?.listView?.fieldMode !== 'hidden')
    ) {
      throw new Error(
        `The virtual field at ${meta.listKey}.${meta.fieldKey} requires a selection for the Admin UI but ui.query is unspecified and ui.listView.fieldMode and ui.itemView.fieldMode are not both set to 'hidden'.\n` +
          `Either set ui.query with what the Admin UI should fetch or hide the field from the Admin UI by setting ui.listView.fieldMode and ui.itemView.fieldMode to 'hidden'.\n` +
          `When setting ui.query, it is interpolated into a GraphQL query like this:\n` +
          `query {\n` +
          `  ${
            getGqlNames({ listKey: meta.listKey, pluralGraphQLName: '' }).itemQueryName
          }(where: { id: "..." }) {\n` +
          `    ${meta.fieldKey}\${ui.query}\n` +
          `  }\n` +
          `}`
      );
    }
    return fieldType({
      kind: 'none',
    })({
      ...config,
      output: graphql.field({
        ...(usableField as any),
        resolve({ item }, ...args) {
          return usableField.resolve!(item as any, ...args);
        },
      }),
      views: resolveView('virtual/views'),
      getAdminMeta: () => ({ query: config.ui?.query || '' }),
    });
  };
