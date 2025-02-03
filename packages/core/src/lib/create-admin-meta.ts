import path from 'node:path'
import type {
  BaseListTypeInfo,
  KeystoneContext,
  MaybeFieldFunction,
  MaybeItemFunction,
  MaybePromise,
  MaybeSessionFunction,
  KeystoneConfig,
} from '../types'
import type {
  GraphQLNames,
} from '../types/utils'
import type {
  FieldMeta,
  FieldGroupMeta,
  ListMeta,
} from '../types/admin-meta'

import { humanize } from './utils'
import type { InitialisedList } from './core/initialise-lists'

type ContextFunction<Return> = (context: KeystoneContext) => MaybePromise<Return>

type FieldMetaRootVal_ = {
  key: string
  listKey: string
  isOrderable: ContextFunction<boolean>
  isFilterable: ContextFunction<boolean>

  isNonNull: ('read' | 'create' | 'update')[] // TODO: FIXME: flattened?
  createView: {
    fieldMode: ContextFunction<'edit' | 'hidden'>
  }
  itemView: {
    fieldMode: MaybeItemFunction<'edit' | 'read' | 'hidden', BaseListTypeInfo>
    fieldPosition: MaybeItemFunction<'form' | 'sidebar', BaseListTypeInfo>
  }
  listView: {
    fieldMode: ContextFunction<'read' | 'hidden'>
  }
}

export type FieldMetaRootVal = FieldMetaRootVal_
  & Omit<FieldMeta, keyof FieldMetaRootVal_ | 'controller' | 'graphql' | 'views'>

type FieldGroupMetaRootVal_ = {
  fields: FieldMetaRootVal[]
}
export type FieldGroupMetaRootVal = FieldGroupMetaRootVal_ & Omit<FieldGroupMeta, keyof FieldGroupMetaRootVal_>

type ListMetaRootVal_ = {
  fields: FieldMetaRootVal[]
  fieldsByKey: Record<string, FieldMetaRootVal>
  groups: FieldGroupMetaRootVal[]
  graphql: { names: GraphQLNames }
  pageSize: number
  initialColumns: string[]
  initialSearchFields: string[]
  initialSort: { field: string, direction: 'ASC' | 'DESC' } | null
  isSingleton: boolean

  hideNavigation: ContextFunction<boolean>
  hideCreate: ContextFunction<boolean>
  hideDelete: ContextFunction<boolean>
}
export type ListMetaRootVal = ListMetaRootVal_ & Omit<ListMeta, keyof ListMetaRootVal_>

export type AdminMetaRootVal = {
  lists: ListMetaRootVal[]
  listsByKey: Record<string, ListMetaRootVal>
  views: string[]
  isAccessAllowed: (context: KeystoneContext) => MaybePromise<boolean>
}

export function createAdminMeta (
  config: KeystoneConfig,
  initialisedLists: Record<string, InitialisedList>
) {
  const { lists } = config
  const adminMetaRoot: AdminMetaRootVal = {
    listsByKey: {},
    lists: [],
    views: [],
    isAccessAllowed: config.ui?.isAccessAllowed,
  }

  const omittedLists: string[] = []

  for (const [listKey, list] of Object.entries(initialisedLists)) {
    const listConfig = lists[listKey]

    // TODO: is this reasonable?
    if (list.graphql.isEnabled.query === false) {
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
      initialSearchFields = [...list.ui.searchableFields.keys()]
    }

    const maximumPageSize = Math.min(
      listConfig.ui?.listView?.pageSize ?? 50,
      (list.graphql.types.findManyArgs.take.defaultValue ?? Infinity) as number
    )

    adminMetaRoot.listsByKey[listKey] = {
      key: listKey,
      path: list.ui.labels.path,
      description: listConfig.ui?.description ?? listConfig.description ?? null,

      label: list.ui.labels.label,
      labelField: list.ui.labelField,
      singular: list.ui.labels.singular,
      plural: list.ui.labels.plural,

      fields: [],
      fieldsByKey: {},
      groups: [],
      graphql: {
        names: list.graphql.names,
      },

      pageSize: maximumPageSize,
      initialColumns,
      initialSearchFields,
      initialSort:
        (listConfig.ui?.listView?.initialSort as
          | { field: string, direction: 'ASC' | 'DESC' }
          | undefined) ?? null,
      isSingleton: list.isSingleton,

      hideNavigation: normalizeMaybeSessionFunction(listConfig.ui?.hideNavigation ?? false),
      hideCreate: normalizeMaybeSessionFunction(listConfig.ui?.hideCreate ?? !list.graphql.isEnabled.create),
      hideDelete: normalizeMaybeSessionFunction(listConfig.ui?.hideDelete ?? !list.graphql.isEnabled.delete),
    }

    adminMetaRoot.lists.push(adminMetaRoot.listsByKey[listKey])
  }

  let uniqueViewCount = -1
  const stringViewsToIndex: Record<string, number> = {}
  function getViewId (view: string) {
    if (stringViewsToIndex[view] !== undefined) return stringViewsToIndex[view]

    uniqueViewCount++
    stringViewsToIndex[view] = uniqueViewCount
    adminMetaRoot.views.push(view)
    return uniqueViewCount
  }

  // populate .fields array
  for (const [listKey, list] of Object.entries(initialisedLists)) {
    if (omittedLists.includes(listKey)) continue

    for (const [fieldKey, field] of Object.entries(list.fields)) {
      // if the field is a relationship field and is related to an omitted list, skip.
      if (field.dbField.kind === 'relation' && omittedLists.includes(field.dbField.list)) continue
      if (Object.values(field.graphql.isEnabled).every(x => x === false)) continue
      assertValidView(field.views, `The \`views\` on the implementation of the field type at lists.${listKey}.fields.${fieldKey}`)

      const baseOrderFilterArgs = { fieldKey, listKey: list.listKey }
      const isNonNull = (['read', 'create', 'update'] as const).filter(operation => field.graphql.isNonNull[operation])
      const fieldMeta = {
        path: fieldKey, // TODO: deprecated, remove in breaking change
        label: field.ui.label ?? humanize(fieldKey),
        description: field.ui.description ?? null,
        fieldMeta: null,

        key: fieldKey,
        listKey: listKey,
        isFilterable: normalizeIsOrderFilter(field.input?.where ? field.graphql.isEnabled.filter : false, baseOrderFilterArgs),
        isOrderable: normalizeIsOrderFilter(field.input?.orderBy ? field.graphql.isEnabled.orderBy : false, baseOrderFilterArgs),

        viewsIndex: getViewId(field.views),
        customViewsIndex:
          field.ui.views === null
            ? null
            : (assertValidView(field.views, `lists.${listKey}.fields.${fieldKey}.ui.views`),
              getViewId(field.ui.views)),
        search: list.ui.searchableFields.get(fieldKey) ?? null,

        isNonNull,
        createView: {
          fieldMode: normalizeMaybeSessionFunction(field.ui.createView.fieldMode),
        },
        itemView: {
          fieldMode: field.ui.itemView.fieldMode,
          fieldPosition: field.ui.itemView.fieldPosition,
        },
        listView: {
          fieldMode: normalizeMaybeSessionFunction(field.ui.listView.fieldMode),
        },
      }

      adminMetaRoot.listsByKey[listKey].fields.push(fieldMeta)
      adminMetaRoot.listsByKey[listKey].fieldsByKey[fieldKey] = fieldMeta
    }

    for (const group of list.groups) {
      adminMetaRoot.listsByKey[listKey].groups.push({
        label: group.label,
        description: group.description,
        fields: group.fields.map(fieldKey => adminMetaRoot.listsByKey[listKey].fieldsByKey[fieldKey]),
      })
    }
  }

  // we do this seperately to the above so that fields can check other fields to validate their config or etc.
  // (ofc they won't necessarily be able to see other field's fieldMeta)
  for (const [key, list] of Object.entries(initialisedLists)) {
    if (list.graphql.isEnabled.query === false) continue
    for (const fieldMetaRootVal of adminMetaRoot.listsByKey[key].fields) {
      // if the field is a relationship field and is related to an omitted list, skip.
      const dbField = list.fields[fieldMetaRootVal.path].dbField
      if (dbField.kind === 'relation' && omittedLists.includes(dbField.list)) continue

      currentAdminMeta = adminMetaRoot
      try {
        fieldMetaRootVal.fieldMeta = list.fields[fieldMetaRootVal.path].getAdminMeta?.() ?? null
      } finally {
        currentAdminMeta = undefined
      }
    }
  }

  return adminMetaRoot
}

let currentAdminMeta: undefined | AdminMetaRootVal

export function getAdminMetaForRelationshipField () {
  if (currentAdminMeta) return currentAdminMeta
  throw new Error('unexpected call to getAdminMetaInRelationshipField')
}

function assertValidView (view: string, location: string) {
  if (view.includes('\\')) {
    throw new Error(`${location} contains a backslash, which is invalid. You need to use a module path that is resolved from where 'keystone start' is run (see https://github.com/keystonejs/keystone/pull/7805)`)
  }

  if (path.isAbsolute(view)) {
    throw new Error(`${location} is an absolute path, which is invalid. You need to use a module path that is resolved from where 'keystone start' is run (see https://github.com/keystonejs/keystone/pull/7805)`)
  }
}

function normalizeMaybeSessionFunction<Return extends string | boolean> (
  input: MaybeSessionFunction<Return, BaseListTypeInfo>
): ContextFunction<Return> {
  if (typeof input !== 'function') return () => input
  return context => input({ context, session: context.session })
}

function normalizeIsOrderFilter (
  input: MaybeFieldFunction<BaseListTypeInfo>,
  baseOrderFilterArgs: { listKey: string, fieldKey: string }
): ContextFunction<boolean> {
  if (typeof input !== 'function') return () => input
  return context => input({ context, session: context.session, ...baseOrderFilterArgs })
}
