import path from 'node:path'
import type {
  BaseFieldTypeInfo,
  BaseListTypeInfo,
  ConditionalFieldFilter,
  ConditionalFieldFilterCase,
  KeystoneConfig,
  KeystoneContext,
  MaybeBooleanItemFunctionWithFilter,
  MaybeFieldFunction,
  MaybeItemFieldFunction,
  MaybeItemFieldFunctionWithFilter,
  MaybePromise,
  MaybeSessionFunction,
} from '../types'
import type { FieldGroupMeta, FieldMeta, ListMeta } from '../types/admin-meta'
import type { GraphQLNames } from '../types/utils'

import type { InitialisedList } from './core/initialise-lists'
import { humanize } from './utils'

type EmptyResolver<Return> = (args: {}, context: KeystoneContext) => MaybePromise<Return>

type FieldMetaSource_ = {
  listKey: string
  fieldKey: string
  isOrderable: EmptyResolver<boolean>
  isFilterable: EmptyResolver<boolean>

  isNonNull: ('read' | 'create' | 'update')[] // TODO: FIXME: flattened?
  createView: {
    fieldMode: EmptyResolver<ConditionalFieldFilter<'edit' | 'hidden', BaseListTypeInfo>>
    isRequired: EmptyResolver<ConditionalFieldFilterCase<BaseListTypeInfo>>
  }
  itemView: {
    fieldMode: MaybeItemFieldFunctionWithFilter<
      'edit' | 'read' | 'hidden',
      BaseListTypeInfo,
      BaseFieldTypeInfo
    >
    fieldPosition: MaybeItemFieldFunction<'form' | 'sidebar', BaseListTypeInfo, BaseFieldTypeInfo>
    isRequired: MaybeBooleanItemFunctionWithFilter<BaseListTypeInfo, BaseFieldTypeInfo>
  }
  listView: {
    fieldMode: EmptyResolver<'read' | 'hidden'>
  }
}

export type FieldMetaSource = FieldMetaSource_ &
  Omit<FieldMeta, keyof FieldMetaSource_ | 'controller' | 'graphql' | 'views'>

type FieldGroupMetaSource_ = {
  fields: FieldMetaSource[]
}
export type FieldGroupMetaSource = FieldGroupMetaSource_ &
  Omit<FieldGroupMeta, keyof FieldGroupMetaSource_>

type ListMetaSource_ = {
  fields: FieldMetaSource[]
  fieldsByKey: Record<string, FieldMetaSource>
  groups: FieldGroupMetaSource[]
  graphql: { names: GraphQLNames }
  pageSize: number
  initialColumns: string[]
  initialSearchFields: string[]
  initialSort: { field: string; direction: 'ASC' | 'DESC' } | null
  isSingleton: boolean

  hideNavigation: EmptyResolver<boolean>
  hideCreate: EmptyResolver<boolean>
  hideDelete: EmptyResolver<boolean>
}
export type ListMetaSource = ListMetaSource_ & Omit<ListMeta, keyof ListMetaSource_>

export type AdminMetaSource = {
  lists: ListMetaSource[]
  listsByKey: Record<string, ListMetaSource>
  views: string[]
  isAccessAllowed: (context: KeystoneContext) => MaybePromise<boolean>
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
      initialSearchFields = [...list.ui.triviallySearchableFields]
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
          | { field: string; direction: 'ASC' | 'DESC' }
          | undefined) ?? null,
      isSingleton: list.isSingleton,

      hideNavigation: normalizeMaybeSessionFunction(listConfig.ui?.hideNavigation ?? false),
      hideCreate: normalizeMaybeSessionFunction(
        listConfig.ui?.hideCreate ?? !list.graphql.isEnabled.create
      ),
      hideDelete: normalizeMaybeSessionFunction(
        listConfig.ui?.hideDelete ?? !list.graphql.isEnabled.delete
      ),
    }

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

  // populate .fields array
  for (const [listKey, list] of Object.entries(initialisedLists)) {
    if (omittedLists.includes(listKey)) continue

    for (const [fieldKey, field] of Object.entries(list.fields)) {
      // if the field is a relationship field and is related to an omitted list, skip.
      if (field.dbField.kind === 'relation' && omittedLists.includes(field.dbField.list)) continue
      if (Object.values(field.graphql.isEnabled).every(x => x === false)) continue
      assertValidView(
        field.views,
        `The \`views\` on the implementation of the field type at lists.${listKey}.fields.${fieldKey}`
      )

      const baseOrderFilterArgs = { fieldKey, listKey: list.listKey }
      const isNonNull = (['read', 'create', 'update'] as const).filter(
        operation => field.graphql.isNonNull[operation]
      )
      const fieldMeta = {
        path: fieldKey, // TODO: deprecated, remove in breaking change
        label: field.ui.label ?? humanize(fieldKey),
        description: field.ui.description ?? null,
        fieldMeta: null,

        listKey: listKey,
        fieldKey: fieldKey,
        isFilterable: normalizeIsOrderFilter(
          field.input?.where ? field.graphql.isEnabled.filter : false,
          baseOrderFilterArgs
        ),
        isOrderable: normalizeIsOrderFilter(
          field.input?.orderBy ? field.graphql.isEnabled.orderBy : false,
          baseOrderFilterArgs
        ),

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
          isRequired: normalizeMaybeSessionFunction(field.ui.createView.isRequired ?? false),
        },
        itemView: {
          fieldMode: field.ui.itemView.fieldMode,
          fieldPosition: field.ui.itemView.fieldPosition,
          isRequired: field.ui.itemView.isRequired ?? false,
        },
        listView: {
          fieldMode: normalizeMaybeSessionFunction(field.ui.listView.fieldMode),
        },
      } satisfies FieldMetaSource

      adminMetaRoot.listsByKey[listKey].fields.push(fieldMeta)
      adminMetaRoot.listsByKey[listKey].fieldsByKey[fieldKey] = fieldMeta
    }

    for (const group of list.groups) {
      adminMetaRoot.listsByKey[listKey].groups.push({
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
    if (list.graphql.isEnabled.query === false) continue
    for (const fieldMetaSource of adminMetaRoot.listsByKey[key].fields) {
      // if the field is a relationship field and is related to an omitted list, skip.
      const dbField = list.fields[fieldMetaSource.path].dbField
      if (dbField.kind === 'relation' && omittedLists.includes(dbField.list)) continue

      currentAdminMeta = adminMetaRoot
      try {
        fieldMetaSource.fieldMeta = list.fields[fieldMetaSource.path].getAdminMeta?.() ?? null
      } finally {
        currentAdminMeta = undefined
      }
    }
  }

  return adminMetaRoot
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

  if (path.isAbsolute(view)) {
    throw new Error(
      `${location} is an absolute path, which is invalid. You need to use a module path that is resolved from where 'keystone start' is run (see https://github.com/keystonejs/keystone/pull/7805)`
    )
  }
}

function normalizeMaybeSessionFunction<Return extends string | boolean | object>(
  input: MaybeSessionFunction<Return, BaseListTypeInfo>
): EmptyResolver<Return> {
  if (typeof input !== 'function') return () => input
  return (_, context) => input({ context, session: context.session })
}

function normalizeIsOrderFilter(
  input: MaybeFieldFunction<BaseListTypeInfo>,
  baseOrderFilterArgs: { listKey: string; fieldKey: string }
): EmptyResolver<boolean> {
  if (typeof input !== 'function') return () => input
  return (_, context) => input({ context, session: context.session, ...baseOrderFilterArgs })
}
