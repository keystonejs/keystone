import type {
  BaseFieldTypeInfo,
  BaseItem,
  BaseListTypeInfo,
  ConditionalFilter,
  ConditionalFilterCase,
  KeystoneConfig,
  KeystoneContext,
  ListSortDescriptor,
  MaybeBooleanItemFunctionWithFilter,
  MaybeItemActionFunctionWithFilter,
  MaybeItemFieldFunction,
  MaybeItemFieldFunctionWithFilter,
  MaybePromise,
  MaybeSessionFunction,
} from '../types/index.ts'
import type { ActionMeta, AdminMeta, FieldMeta, ListMeta } from '../types/admin-meta.ts'
import type { GraphQLNames, JSONValue } from '../types/utils.ts'
import type { InitialisedList } from './core/initialise-lists.ts'

type EmptyResolver<Return> = (args: {}, context: KeystoneContext) => MaybePromise<Return>

type FieldMetaSource_ = {
  listKey: string
  fieldKey: string
  isOrderable: EmptyResolver<boolean>
  isFilterable: EmptyResolver<boolean>

  createView: {
    fieldMode: EmptyResolver<ConditionalFilter<'edit' | 'hidden', 'hidden', BaseListTypeInfo>>
    isRequired: EmptyResolver<ConditionalFilterCase<BaseListTypeInfo>>
  }
  itemView: {
    fieldMode: MaybeItemFieldFunctionWithFilter<
      'edit' | 'read' | 'hidden',
      'read' | 'hidden',
      BaseListTypeInfo,
      BaseFieldTypeInfo
    >
    fieldPosition: MaybeItemFieldFunction<'form' | 'sidebar', BaseListTypeInfo, BaseFieldTypeInfo>
    isRequired: MaybeBooleanItemFunctionWithFilter<BaseListTypeInfo, BaseFieldTypeInfo>
  }
  listView: {
    fieldMode: EmptyResolver<'read' | 'hidden'>
  }
  item: BaseItem | null
  itemField: BaseItem[string] | null
}
export type FieldMetaSource = FieldMetaSource_ &
  Omit<FieldMeta, keyof FieldMetaSource_ | 'controller' | 'views'>

type ActionMetaSource_ = {
  listKey: string
  itemView: Omit<ActionMeta['itemView'], 'actionMode'> & {
    actionMode: MaybeItemActionFunctionWithFilter<
      'enabled' | 'disabled' | 'hidden',
      'disabled' | 'hidden',
      BaseListTypeInfo
    >
  }
  listView: {
    actionMode: EmptyResolver<
      ConditionalFilter<'enabled' | 'disabled' | 'hidden', 'disabled' | 'hidden', BaseListTypeInfo>
    >
  }
  item: BaseItem | null
}
export type ActionMetaSource = ActionMetaSource_ & Omit<ActionMeta, keyof ActionMetaSource_>

type ListMetaSource_ = {
  fields: FieldMetaSource[]
  fieldsByKey: Record<string, FieldMetaSource>
  groups: {
    label: string
    description: string
    fields: FieldMetaSource[]
  }[]
  actions: ActionMetaSource[]
  graphql: { names: GraphQLNames }
  pageSize: number
  initialColumns: string[]
  initialFilter: EmptyResolver<JSONValue>
  hiddenFilter: EmptyResolver<JSONValue | null | undefined>
  initialSearchFields: string[]
  initialSort: ListSortDescriptor<string> | null
  isSingleton: boolean

  hideNavigation: EmptyResolver<boolean>
  hideCreate: EmptyResolver<boolean>
  hideDelete: EmptyResolver<boolean>
  item: BaseItem | null
}
export type ListMetaSource = ListMetaSource_ & Omit<ListMeta, keyof ListMetaSource_>

/**
 * Internal Admin UI metadata assembled from the Keystone configuration.
 *
 * This source is shared by requests and may still contain request-dependent resolver functions.
 * It is converted to a request-local {@link AdminMeta} by
 * {@link resolveAdminMetaForRequest} before being passed to the public Admin UI metadata hook.
 */
export type AdminMetaSource = {
  lists: ListMetaSource[]
  listsByKey: Record<string, ListMetaSource>
  views: string[]
  isAccessAllowed: (context: KeystoneContext) => MaybePromise<boolean>
  /** Request hook applied to the resolved, request-local Admin UI metadata. */
  resolveAdminMeta?: (args: {
    adminMeta: AdminMeta
    context: KeystoneContext
  }) => MaybePromise<AdminMeta>
}

export function createAdminMeta(
  config: KeystoneConfig,
  initialisedLists: Record<string, InitialisedList>
) {
  const { lists } = config
  const adminMetaRoot: AdminMetaSource = {
    listsByKey: {},
    lists: [],
    views: [],
    isAccessAllowed: config.ui?.isAccessAllowed,
    resolveAdminMeta: config.ui?.hooks?.resolveAdminMeta,
  }

  const omittedLists: string[] = []

  for (const [listKey, list] of Object.entries(initialisedLists)) {
    const listConfig = lists[listKey]

    // TODO: is this reasonable?
    if (!list.graphql.isEnabled.query.one && !list.graphql.isEnabled.query.many) {
      omittedLists.push(listKey)
      continue
    }

    let initialColumns: string[]
    if (listConfig.ui?.listView?.initialColumns) {
      // if they've asked for a particular thing, give them that thing
      initialColumns = listConfig.ui.listView.initialColumns as string[]
    } else {
      // otherwise, we'll start with the labelfield on the left and then add
      // 2 more fields to the right of that. We don't include the 'id' field
      // unless it happened to be the labelField
      initialColumns = [
        list.ui.labelField,
        ...Object.keys(list.fields)
          .filter(fieldKey => list.fields[fieldKey].graphql.isEnabled.read)
          .filter(fieldKey => fieldKey !== list.ui.labelField)
          .filter(fieldKey => fieldKey !== 'id'),
      ].slice(0, 3)
    }

    let initialSearchFields = listConfig.ui?.searchFields?.concat()
    if (!initialSearchFields) {
      initialSearchFields = [...list.ui.triviallySearchableFields]
    }

    const maximumPageSize = Math.min(
      listConfig.ui?.listView?.pageSize ?? 50,
      (list.graphql.types.findManyArgs.take.defaultValue ?? Infinity) as number
    )

    adminMetaRoot.listsByKey[listKey] = {
      key: listKey,
      path: list.ui.labels.path,

      label: list.ui.labels.label,
      singular: list.ui.labels.singular,
      plural: list.ui.labels.plural,

      labelField: list.ui.labelField,
      fields: [],
      fieldsByKey: {},
      groups: [],
      actions: [],

      graphql: {
        names: list.graphql.names,
      },

      pageSize: maximumPageSize,
      initialColumns,
      initialSearchFields,
      initialSort:
        (listConfig.ui?.listView?.initialSort as ListSortDescriptor<string> | undefined) ?? null,
      initialFilter: normalizeMaybeSessionFunction(listConfig.ui?.listView?.initialFilter ?? {}),
      hiddenFilter: normalizeMaybeSessionFunction(listConfig.ui?.listView?.hiddenFilter ?? null),
      isSingleton: list.isSingleton,

      hideNavigation: normalizeMaybeSessionFunction(listConfig.ui?.hideNavigation ?? false),
      hideCreate: normalizeMaybeSessionFunction(
        listConfig.ui?.hideCreate ?? !list.graphql.isEnabled.create
      ),
      hideDelete: normalizeMaybeSessionFunction(
        listConfig.ui?.hideDelete ?? !list.graphql.isEnabled.delete
      ),

      item: null, // part of resolver
    } satisfies ListMetaSource

    adminMetaRoot.lists.push(adminMetaRoot.listsByKey[listKey])
  }

  let uniqueViewCount = -1
  const stringViewsToIndex: Record<string, number> = {}
  function getViewId(view: string) {
    if (stringViewsToIndex[view] !== undefined) return stringViewsToIndex[view]

    uniqueViewCount++
    stringViewsToIndex[view] = uniqueViewCount
    adminMetaRoot.views.push(view)
    return uniqueViewCount
  }

  for (const [listKey, list] of Object.entries(initialisedLists)) {
    if (omittedLists.includes(listKey)) continue

    const listMeta = adminMetaRoot.listsByKey[listKey]

    function getFieldMeta(fieldKey: string, field: InitialisedList['fields'][string]) {
      assertValidView(
        field.views,
        `The \`views\` on the implementation of the field type at lists.${listKey}.fields.${fieldKey}`
      )

      const isNonNull = (['read', 'create', 'update'] as const).filter(
        operation => field.graphql.isNonNull[operation]
      )
      return {
        // FieldMeta
        key: fieldKey,
        label: field.ui.label,
        description: field.ui.description,
        fieldMeta: null,
        viewsIndex: getViewId(field.views),
        customViewsIndex:
          field.ui.views === null
            ? null
            : (assertValidView(field.views, `lists.${listKey}.fields.${fieldKey}.ui.views`),
              getViewId(field.ui.views)),
        search: list.ui.searchableFields.get(fieldKey) ?? null,

        // FieldMetaSource_
        listKey: listKey,
        fieldKey: fieldKey,
        isFilterable:
          field.input?.where && field.graphql.isEnabled.filter
            ? (_, context) =>
                context.__internal.sudo
                  ? true
                  : field.access.read.filter({
                      context,
                      session: context.session,
                      listKey: list.listKey,
                      operation: 'read',
                      kind: 'filter',
                      fieldKey,
                    })
            : () => false,

        isOrderable:
          field.input?.orderBy && field.graphql.isEnabled.order
            ? (_, context) =>
                context.__internal.sudo
                  ? true
                  : field.access.read.order({
                      context,
                      session: context.session,
                      listKey: list.listKey,
                      operation: 'read',
                      kind: 'order',
                      fieldKey,
                    })
            : () => false,

        isNonNull,
        createView: {
          fieldMode: normalizeMaybeSessionFunction(field.ui.createView.fieldMode),
          isRequired: normalizeMaybeSessionFunction(field.ui.createView.isRequired ?? false),
        },
        itemView: {
          fieldMode: field.ui.itemView.fieldMode,
          fieldPosition: field.ui.itemView.fieldPosition,
          isRequired: field.ui.itemView.isRequired,
        },
        listView: {
          fieldMode: normalizeMaybeSessionFunction(field.ui.listView.fieldMode),
        },

        item: null, // part of resolver
        itemField: null, // part of resolver
      } satisfies FieldMetaSource
    }

    // populate .fields
    for (const [fieldKey, field] of Object.entries(list.fields)) {
      // if the field is a relationship field and is related to an omitted list, skip.
      if (field.dbField.kind === 'relation' && omittedLists.includes(field.dbField.list)) continue
      if (Object.values(field.graphql.isEnabled).every(x => x === false)) continue
      const fieldMeta = getFieldMeta(fieldKey, field)

      listMeta.fields.push(fieldMeta)
      listMeta.fieldsByKey[fieldKey] = fieldMeta
    }

    // populate .actions
    for (const action of list.actions) {
      listMeta.actions.push({
        // ActionMeta
        key: action.actionKey,
        label: action.ui.label,
        icon: action.ui.icon,
        messages: {
          ...action.ui.messages,
        },
        graphql: {
          arguments: action.graphql.arguments.map(arg => ({
            name: arg.name,
            type: arg.type,
            source: (() => {
              const field = arg.source && 'field' in arg.source ? arg.source.field : undefined
              if (!field) return arg.source
              return {
                field: {
                  ...getFieldMeta(arg.name, field),
                  createView: {
                    fieldMode: 'edit' as const,
                    isRequired:
                      typeof field.ui.createView.isRequired === 'boolean'
                        ? field.ui.createView.isRequired
                        : false,
                  },
                },
              }
            })(),
          })),
          names: action.graphql.names,
        },

        // ActionMetaSource_
        listKey,
        itemView: {
          ...action.ui.itemView,
        },
        listView: {
          actionMode: normalizeMaybeSessionFunction(action.ui.listView.actionMode),
        },
        item: null, // part of resolver
      })
    }

    // populate .groups
    for (const group of list.groups) {
      listMeta.groups.push({
        label: group.label,
        description: group.description,
        fields: group.fields.map(
          fieldKey => adminMetaRoot.listsByKey[listKey].fieldsByKey[fieldKey]
        ),
      })
    }
  }

  // we do this seperately to the above so that fields can check other fields to validate their config or etc.
  // (ofc they won't necessarily be able to see other field's fieldMeta)
  for (const [key, list] of Object.entries(initialisedLists)) {
    if (!list.graphql.isEnabled.query.one && !list.graphql.isEnabled.query.many) continue
    for (const fieldMetaSource of adminMetaRoot.listsByKey[key].fields) {
      // if the field is a relationship field and is related to an omitted list, skip.
      const dbField = list.fields[fieldMetaSource.fieldKey].dbField
      if (dbField.kind === 'relation' && omittedLists.includes(dbField.list)) continue

      currentAdminMeta = adminMetaRoot
      try {
        fieldMetaSource.fieldMeta = list.fields[fieldMetaSource.fieldKey].getAdminMeta?.() ?? null
      } finally {
        currentAdminMeta = undefined
      }
    }
    for (const actionMetaSource of adminMetaRoot.listsByKey[key].actions) {
      for (const arg of actionMetaSource.graphql.arguments) {
        if (!arg.source || !('field' in arg.source)) continue

        const action = list.actions.find(action => action.actionKey === actionMetaSource.key)
        const initialisedArg = action?.graphql.arguments.find(
          initialisedArg =>
            initialisedArg.name === arg.name &&
            initialisedArg.source &&
            'field' in initialisedArg.source
        )
        const field =
          initialisedArg?.source && 'field' in initialisedArg.source
            ? initialisedArg.source.field
            : undefined
        if (!field) continue

        currentAdminMeta = adminMetaRoot
        try {
          arg.source.field.fieldMeta = field.getAdminMeta?.() ?? null
        } finally {
          currentAdminMeta = undefined
        }
      }
    }
  }

  return adminMetaRoot
}

type AdminMetaField = AdminMeta['lists'][number]['fields'][number]
type AdminMetaAction = AdminMeta['lists'][number]['actions'][number]

/**
 * Resolves shared Admin UI metadata for a single request.
 *
 * Request-dependent metadata functions are evaluated with the supplied Keystone context, and the
 * returned metadata is rebuilt as a request-local object. This prevents transformations made by
 * `resolveAdminMeta` from mutating the shared metadata source or leaking into another request.
 * The hook itself is invoked by the Admin Meta GraphQL resolver after this function returns.
 */
export async function resolveAdminMetaForRequest(
  adminMetaRoot: AdminMetaSource,
  context: KeystoneContext
): Promise<AdminMeta> {
  const resolvedFields = new Map<FieldMetaSource, AdminMetaField>()

  async function resolveField(field: FieldMetaSource): Promise<AdminMetaField> {
    const existingField = resolvedFields.get(field)
    if (existingField) return existingField

    const itemArgs = {
      session: context.session,
      context,
      listKey: field.listKey,
      fieldKey: field.fieldKey,
      item: null,
      itemField: null,
    }
    const resolvedField = {
      key: field.key,
      label: field.label,
      description: field.description,
      fieldMeta: cloneAdminMetaValue(field.fieldMeta),
      viewsIndex: field.viewsIndex,
      customViewsIndex: field.customViewsIndex,
      search: field.search,
      isNonNull: [...field.isNonNull],
      isFilterable: await resolveAdminMetaValue(field.isFilterable, {}, context),
      isOrderable: await resolveAdminMetaValue(field.isOrderable, {}, context),
      createView: {
        fieldMode: cloneAdminMetaValue(
          await resolveAdminMetaValue(field.createView.fieldMode, {}, context)
        ),
        isRequired: cloneAdminMetaValue(
          await resolveAdminMetaValue(field.createView.isRequired, {}, context)
        ),
      },
      itemView: {
        fieldMode: cloneAdminMetaValue(
          await resolveAdminMetaValue(field.itemView.fieldMode, itemArgs, context)
        ),
        fieldPosition: await resolveAdminMetaValue(field.itemView.fieldPosition, itemArgs, context),
        isRequired: cloneAdminMetaValue(
          await resolveAdminMetaValue(field.itemView.isRequired, itemArgs, context)
        ),
      },
      listView: {
        fieldMode: cloneAdminMetaValue(
          await resolveAdminMetaValue(field.listView.fieldMode, {}, context)
        ),
      },
    } satisfies AdminMetaField

    resolvedFields.set(field, resolvedField)
    return resolvedField
  }

  async function resolveAction(action: ActionMetaSource): Promise<AdminMetaAction> {
    const itemArgs = {
      session: context.session,
      context,
      listKey: action.listKey,
      actionKey: action.key,
      item: null,
    }
    const actionArguments = []

    for (const argument of action.graphql.arguments) {
      const source = argument.source
      let resolvedSource = argument.source

      if (source && 'field' in source) {
        resolvedSource = {
          field: await resolveField(source.field),
        }
      } else if (source && 'itemField' in source) {
        resolvedSource = {
          itemField: source.itemField,
        }
      }

      actionArguments.push({
        name: argument.name,
        type: argument.type,
        source: resolvedSource,
      })
    }

    return {
      key: action.key,
      label: action.label,
      icon: action.icon,
      messages: { ...action.messages },
      graphql: {
        arguments: actionArguments,
        names: cloneAdminMetaValue(action.graphql.names),
      },
      itemView: {
        actionMode: cloneAdminMetaValue(
          await resolveAdminMetaValue(action.itemView.actionMode, itemArgs, context)
        ),
        navigation: action.itemView.navigation,
        hidePrompt: action.itemView.hidePrompt,
        hideToast: action.itemView.hideToast,
      },
      listView: {
        actionMode: cloneAdminMetaValue(
          await resolveAdminMetaValue(action.listView.actionMode, {}, context)
        ),
      },
    }
  }

  const lists: AdminMeta['lists'] = []
  for (const list of adminMetaRoot.lists) {
    const fields = []
    for (const field of list.fields) {
      fields.push(await resolveField(field))
    }

    const groups = []
    for (const group of list.groups) {
      const groupFields = []
      for (const field of group.fields) {
        groupFields.push(await resolveField(field))
      }
      groups.push({
        label: group.label,
        description: group.description,
        fields: groupFields,
      })
    }

    const actions = []
    for (const action of list.actions) {
      actions.push(await resolveAction(action))
    }

    lists.push({
      key: list.key,
      label: list.label,
      singular: list.singular,
      plural: list.plural,
      path: list.path,
      labelField: list.labelField,
      fields,
      groups,
      actions,
      graphql: {
        names: cloneAdminMetaValue(list.graphql.names),
      },
      pageSize: list.pageSize,
      initialColumns: [...list.initialColumns],
      initialSearchFields: [...list.initialSearchFields],
      initialSort: cloneAdminMetaValue(list.initialSort),
      initialFilter: cloneAdminMetaValue(
        await resolveAdminMetaValue(list.initialFilter, {}, context)
      ),
      hiddenFilter: cloneAdminMetaValue(
        await resolveAdminMetaValue(list.hiddenFilter, {}, context)
      ),
      isSingleton: list.isSingleton,
      hideNavigation: await resolveAdminMetaValue(list.hideNavigation, {}, context),
      hideCreate: await resolveAdminMetaValue(list.hideCreate, {}, context),
      hideDelete: await resolveAdminMetaValue(list.hideDelete, {}, context),
    })
  }

  return { lists }
}

let currentAdminMeta: undefined | AdminMetaSource

export function getAdminMetaForRelationshipField() {
  if (currentAdminMeta) return currentAdminMeta
  throw new Error('unexpected call to getAdminMetaInRelationshipField')
}

function assertValidView(view: string, location: string) {
  if (view.includes('\\')) {
    throw new Error(
      `${location} contains a backslash, which is invalid. You need to use a module path that is resolved from where 'keystone start' is run (see https://github.com/keystonejs/keystone/pull/7805)`
    )
  }

  if (view.startsWith('/') || /^[A-Za-z]:\//.test(view)) {
    throw new Error(
      `${location} is an absolute path, which is invalid. You need to use a module path that is resolved from where 'keystone start' is run (see https://github.com/keystonejs/keystone/pull/7805)`
    )
  }
}

/**
 * Resolves one static or request-dependent Admin UI metadata value.
 *
 * Function values receive the location-specific arguments and the current Keystone context; both
 * synchronous and asynchronous results are supported. Static values are returned unchanged. This
 * helper does not clone object results, so callers must apply the appropriate request-local clone
 * when a resolved value will be exposed to `resolveAdminMeta`.
 */
async function resolveAdminMetaValue<Value>(
  value: Value | ((args: any, context: KeystoneContext) => MaybePromise<Value>),
  args: any,
  context: KeystoneContext
): Promise<Value> {
  if (typeof value === 'function') {
    return await (value as (args: any, context: KeystoneContext) => MaybePromise<Value>)(
      args,
      context
    )
  }
  return value
}

/**
 * Creates a request-local copy of a JSON-like admin metadata value.
 *
 * The metadata source is shared across requests, but `resolveAdminMeta` is
 * allowed to transform the value it receives. Cloning recursively prevents a
 * hook that mutates a nested object or array from mutating shared metadata or
 * leaking that mutation into a later request.
 *
 * This is intentionally a JSON-tree clone, not a general-purpose deep clone.
 * Admin metadata should contain JSON-compatible values; values such as
 * `Date`, `Map`, `Set`, `RegExp`, and class instances are not preserved by
 * this helper and must be normalised before reaching it.
 */
function cloneAdminMetaValue<Value>(value: Value): Value {
  if (Array.isArray(value)) {
    return value.map(cloneAdminMetaValue) as Value
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneAdminMetaValue(nestedValue)])
    ) as Value
  }
  return value
}

function normalizeMaybeSessionFunction<
  Return extends string | boolean | object | null | number | undefined,
>(input: MaybeSessionFunction<Return, BaseListTypeInfo>): EmptyResolver<Return> {
  if (typeof input !== 'function') return () => input
  return (_, context) => input({ context, session: context.session })
}
