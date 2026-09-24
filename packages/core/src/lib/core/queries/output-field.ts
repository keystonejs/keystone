import { type CacheHint, maybeCacheControlFromInfo } from '@apollo/cache-control-types'
import type { GraphQLResolveInfo } from 'graphql/index.js'

import { g } from '../../../index.ts'
import { itemFieldsExtension } from '../../../types/item-field.ts'
import type {
  BaseItem,
  FindManyArgsValue,
  KeystoneContext,
  NextFieldType,
} from '../../../types/index.ts'
import { getAccessFilters, getReadFieldAccess, getOperationQueryAccess } from '../access-control.ts'
import type { InitialisedList } from '../initialise-lists.ts'
import type { ResolvedDBField, ResolvedRelationDBField } from '../resolve-relationships.ts'
import { type IdType, getDBFieldKeyForFieldOnMultiField, weakMemoize } from '../utils.ts'
import * as queries from './resolvers.ts'
import { accessControlledFilter } from './resolvers.ts'
import { addSelection } from '../../../types/item-selection.ts'
import { getOutputFieldRequirements } from './select.ts'

// On Node, include promise continuations before dispatching. Other runtimes
// can dispatch in an immediate or timer when they don't provide nextTick.
const scheduleBatch: (callback: () => void) => void =
  typeof process === 'object' && typeof process.nextTick === 'function'
    ? callback => {
        Promise.resolve().then(() => process.nextTick(callback))
      }
    : typeof setImmediate === 'function'
      ? setImmediate
      : callback => {
          setTimeout(callback)
        }

function getRelationVal(
  dbField: ResolvedRelationDBField,
  id: IdType,
  foreignList: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  fk: IdType | null | undefined
) {
  const oppositeDbField = foreignList.resolvedDbFields[dbField.field]
  if (oppositeDbField.kind !== 'relation') throw new Error('failed assert')

  if (dbField.mode === 'many') {
    const relationFilter = {
      [dbField.field]: oppositeDbField.mode === 'many' ? { some: { id } } : { id },
    }
    return {
      findMany: async (
        args: FindManyArgsValue,
        select?: Readonly<Record<string, true | undefined>>
      ) => queries.findMany(args, foreignList, context, info, select, relationFilter),
      count: async ({ where }: { where: Record<string, unknown> }) =>
        queries.count({ where }, foreignList, context, info, relationFilter),
    }
  } else {
    return async (select?: Readonly<Record<string, true | undefined>>) => {
      if (fk === null) {
        // If the foreign key is explicitly null, there's no need to anything else,
        // since we know the related item doesn't exist.
        return null
      }
      // for one-to-many relationships, the one side always owns the foreign key
      // so that means we have the id for the related item and we're fetching it by _its_ id.
      // for the a one-to-one relationship though, the id might be on the related item
      // so we need to fetch the related item by the id of the current item on the foreign key field
      const currentItemOwnsForeignKey = fk !== undefined
      const idFieldKey = currentItemOwnsForeignKey ? 'id' : `${dbField.field}Id`
      return fetchRelatedItem(context)(foreignList)(
        idFieldKey,
        select,
        currentItemOwnsForeignKey ? fk : id
      )
    }
  }
}

type RelatedItemRequest = {
  promise: Promise<BaseItem | undefined>
  resolve: (item: BaseItem | undefined) => void
  reject: (error: unknown) => void
  selections: Set<Readonly<Record<string, true | undefined>>> | undefined
}

type RelatedItemSelection = {
  select: Record<string, true> | undefined
  key: string
}

const relatedItemSelections = weakMemoize(
  (_requested: Readonly<Record<string, true | undefined>>) =>
    new Map<string, RelatedItemSelection>()
)

function prepareRelatedItemSelection(
  idFieldKey: string,
  requested: Readonly<Record<string, true | undefined>> | undefined
): RelatedItemSelection {
  // GraphQL selections are frozen and shared between sibling resolvers. Custom
  // resolvers can pass mutable selections, which must be normalized on every load.
  const cache =
    requested && Object.isFrozen(requested) ? relatedItemSelections(requested) : undefined
  const cached = cache?.get(idFieldKey)
  if (cached) return cached

  let select: Record<string, true> | undefined
  if (requested) {
    select = { id: true, [idFieldKey]: true }
    addSelection(select, requested)
  }
  const selection = {
    select,
    key: JSON.stringify([idFieldKey, select ? Object.keys(select).sort() : null]),
  }
  cache?.set(idFieldKey, selection)
  return selection
}

function mergeRelatedItemSelections(
  idFieldKey: string,
  selections: RelatedItemRequest['selections']
): RelatedItemSelection {
  if (selections === undefined) return prepareRelatedItemSelection(idFieldKey, undefined)
  const firstRequested = selections.values().next().value
  const first = prepareRelatedItemSelection(idFieldKey, firstRequested)
  if (!first.select || selections.size === 1) return first

  let select: Record<string, true> | undefined
  for (const requested of selections) {
    if (requested === firstRequested) continue
    const selection = prepareRelatedItemSelection(idFieldKey, requested)
    if (selection.key === first.key) continue
    select ??= { ...first.select }
    addSelection(select, selection.select)
  }
  return select ? { select, key: JSON.stringify([idFieldKey, Object.keys(select).sort()]) } : first
}

// Merge queued selections per ID, then batch IDs with matching selections.
// Context identity keeps sessions, sudo, and transactions isolated. Only pending
// loads are shared; subsequent batches must evaluate access again.
const fetchRelatedItem = weakMemoize((context: KeystoneContext) =>
  weakMemoize((foreignList: InitialisedList) => {
    const batches = new Map<string, Map<IdType, RelatedItemRequest>>()
    return (
      idFieldKey: string,
      requested: Readonly<Record<string, true | undefined>> | undefined,
      id: IdType
    ) => {
      let batch = batches.get(idFieldKey)
      if (!batch) {
        const requests = new Map<IdType, RelatedItemRequest>()
        batch = requests
        batches.set(idFieldKey, batch)
        void new Promise<void>(scheduleBatch).then(() => {
          batches.delete(idFieldKey)
          dispatchRelatedItems(context, foreignList, idFieldKey, requests)
        })
      }
      let request = batch.get(id)
      if (!request) {
        let resolve!: RelatedItemRequest['resolve']
        let reject!: RelatedItemRequest['reject']
        const promise = new Promise<BaseItem | undefined>((resolveItem, rejectItem) => {
          resolve = resolveItem
          reject = rejectItem
        })
        request = {
          promise,
          resolve,
          reject,
          selections: requested === undefined ? undefined : new Set(),
        }
        batch.set(id, request)
      }
      if (requested === undefined) {
        request.selections = undefined
      } else {
        request.selections?.add(Object.isFrozen(requested) ? requested : { ...requested })
      }
      return request.promise
    }
  })
)

function dispatchRelatedItems(
  context: KeystoneContext,
  foreignList: InitialisedList,
  idFieldKey: string,
  requests: Map<IdType, RelatedItemRequest>
) {
  const groups = new Map<
    string,
    {
      select: Record<string, true> | undefined
      requests: Map<IdType, RelatedItemRequest>
    }
  >()
  for (const [id, request] of requests) {
    const { select, key } = mergeRelatedItemSelections(idFieldKey, request.selections)
    let group = groups.get(key)
    if (!group) {
      group = { select, requests: new Map() }
      groups.set(key, group)
    }
    group.requests.set(id, request)
  }
  for (const group of groups.values()) {
    fetchRelatedItems(context, foreignList, group.select, idFieldKey, [
      ...group.requests.keys(),
    ]).then(
      items => {
        for (const [id, request] of group.requests) request.resolve(items.get(id))
      },
      error => {
        for (const request of group.requests.values()) request.reject(error)
      }
    )
  }
}

async function fetchRelatedItems(
  context: KeystoneContext,
  foreignList: InitialisedList,
  select: Record<string, true> | undefined,
  idFieldKey: string,
  toFetch: readonly IdType[]
) {
  const operationAccess = await getOperationQueryAccess(foreignList, context, 'one')
  if (!operationAccess) {
    return new Map<IdType, BaseItem>()
  }

  const accessFilters = await getAccessFilters(foreignList, context, 'query')
  if (accessFilters === false) {
    return new Map<IdType, BaseItem>()
  }

  const resolvedWhere = await accessControlledFilter(
    foreignList,
    context,
    { [idFieldKey]: { in: toFetch } },
    accessFilters
  )

  const results = await context.prisma[foreignList.listKey].findMany({
    where: resolvedWhere,
    select,
  })
  return new Map<IdType, BaseItem>(results.map((x: any) => [x[idFieldKey], x]))
}

function getValueForDBField(
  item: BaseItem,
  dbField: ResolvedDBField,
  id: IdType,
  fieldPath: string,
  context: KeystoneContext,
  lists: Record<string, InitialisedList>,
  info: GraphQLResolveInfo
) {
  if (dbField.kind === 'multi') {
    return Object.fromEntries(
      Object.keys(dbField.fields).map(innerDBFieldKey => {
        const keyOnDbValue = getDBFieldKeyForFieldOnMultiField(fieldPath, innerDBFieldKey)
        return [innerDBFieldKey, item[keyOnDbValue] as any]
      })
    )
  }
  if (dbField.kind === 'relation') {
    // If we're holding a foreign key value, let's take advantage of that.
    let fk: IdType | undefined
    if (dbField.mode === 'one' && dbField.foreignIdField.kind !== 'none') {
      fk = item[`${fieldPath}Id`] as IdType
    }
    return getRelationVal(dbField, id, lists[dbField.list], context, info, fk)
  } else {
    return item[fieldPath] as any
  }
}

export function outputTypeField(
  output: NextFieldType['output'],
  dbField: ResolvedDBField,
  cacheHint: CacheHint | undefined,
  listKey: string,
  fieldKey: string,
  lists: Record<string, InitialisedList>
) {
  const list = lists[listKey]

  const resolveValue = (
    item: BaseItem,
    args: any,
    context: KeystoneContext,
    info: GraphQLResolveInfo
  ) => {
    if (cacheHint && info) {
      maybeCacheControlFromInfo(info)?.setCacheHint(cacheHint)
    }

    const value = getValueForDBField(
      item,
      dbField,
      item.id as IdType,
      fieldKey,
      context,
      lists,
      info
    )
    return output.resolve ? output.resolve({ value, item }, args, context, info) : value
  }

  return g.field({
    type: output.type,
    deprecationReason: output.deprecationReason,
    description: output.description,
    args: output.args,
    extensions: {
      ...output.extensions,
      [itemFieldsExtension]: getOutputFieldRequirements(list, fieldKey, output),
    },
    resolve(item: BaseItem, args, context, info) {
      const fieldAccess = getReadFieldAccess(item, list, fieldKey, context)
      if (typeof fieldAccess === 'boolean') {
        return fieldAccess ? resolveValue(item, args, context, info) : null
      }
      return fieldAccess.then(allowed => (allowed ? resolveValue(item, args, context, info) : null))
    },
  })
}
