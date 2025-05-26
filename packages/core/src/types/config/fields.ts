import type { CacheHint } from '@apollo/cache-control-types'
import type { KeystoneContext } from '..'
import type { FieldTypeFunc } from '../next-fields'
import type { BaseListTypeInfo } from '../type-info'
import type { FieldAccessControl } from './access-control'
import type { FieldHooks } from './hooks'
import type {
  MaybeFieldFunction,
  MaybeItemFieldFunction,
  MaybeItemFieldFunctionWithFilter,
  MaybeSessionFunction,
  MaybeSessionFunctionWithFilter,
} from './lists'

export type BaseFields<ListTypeInfo extends BaseListTypeInfo> = {
  [key: string]: FieldTypeFunc<ListTypeInfo>
}

export type FilterOrderArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContext<ListTypeInfo['all']>
  session?: ListTypeInfo['all']['session']
  listKey: ListTypeInfo['key']
  fieldKey: ListTypeInfo['fields']
}

export type BaseFieldTypeInfo = {
  item: any
  inputs: {
    create: any
    update: any
    where: any
    uniqueWhere: any
    orderBy: any
  }
  prisma: {
    create: any
    update: any
  }
}

export type CommonFieldConfig<
  ListTypeInfo extends BaseListTypeInfo,
  FieldTypeInfo extends BaseFieldTypeInfo,
> = {
  access?: FieldAccessControl<ListTypeInfo>
  hooks?: FieldHooks<ListTypeInfo, FieldTypeInfo>
  label?: string // TODO: move to .ui in breaking change
  ui?: {
    description?: string
    views?: string
    createView?: { fieldMode?: MaybeSessionFunctionWithFilter<'edit' | 'hidden', ListTypeInfo> }
    itemView?: {
      fieldMode?: MaybeItemFieldFunctionWithFilter<
        'edit' | 'read' | 'hidden',
        ListTypeInfo,
        FieldTypeInfo
      >
      fieldPosition?: MaybeItemFieldFunction<'form' | 'sidebar', ListTypeInfo, FieldTypeInfo>
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
