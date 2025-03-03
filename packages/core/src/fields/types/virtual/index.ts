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
import { g } from '../../..'

type VirtualFieldGraphQLField<Item extends BaseItem, Context extends KeystoneContext> = g.Field<
  Item,
  any,
  g.OutputType<Context>,
  unknown,
  Context
>

export type VirtualFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    field:
      | VirtualFieldGraphQLField<ListTypeInfo['item'], KeystoneContext<ListTypeInfo['all']>>
      | ((lists: {
          [Key in keyof ListTypeInfo['all']['lists']]: ListGraphQLTypes<
            ListTypeInfo['all']['lists'][Key]
          >
        }) => VirtualFieldGraphQLField<ListTypeInfo['item'], KeystoneContext<ListTypeInfo['all']>>)
    unreferencedConcreteInterfaceImplementations?: readonly g.ObjectType<
      any,
      KeystoneContext<ListTypeInfo['all']>
    >[]
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

export function virtual<ListTypeInfo extends BaseListTypeInfo>({
  field,
  ...config
}: VirtualFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    const usableField = typeof field === 'function' ? field(meta.lists) : field
    const namedType = getNamedType(usableField.type.graphQLType)
    const hasRequiredArgs =
      usableField.args &&
      Object.values(usableField.args as Record<string, g.Arg<g.InputType, boolean>>).some(
        x => x.type.kind === 'non-null' && x.defaultValue === undefined
      )

    if (
      (!isLeafType(namedType) || hasRequiredArgs) &&
      !config.ui?.query &&
      (config.ui?.itemView?.fieldMode !== 'hidden' || config.ui?.listView?.fieldMode !== 'hidden')
    ) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} requires ui.query, or ui.listView.fieldMode and ui.itemView.fieldMode to be set to 'hidden'`
      )
    }

    return fieldType({ kind: 'none' })({
      ...config,
      output: g.field({
        ...(usableField as any),
        resolve({ item }, ...args) {
          return usableField.resolve!(item, ...args)
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/virtual',
      views: '@keystone-6/core/fields/types/virtual/views',
      getAdminMeta: () => ({
        query: config.ui?.query ?? '',
      }),
    })
  }
}
