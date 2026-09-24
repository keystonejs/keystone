import { maybeCacheControlFromInfo } from '@apollo/cache-control-types'
import type { GraphQLResolveInfo } from 'graphql/index.js'
import type {
  BaseItem,
  FindManyArgsValue,
  KeystoneContext,
  OrderDirection,
} from '../../../types/index.ts'
import type { PrismaFilter } from '../../../types/prisma.ts'

import { getAccessFilters, getOperationQueryAccess } from '../access-control.ts'
import {
  type UniqueInputFilter,
  type InputFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  mapUniqueWhereToWhere,
} from '../where-inputs.ts'

import { limitsExceededError, userInputError } from '../graphql-errors.ts'
import type { InitialisedList } from '../initialise-lists.ts'
import { getDBFieldKeyForFieldOnMultiField } from '../utils.ts'
import { checkFilterOrderAccess } from '../access-control.ts'

export function* traverse(
  list: InitialisedList,
  inputFilter: InputFilter | UniqueInputFilter
): Generator<{ fieldKey: string; list: InitialisedList }, void, unknown> {
  for (const fieldKey in inputFilter) {
    const value = inputFilter[fieldKey]
    const compound = list.compoundUnique[fieldKey]
    if (compound) {
      for (const member of compound.fields) yield { fieldKey: member, list }
    } else if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
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

export async function accessControlledFilter(
  list: InitialisedList,
  context: KeystoneContext,
  resolvedWhere: PrismaFilter,
  accessFilters: boolean | InputFilter
) {
  // Merge the filter access control
  if (typeof accessFilters === 'object') {
    resolvedWhere = { AND: [resolvedWhere, await resolveWhereInput(accessFilters, list, context)] }
  }

  return resolvedWhere
}

export async function findOne(
  args: { where: UniqueInputFilter },
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo
) {
  // check operation permission to pass into single operation
  const operationAccess = await getOperationQueryAccess(list, context, 'one')
  if (!operationAccess) return null

  const accessFilters = await getAccessFilters(list, context, 'query')
  if (accessFilters === false) return null

  // validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(args.where, list, context)
  const resolvedWhere = mapUniqueWhereToWhere(uniqueWhere, list)

  // findOne requires at least one filter
  if (Object.keys(resolvedWhere).length === 0) return null

  // check filter access
  await checkFilterOrderAccess([...traverse(list, args.where)], context, 'filter')

  // apply access control
  const filter = await accessControlledFilter(list, context, resolvedWhere, accessFilters)
  const result = await context.prisma[list.listKey].findFirst({ where: filter })

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
  extraFilter?: PrismaFilter
): Promise<BaseItem[]> {
  const maxTake = (list.graphql.types.findManyArgs.take.defaultValue ?? Infinity) as number
  if (Math.abs(take ?? Infinity) > maxTake) {
    throw limitsExceededError({ list: list.listKey, type: 'maxTake', limit: maxTake })
  }

  // check operation permission to pass into single operation
  const operationAccess = await getOperationQueryAccess(list, context, 'many')
  if (!operationAccess) return []

  const accessFilters = await getAccessFilters(list, context, 'query')
  if (accessFilters === false) return []

  // validate and resolve the input filter
  const resolvedWhere = await resolveWhereInput(where, list, context)

  // check filter access (TODO: why isn't this using resolvedWhere)
  await checkFilterOrderAccess([...traverse(list, where)], context, 'filter')

  // check filter access for cursor
  if (cursor) {
    await checkFilterOrderAccess([...traverse(list, cursor)], context, 'filter')
  }

  // WARNING: this checks .isOrderable
  const orderBy = await resolveOrderBy(rawOrderBy, list, context)

  // apply access control
  const filter = await accessControlledFilter(list, context, resolvedWhere, accessFilters)
  let resolvedCursor = cursor ? await resolveUniqueWhereInput(cursor, list, context) : undefined
  if (cursor && Object.keys(cursor).some(key => list.fields[key]?.dbField.kind === 'relation')) {
    // Prisma cursors require a database unique key. A Keystone one-to-one selector
    // can instead be resolved through an access-controlled lookup of its item.
    const cursorItem = await findOne({ where: cursor }, list, context, info)
    if (!cursorItem) return []
    resolvedCursor = { id: cursorItem.id }
  }
  const results = await context.prisma[list.listKey].findMany({
    where: extraFilter === undefined ? filter : { AND: [filter, extraFilter] },
    orderBy,
    take: take ?? undefined,
    skip,
    cursor: resolvedCursor,
  })

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
  const operationAccess = await getOperationQueryAccess(list, context, 'count')
  if (!operationAccess) return 0

  const accessFilters = await getAccessFilters(list, context, 'query')
  if (accessFilters === false) return 0

  const resolvedWhere = await resolveWhereInput(where, list, context)

  // check filter access (TODO: why isn't this using resolvedWhere)
  await checkFilterOrderAccess([...traverse(list, where)], context, 'filter')

  const filter = await accessControlledFilter(list, context, resolvedWhere, accessFilters)

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
