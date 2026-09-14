import type { allIcons as KeystarIcons } from '@keystar/ui/icon/all'
import type { ReactElement } from 'react'

import type {
  ConditionalFilter,
  ConditionalFilterCase,
  ListSortDescriptor,
} from './config/index.ts'
import type { BaseListTypeInfo } from './type-info.ts'
import type { GraphQLNames, JSONValue } from './utils.ts'

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

// TODO: duplicate, reference core/src/lib/admin-meta.ts
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
  isNonNull: ('read' | 'create' | 'update')[]
  createView: {
    fieldMode: ConditionalFilter<'edit' | 'hidden', 'hidden', BaseListTypeInfo>
    isRequired: ConditionalFilterCase<BaseListTypeInfo>
  }
  itemView: {
    fieldMode: ConditionalFilter<'edit' | 'read' | 'hidden', 'read' | 'hidden', BaseListTypeInfo>
    fieldPosition: 'form' | 'sidebar'
    isRequired: ConditionalFilterCase<BaseListTypeInfo>
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

export type ActionArgumentSourceMeta<Field = FieldMeta> =
  | null
  | {
      itemField: string
      field?: never
    }
  | {
      field: Field
      itemField?: never
    }

export type ActionMeta = {
  key: string
  graphql: {
    arguments: readonly {
      name: string
      type: string
      source: ActionArgumentSourceMeta<any>
    }[]
    names: {
      one: string
      many: string
    }
  }

  label: string
  icon: keyof typeof KeystarIcons | null
  messages: {
    promptTitle: string
    promptTitleMany: string
    prompt: string
    promptMany: string
    promptConfirmLabel: string
    promptConfirmLabelMany: string
    fail: string
    failMany: string
    success: string
    successMany: string
  }
  itemView: {
    actionMode: ConditionalFilter<
      'enabled' | 'disabled' | 'hidden',
      'disabled' | 'hidden',
      BaseListTypeInfo
    >
    navigation: 'follow' | 'refetch' | 'return'
    hidePrompt: boolean
    hideToast: boolean
  }
  listView: {
    actionMode: ConditionalFilter<
      'enabled' | 'disabled' | 'hidden',
      'disabled' | 'hidden',
      BaseListTypeInfo
    >
  }
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
  actions: ActionMeta[]
  graphql: {
    names: GraphQLNames
  }

  pageSize: number
  initialColumns: string[]
  initialSearchFields: string[]
  initialSort: ListSortDescriptor<string> | null
  initialFilter: JSONValue
  hiddenFilter: JSONValue | null
  isSingleton: boolean

  hideNavigation: boolean
  hideCreate: boolean
  hideDelete: boolean
}

/** Client-facing field metadata with internal views and controllers omitted. */
type AdminMetaField = Omit<FieldMeta, 'views' | 'controller'>

/** Client-facing field group metadata with its resolved fields. */
type AdminMetaFieldGroup = Omit<FieldGroupMeta, 'fields'> & {
  fields: AdminMetaField[]
}

/** Client-facing action metadata with resolved field argument sources. */
type AdminMetaAction = Omit<ActionMeta, 'graphql'> & {
  graphql: Omit<ActionMeta['graphql'], 'arguments'> & {
    arguments: Array<
      Omit<ActionMeta['graphql']['arguments'][number], 'source'> & {
        source: ActionArgumentSourceMeta<AdminMetaField>
      }
    >
  }
}

/**
 * Request-resolved Admin UI metadata returned by the `adminMeta` GraphQL field and passed to
 * `ui.hooks.resolveAdminMeta`.
 *
 * This is the client-facing shape: internal list indexes, field views, and field controllers are
 * omitted. Values that are configured as request-dependent functions have already been resolved
 * when this type is passed to the hook.
 */
export type AdminMeta = {
  lists: Array<
    Omit<ListMeta, 'fields' | 'groups' | 'actions' | 'initialSort'> & {
      fields: AdminMetaField[]
      groups: AdminMetaFieldGroup[]
      actions: AdminMetaAction[]
      initialSort: ListMeta['initialSort']
    }
  >
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
    Cell?: CellComponent
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
