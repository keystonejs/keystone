import { getNamedType, isLeafType } from 'graphql'
import {
  type BaseItem,
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  type KeystoneContext,
  type ListGraphQLTypes,
  fieldType,
} from '../../../types'
import { graphql } from '../../..'

type VirtualFieldGraphQLField<
  Item extends BaseItem,
  Context extends KeystoneContext
> = graphql.Field<Item, any, graphql.OutputType, string, Context>

export type VirtualFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    field:
      | VirtualFieldGraphQLField<ListTypeInfo['item'], KeystoneContext<ListTypeInfo['all']>>
      | ((lists: Record<string, ListGraphQLTypes>) => VirtualFieldGraphQLField<ListTypeInfo['item'], KeystoneContext<ListTypeInfo['all']>>)
    unreferencedConcreteInterfaceImplementations?: readonly graphql.ObjectType<any>[]
    ui?: {
      /**
       * This can be used by the AdminUI to fetch the relevant sub-fields
       *   or arguments on a non-scalar field GraphQL type
       * ```graphql
       * query {
       *   item(where: { id: "..." }) {
       *     fieldName${ui.query}
       *   }
       * }
       * ```
       */
      query?: string
    }
  }

export function virtual <ListTypeInfo extends BaseListTypeInfo> ({
  field,
  ...config
}: VirtualFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return (meta) => {
    const usableField = typeof field === 'function' ? field(meta.lists) : field
    const namedType = getNamedType(usableField.type.graphQLType)
    const hasRequiredArgs =
      usableField.args &&
      Object.values(
        usableField.args as Record<string, graphql.Arg<graphql.InputType, boolean>>
      ).some(x => x.type.kind === 'non-null' && x.defaultValue === undefined)

    if (
      (!isLeafType(namedType) || hasRequiredArgs) &&
      !config.ui?.query &&
      (config.ui?.itemView?.fieldMode !== 'hidden' || config.ui?.listView?.fieldMode !== 'hidden')
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} requires ui.query, or ui.listView.fieldMode and ui.itemView.fieldMode to be set to 'hidden'`)
    }

    return fieldType({ kind: 'none', })({
      ...config,
      output: graphql.field({
        ...(usableField as any),
        resolve ({ item }, ...args) {
          return usableField.resolve!(item as any, ...args)
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/virtual',
      views: '@keystone-6/core/fields/types/virtual/views',
      getAdminMeta: () => ({
        query: config.ui?.query ?? ''
      }),
    })
  }
}
