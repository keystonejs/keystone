import type { ReactElement } from 'react'
import type { InitialisedList } from '../lib/core/initialise-lists'
import { type JSONValue } from './utils'
import { type ControllerValue } from '../types'

export type AuthenticatedItem = {
  label: string
  id: string
  listKey: string
}

export type NavigationProps = {
  authenticatedItem: AuthenticatedItem | null
  lists: ListMeta[]
}

export type AdminConfig = {
  components?: {
    Logo?: (props: {}) => ReactElement
    Navigation?: (props: NavigationProps) => ReactElement
  }
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
    graphql(type: { type: string, value: FilterValue }): Record<string, any>
    Label(type: FilterTypeToFormat<FilterValue>): string | ReactElement | null
    Filter(props: {
      type: string
      value: FilterValue
      onChange(value: FilterValue): void
      autoFocus?: boolean
    }): ReactElement | null
  }
}

// TODO: duplicate, reference core/src/lib/create-admin-meta.ts
export type FieldMeta = {
  path: string
  label: string
  description: string | null
  fieldMeta: JSONValue
  viewsIndex: number
  customViewsIndex: number | null
  views: FieldViews[number]
  controller: FieldController<unknown, JSONValue>
  search: 'default' | 'insensitive' | null
  graphql: {
    isNonNull: ('read' | 'create' | 'update')[]
  }
  createView: {
    fieldMode: 'edit' | 'hidden' | null
  }
  itemView: {
    fieldMode: 'edit' | 'read' | 'hidden' | null
    fieldPosition: 'form' | 'sidebar' | null
  }
  listView: {
    fieldMode: 'read' | 'hidden' | null
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

  /** @deprecated */
  gqlNames: InitialisedList['graphql']['names']

  fields: { [path: string]: FieldMeta }
  groups: FieldGroupMeta[]

  pageSize: number
  initialColumns: string[]
  initialSort: null | { direction: 'ASC' | 'DESC', field: string }
  isAuthenticated: boolean
  isSingleton: boolean

  hideCreate: boolean
  hideDelete: boolean
}

export type AdminMeta = {
  lists: { [list: string]: ListMeta }
}

export type FieldProps<FieldControllerFn extends (...args: any) => FieldController<any, any>> = {
  field: ReturnType<FieldControllerFn>
  autoFocus?: boolean
  /**
   * Will be true when the user has clicked submit and
   * the validate function on the field controller has returned false
   */
  forceValidation?: boolean
  onChange?(value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>): void
  value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>
  itemValue: ControllerValue
}

export type FieldViews = Record<
  string,
  {
    Field: (props: FieldProps<any>) => ReactElement | null
    Cell: CellComponent
    CardValue: CardValueComponent
    controller: (args: FieldControllerConfig<any>) => FieldController<unknown, JSONValue>
    allowedExportsOnCustomViews?: string[]
  }
>

export type CellComponent<
  FieldControllerFn extends (...args: any) => FieldController<any, any> = () => FieldController<
    any,
    any
  >
> = {
  (props: {
    item: Record<string, any>
    linkTo: { href: string, as: string } | undefined
    field: ReturnType<FieldControllerFn>
  }): ReactElement | null

  supportsLinkTo?: boolean
}

export type CardValueComponent<
  FieldControllerFn extends (...args: any) => FieldController<any, any> = () => FieldController<
    any,
    any
  >
> = (props: { item: Record<string, any>, field: ReturnType<FieldControllerFn> }) => ReactElement
