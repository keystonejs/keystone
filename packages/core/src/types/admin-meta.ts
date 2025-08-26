import type { ReactElement } from 'react'
import type { GraphQLNames, JSONValue } from './utils'
import type { ConditionalFilter, ConditionalFilterCase, ListSortDescriptor } from './config'
import type { BaseListTypeInfo } from './type-info'

export type NavigationProps = {
  lists: ListMeta[]
}

export type AdminConfig = {
  components?: {
    Logo?: (props: object) => ReactElement
    Navigation?: (props: NavigationProps) => ReactElement
  }
}

export type FieldControllerConfig<FieldMeta extends JSONValue | undefined = undefined> = {
  listKey: string
  fieldKey: string

  label: string
  description: string
  customViews: Record<string, any>
  fieldMeta: FieldMeta
}

type FilterTypeDeclaration<Value extends JSONValue> = {
  readonly label: string
  readonly initialValue: Value
}

export type FilterTypeToFormat<Value extends JSONValue> = {
  readonly type: string
  readonly label: string
  readonly value: Value
}

export type FieldController<
  FormState,
  FilterValue extends JSONValue = never,
  GraphQLFilterValue = never,
> = {
  fieldKey: string

  label: string
  description: string

  defaultValue: FormState
  deserialize: (item: any) => FormState // TODO: unknown
  serialize: (formState: FormState) => any // TODO: unknown
  validate?: (formState: FormState, opts: { isRequired: boolean }) => boolean

  graphqlSelection: string
  filter?: {
    types: Record<string, FilterTypeDeclaration<FilterValue>>
    parseGraphQL(value: GraphQLFilterValue & {}): { type: string; value: FilterValue }[]
    graphql(type: { type: string; value: FilterValue }): Record<string, any>
    Label(type: FilterTypeToFormat<FilterValue>): string | ReactElement | null
    Filter(props: {
      autoFocus?: boolean
      forceValidation?: boolean
      context: 'add' | 'edit'
      onChange(value: FilterValue): void
      type: string
      // TODO: could be derived `filter.types[type].label`?
      typeLabel?: string
      value: FilterValue
    }): ReactElement | null
  }
}

// TODO: duplicate, reference core/src/lib/create-admin-meta.ts
export type FieldMeta = {
  key: string

  label: string
  description: string
  fieldMeta: JSONValue | null
  viewsIndex: number
  customViewsIndex: number | null
  views: FieldViews[number]
  controller: FieldController<unknown, JSONValue>
  isFilterable: boolean
  isOrderable: boolean

  search: 'default' | 'insensitive' | null
  graphql: {
    isNonNull: ('read' | 'create' | 'update')[]
  }
  createView: {
    fieldMode: ConditionalFilter<'edit' | 'hidden', BaseListTypeInfo>
    isRequired: ConditionalFilterCase<BaseListTypeInfo>
  }
  itemView: {
    fieldMode: ConditionalFilter<'edit' | 'read' | 'hidden', BaseListTypeInfo>
    isRequired: ConditionalFilterCase<BaseListTypeInfo>
    fieldPosition: 'form' | 'sidebar'
  }
  listView: {
    fieldMode: 'read' | 'hidden'
  }
}

export type FieldGroupMeta = {
  label: string
  description: string
  fields: FieldMeta[]
}

export type ListMeta = {
  key: string
  label: string
  singular: string
  plural: string
  path: string

  labelField: string
  fields: { [key: string]: FieldMeta }
  groups: FieldGroupMeta[]
  graphql: {
    names: GraphQLNames
  }

  pageSize: number
  initialColumns: string[]
  initialSearchFields: string[]
  initialSort: ListSortDescriptor<string>
  initialFilter: JSONValue
  isSingleton: boolean

  hideNavigation: boolean
  hideCreate: boolean
  hideDelete: boolean
}

export type Item = {
  [key: string]: unknown
}

export type FieldProps<FieldControllerFn extends (...args: any) => FieldController<any, any>> = {
  autoFocus?: boolean
  field: ReturnType<FieldControllerFn>
  isRequired: boolean
  /**
   * Will be true when the user has clicked submit and
   * the validate function on the field controller has returned false
   */
  forceValidation?: boolean
  onChange?(value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>): void
  value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>
  itemValue: Item
}

export type FieldViews = Record<
  string,
  {
    Field: (props: FieldProps<any>) => ReactElement | null
    Cell: CellComponent
    controller: (args: FieldControllerConfig<any>) => FieldController<unknown, JSONValue>
    allowedExportsOnCustomViews?: string[]
  }
>

export type CellComponent<
  FieldControllerFn extends (...args: any) => FieldController<any, any> = () => FieldController<
    any,
    any
  >,
> = {
  (props: {
    value: any // TODO: T
    field: ReturnType<FieldControllerFn>
    item: Record<string, unknown>
  }): ReactElement | null
}
