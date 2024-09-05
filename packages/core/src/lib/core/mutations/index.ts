import {
  type BaseItem,
  type KeystoneContext
} from '../../../types'
import { Empty, } from '../../../types/schema/graphql-ts-schema'
import { type UniquePrismaFilter } from '../../../types/prisma'
import { graphql } from '../../../types/schema'
import { type ResolvedDBField } from '../resolve-relationships'
import { type InitialisedList } from '../initialise-lists'
import {
  type IdType,
  promiseAllRejectWithAllErrors,
  getDBFieldKeyForFieldOnMultiField,
} from '../utils'
import {
  type InputFilter,
  type UniqueInputFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
} from '../where-inputs'
import {
  accessDeniedError,
  extensionError,
  relationshipError,
  resolverError,
} from '../graphql-errors'
import {
  cannotForItem,
  getOperationAccess,
  getAccessFilters,
  enforceListLevelAccessControl,
  enforceFieldLevelAccessControl
} from '../access-control'
import { checkFilterOrderAccess } from '../filter-order-access'
import { runSideEffectOnlyHook, validate } from '../hooks'

import { mapUniqueWhereToWhere } from '../queries/resolvers'
import {
  RelationshipErrors,
  resolveRelateToManyForCreateInput,
  resolveRelateToManyForUpdateInput,
} from './nested-mutation-many-input-resolvers'
import {
  resolveRelateToOneForCreateInput,
  resolveRelateToOneForUpdateInput,
} from './nested-mutation-one-input-resolvers'

async function getFilteredItem (
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter,
  operation: 'update' | 'delete'
) {
  // early exit if they want to exclude everything
  if (accessFilters === false) {
    throw accessDeniedError(cannotForItem(operation, list))
  }

  // merge the filter access control and try to get the item
  let where = mapUniqueWhereToWhere(uniqueWhere)
  if (typeof accessFilters === 'object') {
    where = { AND: [where, await resolveWhereInput(accessFilters, list, context)] }
  }

  const item = await context.prisma[list.listKey].findFirst({ where })
  if (item !== null) return item

  throw accessDeniedError(cannotForItem(operation, list))
}

async function createSingle (
  inputData: Record<string, unknown>,
  list: InitialisedList,
  context: KeystoneContext
) {
  // throw an accessDeniedError if not allowed
  await enforceListLevelAccessControl(
    context,
    'create',
    list,
    inputData,
    undefined,
  )

  await enforceFieldLevelAccessControl(
    context,
    'create',
    list,
    inputData,
    undefined,
  )

  const { afterOperation, data } = await resolveInputForCreateOrUpdate(
    list,
    context,
    inputData,
    undefined
  )

  const item = await context.prisma[list.listKey].create({
    data: list.isSingleton ? { ...data, id: 1 } : data
  })

  return { item, afterOperation }
}

export class NestedMutationState {
  #afterOperations: (() => void | Promise<void>)[] = []
  #context: KeystoneContext
  constructor (context: KeystoneContext) {
    this.#context = context
  }
  async create (data: Record<string, unknown>, list: InitialisedList) {
    const context = this.#context

    const operationAccess = await getOperationAccess(list, context, 'create')
    if (!operationAccess) throw accessDeniedError(cannotForItem('create', list))

    const { item, afterOperation } = await createSingle(data, list, context)

    this.#afterOperations.push(() => afterOperation(item))
    return { id: item.id as IdType }
  }

  async afterOperation () {
    await promiseAllRejectWithAllErrors(this.#afterOperations.map(async x => x()))
  }
}

type InputData = Record<string, unknown> | null

export async function createOne (
  inputData: InputData,
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'create')
  if (!operationAccess) throw accessDeniedError(cannotForItem('create', list))

  // operation
  const { item, afterOperation } = await createSingle(inputData ?? {}, list, context)

  // after operation
  await afterOperation(item)

  return item
}

export async function createMany (
  inputDatas: InputData[],
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'create')

  return inputDatas.map(async inputData => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('create', list))

    // operation
    const { item, afterOperation } = await createSingle(inputData ?? {}, list, context)

    // after operation
    await afterOperation(item)

    return item
  })
}

type UpdateInput = {
  where: UniqueInputFilter
  data: InputData
}

async function updateSingle (
  {
    where,
    data: inputData
  }: UpdateInput,
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter
) {
  // validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(where, list, context)

  // check filter access
  const fieldKey = Object.keys(uniqueWhere)[0]
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter')

  // filter and item access control - throws an AccessDeniedError if not allowed
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'update')

  // throw an accessDeniedError if not allowed
  await enforceListLevelAccessControl(
    context,
    'update',
    list,
    inputData ?? {},
    item,
  )

  await enforceFieldLevelAccessControl(
    context,
    'update',
    list,
    inputData ?? {},
    item,
  )

  const { afterOperation, data } = await resolveInputForCreateOrUpdate(
    list,
    context,
    inputData ?? {},
    item
  )

  // operation
  const updatedItem = await context.prisma[list.listKey].update({
    where: { id: item.id },
    data,
  })

  // after operation
  await afterOperation(updatedItem)

  return updatedItem
}

export async function updateOne (
  updateInput: UpdateInput,
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'update')
  if (!operationAccess) throw accessDeniedError(cannotForItem('update', list))

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update')

  return updateSingle(updateInput, list, context, accessFilters)
}

export async function updateMany (
  updateManyInput: UpdateInput[],
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'update')

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update')

  return updateManyInput.map(async updateInput => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('update', list))

    return updateSingle(updateInput, list, context, accessFilters)
  })
}

async function deleteSingle (
  where: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter
) {
  // validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(where, list, context)

  // check filter access
  const fieldKey = Object.keys(uniqueWhere)[0]
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter')

  // filter and item access control throw an AccessDeniedError if not allowed
  // apply access.filter.* controls
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'delete')

  await enforceListLevelAccessControl(
    context,
    'delete',
    list,
    {},
    item,
  )

  const hookArgs = {
    operation: 'delete' as const,
    listKey: list.listKey,
    context,
    item,
    resolvedData: undefined,
    inputData: undefined,
  }

  // hooks
  await validate({ list, hookArgs })

  // before operation
  await runSideEffectOnlyHook(list, 'beforeOperation', hookArgs)

  // operation
  const result = await context.prisma[list.listKey].delete({ where: { id: item.id } })

  // after operation
  await runSideEffectOnlyHook(list, 'afterOperation', {
    ...hookArgs,
    item: undefined,
    originalItem: item,
  })

  return result
}

export async function deleteOne (
  where: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'delete')
  if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list))

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'delete')

  return deleteSingle(where, list, context, accessFilters)
}

export async function deleteMany (
  wheres: UniqueInputFilter[],
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'delete')

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'delete')

  return wheres.map(async where => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list))

    return deleteSingle(where, list, context, accessFilters)
  })
}

async function getResolvedData (
  list: InitialisedList,
  hookArgs: {
    context: KeystoneContext
    listKey: string
    inputData: Record<string, any>
  } & ({ operation: 'create', item: undefined } | { operation: 'update', item: BaseItem }),
  nestedMutationState: NestedMutationState
) {
  const { context, operation } = hookArgs
  let resolvedData = hookArgs.inputData

  // apply non-relationship field type input resolvers
  const resolverErrors: { error: Error, tag: string }[] = []
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve

        if (inputResolver && field.dbField.kind !== 'relation') {
          try {
            return [
              fieldKey,
              await inputResolver(resolvedData[fieldKey], context, undefined)
            ]
          } catch (error: any) {
            resolverErrors.push({ error, tag: `${list.listKey}.${fieldKey}` })
          }
        }
        return [
          fieldKey,
          resolvedData[fieldKey]
        ] as const
      })
    )
  )

  if (resolverErrors.length) throw resolverError(resolverErrors)

  // apply relationship field type input resolvers
  const relationshipErrors: { error: Error, tag: string }[] = []
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve
        let input = resolvedData[fieldKey]
        if (inputResolver && field.dbField.kind === 'relation') {
          const tag = `${list.listKey}.${fieldKey}`
          try {
            input = await inputResolver(
              input,
              context,
              // this third argument only applies to relationship fields
              (() => {
                if (input === undefined) {
                  // no-op: this is what we want
                  return () => undefined
                }
                if (input === null) {
                  // no-op: should this be userinputerror?
                  return () => undefined
                }
                const foreignList = list.lists[field.dbField.list]
                if (field.dbField.mode === 'many' && operation === 'create') {
                  return resolveRelateToManyForCreateInput(
                    nestedMutationState,
                    context,
                    foreignList,
                    tag
                  )
                }

                if (field.dbField.mode === 'many' && operation === 'update') {
                  return resolveRelateToManyForUpdateInput(
                    nestedMutationState,
                    context,
                    foreignList,
                    tag
                  )
                }

                if (field.dbField.mode === 'one' && operation === 'create') {
                  return resolveRelateToOneForCreateInput(
                    nestedMutationState,
                    context,
                    foreignList
                  )
                }

                if (field.dbField.mode === 'one' && operation === 'update') {
                  return resolveRelateToOneForUpdateInput(
                    nestedMutationState,
                    context,
                    foreignList
                  )
                }

                throw new Error('Unknown relationship field type input mode or operation')
              })()
            )
          } catch (error: any) {
            if (error instanceof RelationshipErrors) {
              relationshipErrors.push(...error.errors)
            } else {
              relationshipErrors.push({ error, tag })
            }
          }
        }
        return [fieldKey, input] as const
      })
    )
  )

  if (relationshipErrors.length) throw relationshipError(relationshipErrors)

  // field hooks
  const fieldsErrors: { error: Error, tag: string }[] = []
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        try {
          return [
            fieldKey,
            operation === 'create'
              ? await field.hooks.resolveInput.create({
                  ...hookArgs,
                  resolvedData,
                  fieldKey,
                })
              : await field.hooks.resolveInput.update({
                  ...hookArgs,
                  resolvedData,
                  fieldKey,
                }),
          ]
        } catch (error: any) {
          fieldsErrors.push({
            error,
            tag: `${list.listKey}.${fieldKey}.hooks.resolveInput`,
          })
          return [fieldKey, undefined]
        }
      })
    )
  )

  if (fieldsErrors.length) throw extensionError('resolveInput', fieldsErrors)

  // list hooks
  try {
    if (operation === 'create') {
      resolvedData = await list.hooks.resolveInput.create({ ...hookArgs, resolvedData })
    } else if (operation === 'update') {
      resolvedData = await list.hooks.resolveInput.update({ ...hookArgs, resolvedData })
    }
  } catch (error: any) {
    throw extensionError('resolveInput', [{ error, tag: `${list.listKey}.hooks.resolveInput` }])
  }

  return resolvedData
}

async function resolveInputForCreateOrUpdate (
  list: InitialisedList,
  context: KeystoneContext,
  inputData: Record<string, unknown>,
  item: BaseItem | undefined
) {
  const nestedMutationState = new NestedMutationState(context)
  const baseHookArgs = {
    context,
    listKey: list.listKey,
    inputData,
    resolvedData: {},
  }
  const hookArgs =
    item === undefined
      ? { ...baseHookArgs, operation: 'create' as const, item, originalItem: undefined }
      : { ...baseHookArgs, operation: 'update' as const, item, originalItem: item }

  // Take the original input and resolve all the fields down to what
  // will be saved into the database.
  hookArgs.resolvedData = await getResolvedData(list, hookArgs, nestedMutationState)

  // Apply all validation checks
  await validate({ list, hookArgs })

  // before operation
  await runSideEffectOnlyHook(list, 'beforeOperation', hookArgs)

  // Return the full resolved input (ready for prisma level operation),
  // and the afterOperation hook to be applied
  return {
    data: transformForPrismaClient(list.fields, hookArgs.resolvedData, context),
    afterOperation: async (updatedItem: BaseItem) => {
      await nestedMutationState.afterOperation()

      // after operation
      await runSideEffectOnlyHook(list, 'afterOperation', {
        ...hookArgs,
        item: updatedItem,
      })
    },
  }
}

function transformInnerDBField (
  dbField: Exclude<ResolvedDBField, { kind: 'multi' }>,
  context: KeystoneContext,
  value: unknown
) {
  if (dbField.kind === 'scalar' && dbField.scalar === 'Json' && value === null) {
    return context.__internal.prisma.DbNull
  }
  return value
}

function transformForPrismaClient (
  fields: Record<string, { dbField: ResolvedDBField }>,
  data: Record<string, any>,
  context: KeystoneContext
) {
  return Object.fromEntries(
    [...function* () {
      for (const fieldKey in data) {
        const value = data[fieldKey]
        const { dbField } = fields[fieldKey]

        if (dbField.kind === 'multi') {
          for (const innerFieldKey in value) {
            const innerFieldValue = value[innerFieldKey]
            yield [
              getDBFieldKeyForFieldOnMultiField(fieldKey, innerFieldKey),
              transformInnerDBField(dbField.fields[innerFieldKey], context, innerFieldValue),
            ]
          }

          continue
        }

        yield [fieldKey, transformInnerDBField(dbField, context, value)]
      }
    }()]
  )
}

// This is not a thing that I really agree with but it's to make the behaviour consistent with old keystone.
// Basically, old keystone uses Promise.allSettled and then after that maps that into promises that resolve and reject,
// whereas the new stuff is just like "here are some promises" with no guarantees about the order they will be settled in.
// That doesn't matter when they all resolve successfully because the order they resolve successfully in
// doesn't affect anything, If some reject though, the order that they reject in will be the order in the errors array
// and some of our tests rely on the order of the graphql errors array. They shouldn't, but they do.
function promisesButSettledWhenAllSettledAndInOrder<T extends Promise<unknown>[]> (promises: T): T {
  const resultsPromise = Promise.allSettled(promises)
  return promises.map(async (_, i) => {
    const result: PromiseSettledResult<Awaited<T>> = (await resultsPromise)[i] as any
    return result.status === 'fulfilled'
      ? Promise.resolve(result.value)
      : Promise.reject(result.reason)
  }) as T
}

function nonNull <T> (t: graphql.NullableInputType) {
  if (t === Empty) return t
  return graphql.nonNull(t)
}

export function getMutationsForList (list: InitialisedList) {
  const defaultUniqueWhereInput = list.isSingleton ? { id: '1' } : undefined

  const createOne_ = graphql.field({
    type: list.graphql.types.output,
    args: {
      data: graphql.arg({ type: nonNull(list.graphql.types.create) }),
    },
    resolve (_rootVal, { data }, context) {
      return createOne(data, list, context)
    },
  })

  const createMany_ = graphql.field({
    type: graphql.list(list.graphql.types.output),
    args: {
      data: graphql.arg({
        type: graphql.nonNull(graphql.list(nonNull(list.graphql.types.create))),
      }),
    },
    async resolve (_rootVal, { data }, context) {
      return promisesButSettledWhenAllSettledAndInOrder(await createMany(data, list, context))
    },
  })

  const updateOne_ = graphql.field({
    type: list.graphql.types.output,
    args: {
      where: graphql.arg({
        type: graphql.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: defaultUniqueWhereInput,
      }),
      data: graphql.arg({ type: nonNull(list.graphql.types.update) }),
    },
    resolve (_rootVal, { where, data }, context) {
      return updateOne({ where, data }, list, context)
    },
  })

  const updateManyInput = graphql.inputObject({
    name: list.graphql.names.updateManyInputName,
    fields: {
      where: graphql.arg({
        type: graphql.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: defaultUniqueWhereInput,
      }),
      data: graphql.arg({ type: nonNull(list.graphql.types.update) }),
    },
  })
  const updateMany_ = graphql.field({
    type: graphql.list(list.graphql.types.output),
    args: {
      data: graphql.arg({
        type: graphql.nonNull(graphql.list(nonNull(updateManyInput)))
      }),
    },
    async resolve (_rootVal, { data }, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        await updateMany(data, list, context)
      )
    },
  })

  const deleteOne_ = graphql.field({
    type: list.graphql.types.output,
    args: {
      where: graphql.arg({
        type: graphql.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: defaultUniqueWhereInput,
      }),
    },
    resolve (rootVal, { where }, context) {
      return deleteOne(where, list, context)
    },
  })

  const deleteMany_ = graphql.field({
    type: graphql.list(list.graphql.types.output),
    args: {
      where: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(list.graphql.types.uniqueWhere))),
      }),
    },
    async resolve (rootVal, { where }, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        await deleteMany(where, list, context)
      )
    },
  })

  return {
    mutations: {
      ...(list.graphql.isEnabled.create && {
        [list.graphql.names.createMutationName]: createOne_,
        [list.graphql.names.createManyMutationName]: createMany_,
      }),
      ...(list.graphql.isEnabled.update && {
        [list.graphql.names.updateMutationName]: updateOne_,
        [list.graphql.names.updateManyMutationName]: updateMany_,
      }),
      ...(list.graphql.isEnabled.delete && {
        [list.graphql.names.deleteMutationName]: deleteOne_,
        [list.graphql.names.deleteManyMutationName]: deleteMany_,
      }),
    },
    updateManyInput,
  }
}
