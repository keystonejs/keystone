import type { ReactElement, ReactNode } from 'react'
import type { GraphQLNames, JSONValue } from './utils'

export type NavigationProps = {
  lists: ListMeta[]
}

export type FieldControllerConfig<FieldMeta extends JSONValue | undefined = undefined> = {
  listKey: string
  path: string
  label: string
  description: string | null
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

export type FieldController<FormState, FilterValue extends JSONValue = never> = {
  path: string
  label: string
  description: string | null
  graphqlSelection: string
  defaultValue: FormState
  deserialize: (item: any) => FormState // TODO: unknown
  serialize: (formState: FormState) => any // TODO: unknown
  validate?: (formState: FormState) => boolean
  filter?: {
    types: Record<string, FilterTypeDeclaration<FilterValue>>
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
  path: string
  label: string
  description: string | null
  fieldMeta: JSONValue | null

  customViews: Partial<FieldViews> & Record<string, unknown>
  views: FieldViews
  controller: FieldController<unknown, JSONValue>

  search: 'default' | 'insensitive' | null
  graphql: {
    isNonNull: ('read' | 'create' | 'update')[]
  }
  createView: {
    fieldMode: 'edit' | 'hidden'
  }
  itemView: {
    fieldMode: 'edit' | 'read' | 'hidden'
    fieldPosition: 'form' | 'sidebar'
  }
  listView: {
    fieldMode: 'read' | 'hidden'
  }

  isFilterable: boolean
  isOrderable: boolean
}

export type FieldGroupMeta = {
  label: string
  description: string | null
  fields: FieldMeta[]
}

export type ListMeta = {
  key: string
  path: string
  description: string | null

  label: string
  labelField: string
  singular: string
  plural: string

  fields: { [path: string]: FieldMeta }
  groups: FieldGroupMeta[]
  graphql: {
    names: GraphQLNames
  }

  pageSize: number
  initialColumns: string[]
  initialSearchFields: string[]
  initialSort: null | { direction: 'ASC' | 'DESC'; field: string }
  isSingleton: boolean

  hideNavigation: boolean
  hideCreate: boolean
  hideDelete: boolean
}

export type AdminMeta = {
  lists: { [list: string]: ListMeta }
}

export type Item = {
  [key: string]: unknown
}

export type FieldProps<FieldControllerFn extends (...args: any) => FieldController<any, any>> = {
  autoFocus?: boolean
  field: ReturnType<FieldControllerFn>
  /**
   * Will be true when the user has clicked submit and
   * the validate function on the field controller has returned false
   */
  forceValidation?: boolean
  onChange?(value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>): void
  value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>
  itemValue: Item
}

export type FieldViews<
  AdminMeta extends JSONValue | undefined = JSONValue | undefined,
  Controller extends FieldController<any, any> = FieldController<any, any>,
> = {
  Field: (props: FieldProps<(config: FieldControllerConfig<AdminMeta>) => Controller>) => ReactNode
  Cell?: CellComponent<(config: FieldControllerConfig<AdminMeta>) => NoInfer<Controller>>
  controller: (config: FieldControllerConfig<AdminMeta>) => Controller
  allowedExportsOnCustomViews?: readonly string[]
}

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
