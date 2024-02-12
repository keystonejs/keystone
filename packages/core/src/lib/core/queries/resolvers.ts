import { maybeCacheControlFromInfo } from '@apollo/cache-control-types'
import type { GraphQLResolveInfo } from 'graphql'
import type { FindManyArgsValue, BaseItem, KeystoneContext, OrderDirection } from '../../../types'
import { getOperationAccess, getAccessFilters } from '../access-control'
import {
  type PrismaFilter,
  type UniquePrismaFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  type UniqueInputFilter,
  type InputFilter,
} from '../where-inputs'
import { limitsExceededError, userInputError } from '../graphql-errors'
import type { InitialisedList } from '../initialise-lists'
import { getDBFieldKeyForFieldOnMultiField, runWithPrisma } from '../utils'
import { checkFilterOrderAccess } from '../filter-order-access'

// we want to put the value we get back from the field's unique where resolver into an equals
// rather than directly passing the value as the filter (even though Prisma supports that), we use equals
// because we want to disallow fields from providing an arbitrary filter
export function mapUniqueWhereToWhere (uniqueWhere: UniquePrismaFilter) {
  const where: PrismaFilter = {}
  for (const key in uniqueWhere) {
    where[key] = { equals: uniqueWhere[key] }
  }
  return where
}

function* traverse (
  list: InitialisedList,
  inputFilter: InputFilter
): Generator<{ fieldKey: string, list: InitialisedList }, void, unknown> {
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

export async function accessControlledFilter (
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

export async function findOne (
  args: { where: UniqueInputFilter },
  list: InitialisedList,
  context: KeystoneContext
) {
  // check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'query')
  if (!operationAccess) return null

  const accessFilters = await getAccessFilters(list, context, 'query')
  if (accessFilters === false) return null

  // validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(args.where, list, context)
  const resolvedWhere = mapUniqueWhereToWhere(uniqueWhere)

  // findOne requires at least one filter
  if (Object.keys(resolvedWhere).length === 0) return null

  // check filter access
  for (const fieldKey in resolvedWhere) {
    await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter')
  }

  // apply access control
  const filter = await accessControlledFilter(list, context, resolvedWhere, accessFilters)

  return runWithPrisma(context, list, model => model.findFirst({ where: filter }))
}

export async function findMany (
  { where, take, skip, orderBy: rawOrderBy, cursor }: FindManyArgsValue,
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
): Promise<BaseItem[]> {
  const maxTake = (list.graphql.types.findManyArgs.take.defaultValue ?? Infinity) as number
  if ((take ?? Infinity) > maxTake) {
    throw limitsExceededError({ list: list.listKey, type: 'maxTake', limit: maxTake })
  }

  // TODO: rewrite, this actually checks access
  const orderBy = await resolveOrderBy(rawOrderBy, list, context)

  const operationAccess = await getOperationAccess(list, context, 'query')
  if (!operationAccess) return []

  const accessFilters = await getAccessFilters(list, context, 'query')
  if (accessFilters === false) return []

  const resolvedWhere = await resolveWhereInput(where, list, context)

  // check filter access (TODO: why isn't this using resolvedWhere)
  await checkFilterOrderAccess([...traverse(list, where)], context, 'filter')

  const filter = await accessControlledFilter(list, context, resolvedWhere, accessFilters)

  const results = await runWithPrisma(context, list, model =>
    model.findMany({
      where: extraFilter === undefined ? filter : { AND: [filter, extraFilter] },
      orderBy,
      take: take ?? undefined,
      skip,
      cursor: cursor ?? undefined,
    })
  )

  if (list.cacheHint) {
    maybeCacheControlFromInfo(info)?.setCacheHint(
      list.cacheHint({ results, operationName: info.operation.name?.value, meta: false }) as any
    )
  }
  return results
}

async function resolveOrderBy (
  orderBy: readonly Record<string, any>[],
  list: InitialisedList,
  context: KeystoneContext
): Promise<readonly Record<string, OrderDirection>[]> {
  // Check input format. FIXME: Group all errors
  orderBy.forEach(orderBySelection => {
    const keys = Object.keys(orderBySelection)
    if (keys.length !== 1) {
      throw userInputError(
        `Only a single key must be passed to ${list.graphql.types.orderBy.graphQLType.name}`
      )
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
  await checkFilterOrderAccess(orderByKeys, context, 'orderBy')

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

export async function count (
  { where }: { where: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
) {
  const operationAccess = await getOperationAccess(list, context, 'query')
  if (!operationAccess) return 0

  const accessFilters = await getAccessFilters(list, context, 'query')
  if (accessFilters === false) return 0

  const resolvedWhere = await resolveWhereInput(where, list, context)

  // check filter access (TODO: why isn't this using resolvedWhere)
  await checkFilterOrderAccess([...traverse(list, where)], context, 'filter')

  const filter = await accessControlledFilter(list, context, resolvedWhere, accessFilters)

  const count = await runWithPrisma(context, list, model =>
    model.count({
      where: extraFilter === undefined ? filter : { AND: [filter, extraFilter] },
    })
  )
  if (list.cacheHint) {
    maybeCacheControlFromInfo(info)?.setCacheHint(
      list.cacheHint({
        results: count,
        operationName: info.operation.name?.value,
        meta: true,
      }) as any
    )
  }
  return count
}
