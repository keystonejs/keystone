import type { CacheHint } from '@apollo/cache-control-types'
import type { KeystoneContext } from '../index.ts'
import type { FieldTypeFunc } from '../next-fields.ts'
import type { BaseListTypeInfo } from '../type-info.ts'
import type { FieldAccessControl } from './access-control.ts'
import type { FieldHooks } from './hooks.ts'
import type {
  MaybeBooleanSessionFunctionWithFilter,
  MaybeItemFieldFunction,
  MaybeItemFieldFunctionWithFilter,
  MaybeSessionFunction,
  MaybeSessionFunctionWithFilter,
} from './lists.ts'

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

export type FieldGraphQLOmit =
  | boolean
  | {
      read?:
        | boolean
        | {
            item: boolean
            filter: boolean
            order: boolean
          }
      create?: boolean
      update?: boolean
    }

export type CommonFieldConfig<
  ListTypeInfo extends BaseListTypeInfo,
  FieldTypeInfo extends BaseFieldTypeInfo,
> = {
  access?: FieldAccessControl<ListTypeInfo>
  hooks?: FieldHooks<ListTypeInfo, FieldTypeInfo>
  ui?: {
    label?: string
    description?: string
    views?: string
    createView?: {
      fieldMode?: MaybeSessionFunctionWithFilter<'edit' | 'hidden', 'hidden', ListTypeInfo>
      isRequired?: MaybeBooleanSessionFunctionWithFilter<ListTypeInfo>
    }
    itemView?: {
      fieldMode?: MaybeItemFieldFunctionWithFilter<
        'edit' | 'read' | 'hidden',
        'read' | 'hidden',
        ListTypeInfo,
        FieldTypeInfo
      >
      fieldPosition?: MaybeItemFieldFunction<'form' | 'sidebar', ListTypeInfo, FieldTypeInfo>
      isRequired?: MaybeBooleanSessionFunctionWithFilter<ListTypeInfo>
    }
    listView?: {
      fieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo>
    }
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

    omit?: FieldGraphQLOmit
  }
}
