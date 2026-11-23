import { maybeCacheControlFromInfo } from '@apollo/cache-control-types'
import type { GraphQLResolveInfo } from 'graphql/index.js'
import type {
  BaseItem,
  FindManyArgsValue,
  KeystoneContext,
  OrderDirection,
} from '../../../types/index.ts'
import type { PrismaFilter } from '../../../types/prisma.ts'

import { checkFilterOrderAccess, getQueryOperationAndFilterAccess } from '../access-control.ts'
import {
  type UniqueInputFilter,
  type InputFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  accessControlledFilter,
  mapUniqueWhereToWhere,
} from '../where-inputs.ts'

import { limitsExceededError, userInputError } from '../graphql-errors.ts'
import type { InitialisedList } from '../initialise-lists.ts'
import { getDBFieldKeyForFieldOnMultiField } from '../utils.ts'
import { selectFromInfoForList } from './select.ts'
import { addSelection } from '../../../types/item-selection.ts'

function selectForQuery(
  list: InitialisedList,
  requested: Readonly<Record<string, true | undefined>> | undefined
) {
  if (!requested) return undefined
  const select: Record<string, true> = { id: true }
  addSelection(select, requested)
  if (!addSelection(select, list.cacheHintSelection)) return undefined
  return select
}

export async function resolveUniqueWhereWithAccess(
  inputWhere: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
): Promise<PrismaFilter> {
  await checkFilterOrderAccess([...traverseUniqueWhere(list, inputWhere)], context, 'filter')
  const uniqueWhere = await resolveUniqueWhereInput(inputWhere, list, context)
  return mapUniqueWhereToWhere(uniqueWhere, list)
}

function* traverseUniqueWhere(
  list: InitialisedList,
  uniqueWhere: UniqueInputFilter | null
): Generator<{ fieldKey: string; list: InitialisedList }, void, unknown> {
  for (const [fieldKey, value] of Object.entries(uniqueWhere ?? {})) {
    yield { fieldKey, list }
    const { dbField, input } = list.fields[fieldKey]
    if (dbField.kind !== 'relation') continue

    const relatedList = list.lists[dbField.list]
    if (input?.uniqueWhere?.arg.type === relatedList.graphql.types.uniqueWhere) {
      yield* traverseUniqueWhere(relatedList, value)
    }
  }
}

function* traverse(
  list: InitialisedList,
  inputFilter: InputFilter
): Generator<{ fieldKey: string; list: InitialisedList }, void, unknown> {
  for (const fieldKey in inputFilter) {
    const value = inputFilter[fieldKey]
    if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
      for (const condition of value) {
        yield* traverse(list, condition)
      }
    } else if (fieldKey === 'some' || fieldKey === 'none' || fieldKey === 'every') {
      yield* traverse(list, value)
    } else {
      yield { fieldKey, list }

      // if it's a relationship, check the nested filters.
      const field = list.fields[fieldKey]
      if (field.dbField.kind === 'relation' && value !== null) {
        const foreignList = list.lists[field.dbField.list]

        yield* traverse(foreignList, value)
      }
    }
  }
}

export async function findOne(
  args: { where: UniqueInputFilter },
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo
) {
  const accessFilters = await getQueryOperationAndFilterAccess(list, context, 'one')
  if (accessFilters === false) return null

  // validate and resolve the input filter
  const resolvedWhere = await resolveUniqueWhereWithAccess(args.where, list, context)

  // findOne requires at least one filter
  if (Object.keys(resolvedWhere).length === 0) return null

  // apply access control
  const filter = accessControlledFilter(resolvedWhere, accessFilters)
  const result = await context.prisma[list.listKey].findFirst({
    where: filter,
    select: selectForQuery(list, selectFromInfoForList(list, info)),
  })

  if (list.cacheHint) {
    maybeCacheControlFromInfo(info)?.setCacheHint(
      list.cacheHint({
        results: result ? [result] : [],
        operationName: info.operation.name?.value,
        meta: false,
      })
    )
  }

  return result
}

export async function findMany(
  { where, take, skip, orderBy: rawOrderBy, cursor }: FindManyArgsValue,
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  select: Readonly<Record<string, true | undefined>> | undefined,
  extraFilter?: PrismaFilter
): Promise<BaseItem[]> {
  const maxTake = (list.graphql.types.findManyArgs.take.defaultValue ?? Infinity) as number
  if (Math.abs(take ?? Infinity) > maxTake) {
    throw limitsExceededError({ list: list.listKey, type: 'maxTake', limit: maxTake })
  }

  const accessFilters = await getQueryOperationAndFilterAccess(list, context, 'many')
  if (accessFilters === false) return []

  // Check access to the user-supplied filters before invoking their resolvers.
  await checkFilterOrderAccess([...traverse(list, where)], context, 'filter')

  // check filter access for cursor
  if (cursor) {
    await checkFilterOrderAccess([...traverse(list, cursor)], context, 'filter')
  }

  const resolvedWhere = await resolveWhereInput(where, list, context)

  // WARNING: this checks .isOrderable
  const orderBy = await resolveOrderBy(rawOrderBy, list, context)

  // apply access control
  const filter = accessControlledFilter(resolvedWhere, accessFilters)
  const query = context.prisma[list.listKey].findMany({
    where: extraFilter === undefined ? filter : { AND: [filter, extraFilter] },
    orderBy,
    take: take ?? undefined,
    skip,
    cursor: cursor ?? undefined,
    select: selectForQuery(list, select),
  })
  let results: BaseItem[]
  if (cursor && accessFilters !== true) {
    // Prisma locates the cursor without the list's access filter. Check its visibility
    // concurrently with fetching the page, and discard the page if the cursor is hidden.
    const [cursorItem, items] = await Promise.all([
      context.prisma[list.listKey].findFirst({
        where: accessControlledFilter(mapUniqueWhereToWhere(cursor, list), accessFilters),
        select: { id: true },
      }),
      query,
    ])
    results = cursorItem === null ? [] : items
  } else {
    results = await query
  }

  if (list.cacheHint) {
    maybeCacheControlFromInfo(info)?.setCacheHint(
      list.cacheHint({
        results,
        operationName: info.operation.name?.value,
        meta: false,
      })
    )
  }
  return results
}

async function resolveOrderBy(
  orderBy: readonly Record<string, any>[],
  list: InitialisedList,
  context: KeystoneContext
): Promise<readonly Record<string, OrderDirection>[]> {
  // Check input format. FIXME: Group all errors
  orderBy.forEach(orderBySelection => {
    const keys = Object.keys(orderBySelection)
    if (keys.length !== 1) {
      throw userInputError(`Only a single key must be passed to ${list.graphql.types.orderBy.name}`)
    }

    const fieldKey = keys[0]
    const value = orderBySelection[fieldKey]
    if (value === null) {
      throw userInputError('null cannot be passed as an order direction')
    }
  })

  // Check orderBy access
  const orderByKeys = orderBy.map(orderBySelection => ({
    fieldKey: Object.keys(orderBySelection)[0],
    list,
  }))
  await checkFilterOrderAccess(orderByKeys, context, 'order')

  return await Promise.all(
    orderBy.map(async orderBySelection => {
      const keys = Object.keys(orderBySelection)
      const fieldKey = keys[0]
      const value = orderBySelection[fieldKey]
      const field = list.fields[fieldKey]
      const resolve = field.input!.orderBy!.resolve
      const resolvedValue = resolve ? await resolve(value, context) : value
      if (field.dbField.kind === 'multi') {
        // Note: no built-in field types support multi valued database fields *and* orderBy.
        // This code path is only relevent to custom fields which fit that criteria.
        const keys = Object.keys(resolvedValue)
        if (keys.length !== 1) {
          throw new Error(
            `Only a single key must be returned from an orderBy input resolver for a multi db field`
          )
        }
        const innerKey = keys[0]
        return {
          [getDBFieldKeyForFieldOnMultiField(fieldKey, innerKey)]: resolvedValue[innerKey],
        }
      } else {
        return { [fieldKey]: resolvedValue }
      }
    })
  )
}

export async function count(
  { where }: { where: Record<string, unknown> },
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
) {
  const accessFilters = await getQueryOperationAndFilterAccess(list, context, 'count')
  if (accessFilters === false) return 0

  await checkFilterOrderAccess([...traverse(list, where)], context, 'filter')
  const resolvedWhere = await resolveWhereInput(where, list, context)

  const filter = accessControlledFilter(resolvedWhere, accessFilters)

  const count = await context.prisma[list.listKey].count({
    where: extraFilter === undefined ? filter : { AND: [filter, extraFilter] },
  })

  if (list.cacheHint) {
    maybeCacheControlFromInfo(info)?.setCacheHint(
      list.cacheHint({
        results: count,
        operationName: info.operation.name?.value,
        meta: true,
      })
    )
  }
  return count
}
