import type { CacheHint } from '@apollo/cache-control-types'
import type { FieldTypeFunc } from '../next-fields'
import type { BaseListTypeInfo } from '../type-info'
import type { KeystoneContext } from '..'
import type { MaybeFieldFunction, MaybeItemFunction, MaybeSessionFunction } from './lists'
import type { FieldHooks } from './hooks'
import type { FieldAccessControl } from './access-control'

export type BaseFields<ListTypeInfo extends BaseListTypeInfo> = {
  [key: string]: FieldTypeFunc<ListTypeInfo>
}

export type FilterOrderArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContext<ListTypeInfo['all']>
  session?: ListTypeInfo['all']['session']
  listKey: ListTypeInfo['key']
  fieldKey: ListTypeInfo['fields']
}

export type CommonFieldConfig<ListTypeInfo extends BaseListTypeInfo> = {
  access?: FieldAccessControl<ListTypeInfo>
  hooks?: FieldHooks<ListTypeInfo, ListTypeInfo['fields']>
  label?: string // TODO: move to .ui in breaking change
  ui?: {
    description?: string
    views?: string
    createView?: { fieldMode?: MaybeSessionFunction<'edit' | 'hidden', ListTypeInfo> }
    itemView?: {
      fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden', ListTypeInfo>
      fieldPosition?: MaybeItemFunction<'form' | 'sidebar', ListTypeInfo>
    }
    listView?: { fieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo> }
  }
  graphql?: {
    cacheHint?: CacheHint
    isNonNull?:
      | boolean
      | {
          // whether this field is non-nullable on the {List} GraphQL type
          read?: boolean
          // whether this field is non-nullable on the {List}CreateInput GraphQL type
          create?: boolean
          // whether this field is non-nullable on the {List}UpdateInput GraphQL type
          update?: boolean
        }

    omit?:
      | boolean
      | {
          // whether this field is omitted from the {List} GraphQL type
          read?: boolean
          // whether this field is omitted from the {List}CreateInput GraphQL type
          create?: boolean
          // whether this field is omitted from the {List}UpdateInput GraphQL type
          update?: boolean
        }
  }
  isFilterable?: MaybeFieldFunction<ListTypeInfo>
  isOrderable?: MaybeFieldFunction<ListTypeInfo>
}
