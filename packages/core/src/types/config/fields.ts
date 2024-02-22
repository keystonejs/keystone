import type { CacheHint } from '@apollo/cache-control-types'
import type { FieldTypeFunc } from '../next-fields'
import type { BaseListTypeInfo } from '../type-info'
import type { KeystoneContext, MaybePromise } from '..'
import type { MaybeItemFunction, MaybeSessionFunction } from './lists'
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
  label?: string // TODO: move to ui?
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
    isNonNull?: {
      // should this field be non-nullable on the {List} GraphQL type?
      read?: boolean
      // should this field be non-nullable on the {List}CreateInput GraphQL type?
      create?: boolean
      // should this field be non-nullable on the {List}UpdateInput GraphQL type?
      update?: boolean
    }

    omit?:
      | boolean
      | {
          // should this field be omitted from the {List} GraphQL type?
          read?: boolean
          // should this field be omitted from the {List}CreateInput GraphQL type?
          create?: boolean
          // should this field be omitted from the {List}UpdateInput GraphQL type?
          update?: boolean
        }
  }
  isFilterable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>)
  isOrderable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>)
}
