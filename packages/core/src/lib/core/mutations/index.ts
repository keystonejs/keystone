import { GInputObjectType, type GNullableInputType } from '@graphql-ts/schema'
import type { GraphQLNamedType } from 'graphql'

import type { BaseItem, KeystoneContext } from '../../../types'
import type { UniquePrismaFilter } from '../../../types/prisma'
import { g } from '../../../types/schema'
import { withSpan } from '../../otel'
import {
  cannotActionForItem,
  cannotForItem,
  enforceFieldLevelAccessControl,
  enforceListLevelAccessControl,
  getAccessFilters,
  getOperationAccess,
} from '../access-control'
import { checkFilterOrderAccess } from '../filter-order-access'
import {
  accessDeniedError,
  extensionError,
  relationshipError,
  resolverError,
} from '../graphql-errors'
import { runSideEffectOnlyHook, validate } from '../hooks'
import type { InitialisedAction, InitialisedList } from '../initialise-lists'
import { mapUniqueWhereToWhere, traverse } from '../queries/resolvers'
import type { ResolvedDBField } from '../resolve-relationships'
import {
  type IdType,
  getDBFieldKeyForFieldOnMultiField,
  promiseAllRejectWithAllErrors,
} from '../utils'
import {
  type InputFilter,
  type UniqueInputFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
} from '../where-inputs'
import {
  RelationshipErrors,
  resolveRelateToManyForCreateInput,
  resolveRelateToManyForUpdateInput,
} from './nested-mutation-many-input-resolvers'
import {
  resolveRelateToOneForCreateInput,
  resolveRelateToOneForUpdateInput,
} from './nested-mutation-one-input-resolvers'

async function getFilteredItem(
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
  let where = mapUniqueWhereToWhere(uniqueWhere, list)

  await checkFilterOrderAccess([...traverse(list, where as any)], context, 'filter')

  if (typeof accessFilters === 'object') {
    where = { AND: [where, await resolveWhereInput(accessFilters, list, context)] }
  }

  const item = await context.prisma[list.listKey].findFirst({ where })
  if (item !== null) return item

  throw accessDeniedError(cannotForItem(operation, list))
}

async function createSingle__(
  inputData: Record<string, unknown>,
  list: InitialisedList,
  context: KeystoneContext
) {
  return await withSpan(
    `create ${list.graphql.names.outputTypeNameLower}`,
    async span => {
      // throw an accessDeniedError if not allowed
      await enforceListLevelAccessControl(context, 'create', list, inputData, undefined)
      await enforceFieldLevelAccessControl(context, 'create', list, inputData, undefined)
      const { beforeOperation, afterOperation, data } = await resolveInputForCreateOrUpdate(
        list,
        context,
        inputData,
        undefined
      )

      // before operation
      await beforeOperation()

      // operation
      const result = await context.prisma[list.listKey].create({
        data: list.isSingleton ? { ...data, id: 1 } : data,
      })

      span.setAttribute('keystone.result.id', result?.id ?? '')
      return { item: result, afterOperation }
    },
    {
      'keystone.list': list.listKey,
      'keystone.operation': 'create',
    }
  )
}

export class NestedMutationState {
  // afterOperation hooks run once the enclosing transaction has committed, so
  // they are deferred here and later invoked with a post-commit context (see
  // `afterOperation` below) rather than the transaction-bound context they were
  // created with.
  #afterOperations: ((context: KeystoneContext) => void | Promise<void>)[] = []
  #context: KeystoneContext
  constructor(context: KeystoneContext) {
    this.#context = context
  }
  async create(data: Record<string, unknown>, list: InitialisedList) {
    const context = this.#context

    const operationAccess = await getOperationAccess(list, context, 'create')
    if (!operationAccess) throw accessDeniedError(cannotForItem('create', list))

    // before operation AND operation
    const { item, afterOperation } = await createSingle__(data, list, context)

    // after operation
    this.#afterOperations.push(afterContext => afterOperation(afterContext, item))
    return { id: item.id as IdType }
  }

  async afterOperation(context: KeystoneContext) {
    await promiseAllRejectWithAllErrors(this.#afterOperations.map(async x => x(context)))
  }
}

type InputData = Record<string, unknown> | null | undefined
type UpdateInput = {
  where: UniqueInputFilter
  data: InputData
}
type ActionInput = {
  where: UniqueInputFilter
  args: Record<string, unknown>
}

async function updateSingle__(
  { where, data: inputData }: UpdateInput,
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter
) {
  return await withSpan(
    `update ${list.graphql.names.outputTypeNameLower}`,
    async span => {
      // run the access-filtered read, any nested writes, and the update itself
      // atomically, so a failure at any step rolls back cleanly instead of
      // leaving a partially-written item behind. The transaction-bound context
      // is shadowed as `context` so every call inside runs against it.
      const { result, afterOperation } = await context.transaction(async context => {
        // validate and resolve the input filter
        const uniqueWhere = await resolveUniqueWhereInput(where, list, context)

        // filter and item access control - throws an AccessDeniedError if not allowed
        const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'update')

        // throw an accessDeniedError if not allowed
        await enforceListLevelAccessControl(context, 'update', list, inputData ?? {}, item)
        await enforceFieldLevelAccessControl(context, 'update', list, inputData ?? {}, item)
        const { beforeOperation, afterOperation, data } = await resolveInputForCreateOrUpdate(
          list,
          context,
          inputData ?? {},
          item
        )

        // before operation
        await beforeOperation()

        // operation
        const result = await context.prisma[list.listKey].update({
          where: { id: item.id },
          data,
        })
        span.setAttribute('keystone.result.id', result?.id ?? '')

        return { result, afterOperation }
      })

      // after operation - runs once the transaction has committed, using the
      // original (post-commit) context; an error here does not roll the write back
      await afterOperation(context, result)

      return result
    },
    { 'keystone.list': list.listKey, 'keystone.operation': 'update' }
  )
}

async function deleteSingle__(
  where: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter
) {
  return await withSpan(
    `delete ${list.graphql.names.outputTypeNameLower}`,
    async span => {
      // run the access-filtered read, the validate/beforeOperation hooks, and the
      // delete itself atomically. The transaction-bound context is shadowed as
      // `context` so every call inside runs against it.
      const { result, item } = await context.transaction(async context => {
        // validate and resolve the input filter
        const uniqueWhere = await resolveUniqueWhereInput(where, list, context)

        // filter and item access control throw an AccessDeniedError if not allowed
        // apply access.filter.* controls
        const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'delete')

        await enforceListLevelAccessControl(context, 'delete', list, {}, item)
        // WARNING: no field level access control for delete operations

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
        span.setAttribute('keystone.result.id', result?.id ?? '')

        return { result, item }
      })

      // after operation - runs once the transaction has committed, using the
      // original (post-commit) context; an error here does not roll the delete back
      await runSideEffectOnlyHook(list, 'afterOperation', {
        operation: 'delete' as const,
        listKey: list.listKey,
        context,
        item: undefined,
        resolvedData: undefined,
        inputData: undefined,
        originalItem: item,
      })

      return result
    },
    { 'keystone.list': list.listKey, 'keystone.operation': 'delete' }
  )
}

async function actionSingle__(
  context: KeystoneContext,
  list: InitialisedList,
  action: InitialisedAction,
  { where, args }: ActionInput
) {
  return await withSpan(
    action.otel,
    async span => {
      // no before operation hook for actions

      // operation
      const result = await action.resolve(
        {
          listKey: list.listKey,
          actionKey: action.actionKey,
          where,
          args,
        },
        context
      )
      span.setAttribute('keystone.result.id', (result?.id as string) ?? '')

      // no after operation hook for actions
      return result
    },
    { 'keystone.list': list.listKey, 'keystone.action': action.actionKey }
  )
}

//

// create a single item and its nested writes atomically: the item and every
// nested create it triggers are written inside one transaction, so a failure at
// any point rolls all of them back instead of leaving orphaned related rows
// behind. `createSingle__` is also used for nested creates (where it must run
// inside the parent's transaction), so the transaction is opened here at the top
// level rather than inside `createSingle__` to avoid nested interactive
// transactions. afterOperation hooks run after the transaction has committed,
// using the original (post-commit) `context` - consistent with the existing
// behaviour where an error thrown from afterOperation does not roll back the
// write.
async function createSingleInTransaction(
  inputData: InputData,
  list: InitialisedList,
  context: KeystoneContext
) {
  const { item, afterOperation } = await context.transaction(async context =>
    createSingle__(inputData ?? {}, list, context)
  )
  await afterOperation(context, item)
  return item
}

async function createOne(inputData: InputData, list: InitialisedList, context: KeystoneContext) {
  const operationAccess = await getOperationAccess(list, context, 'create')
  if (!operationAccess) throw accessDeniedError(cannotForItem('create', list))

  // get list-level access control filters
  //   NOTHING - no filters for create operations

  // operation
  return createSingleInTransaction(inputData, list, context)
}

async function createMany(
  inputDatas: InputData[],
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'create')
  // WARNING: we do not short-circuit here, we throw for each

  // get list-level access control filters
  //   NOTHING - no filters for create operations

  // each item is created in its own transaction and is independent of the
  // others (partial success is preserved), but items are run one at a time so we
  // never hold multiple interactive transactions open at once - SQLite is a
  // single-writer database and cannot service concurrent write transactions.
  return runSequentially(inputDatas, async inputData => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('create', list))

    // operation
    return createSingleInTransaction(inputData, list, context)
  })
}

async function updateOne(
  updateInput: UpdateInput,
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'update')
  if (!operationAccess) throw accessDeniedError(cannotForItem('update', list))

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update')

  return updateSingle__(updateInput, list, context, accessFilters)
}

async function updateMany(
  updateManyInput: UpdateInput[],
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'update')
  // WARNING: we do not short-circuit here, we throw for each

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update')

  // each item is updated in its own transaction (see createMany for why they run
  // one at a time); partial success across the batch is preserved.
  return runSequentially(updateManyInput, async updateInput => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('update', list))

    return updateSingle__(updateInput, list, context, accessFilters)
  })
}

async function deleteOne(
  where: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'delete')
  if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list))

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'delete')

  return deleteSingle__(where, list, context, accessFilters)
}

async function deleteMany(
  wheres: UniqueInputFilter[],
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'delete')
  // WARNING: we do not short-circuit here, we throw for each

  // get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'delete')

  // each item is deleted in its own transaction (see createMany for why they run
  // one at a time); partial success across the batch is preserved.
  return runSequentially(wheres, async where => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list))

    return deleteSingle__(where, list, context, accessFilters)
  })
}

async function actionOne(
  input: ActionInput,
  list: InitialisedList,
  context: KeystoneContext,
  action: InitialisedAction
) {
  const operationAccess = await action.access({
    context,
    session: context.session, // TODO: remove in breaking change
    listKey: list.listKey,
    actionKey: action.actionKey,
  })
  if (!operationAccess) throw accessDeniedError(cannotActionForItem(action, list))

  // get list-level access control filters
  //   NOTHING - no filters for action operations

  return actionSingle__(context, list, action, input)
}

async function actionMany(
  inputs: ActionInput[],
  list: InitialisedList,
  context: KeystoneContext,
  action: InitialisedAction
) {
  const operationAccess = await action.access({
    context,
    session: context.session, // TODO: remove in breaking change
    listKey: list.listKey,
    actionKey: action.actionKey,
  })
  // WARNING: we do not short-circuit here, we throw for each

  // get list-level access control filters
  //   NOTHING - no filters for action operations

  return inputs.map(async ({ where, ...args }) => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotActionForItem(action, list))

    return actionSingle__(context, list, action, { where, args })
  })
}

async function getResolvedData(
  list: InitialisedList,
  hookArgs: {
    context: KeystoneContext
    listKey: string
    inputData: Record<string, any>
  } & ({ operation: 'create'; item: undefined } | { operation: 'update'; item: BaseItem }),
  nestedMutationState: NestedMutationState
) {
  const { context, operation } = hookArgs
  let resolvedData = hookArgs.inputData

  // apply non-relationship field type input resolvers
  const resolverErrors: { error: Error; tag: string }[] = []
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve

        if (inputResolver && field.dbField.kind !== 'relation') {
          try {
            return [fieldKey, await inputResolver(resolvedData[fieldKey], context, undefined)]
          } catch (error: any) {
            resolverErrors.push({ error, tag: `${list.listKey}.${fieldKey}` })
          }
        }
        return [fieldKey, resolvedData[fieldKey]] as const
      })
    )
  )

  if (resolverErrors.length) throw resolverError(resolverErrors)

  // apply relationship field type input resolvers
  const relationshipErrors: { error: Error; tag: string }[] = []
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
                  return resolveRelateToOneForCreateInput(nestedMutationState, context, foreignList)
                }

                if (field.dbField.mode === 'one' && operation === 'update') {
                  return resolveRelateToOneForUpdateInput(nestedMutationState, context, foreignList)
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
  const fieldsErrors: { error: Error; tag: string }[] = []
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        try {
          return [
            fieldKey,
            operation === 'create'
              ? await field.hooks.resolveInput.create({
                  ...hookArgs,
                  itemField: undefined,
                  inputFieldData: hookArgs.inputData[fieldKey],
                  resolvedData,
                  resolvedFieldData: resolvedData[fieldKey],
                  fieldKey,
                })
              : await field.hooks.resolveInput.update({
                  ...hookArgs,
                  itemField: hookArgs.item[fieldKey],
                  inputFieldData: hookArgs.inputData[fieldKey],
                  resolvedData,
                  resolvedFieldData: resolvedData[fieldKey],
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

async function resolveInputForCreateOrUpdate(
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

  // Return the full resolved input (ready for prisma level operation),
  // and the afterOperation hook to be applied
  return {
    data: transformForPrismaClient(list, context, hookArgs.resolvedData),
    beforeOperation: async () => {
      // before operation
      await runSideEffectOnlyHook(list, 'beforeOperation', hookArgs)
    },
    // `afterContext` is the context afterOperation hooks run against. The write
    // happens inside a transaction, but afterOperation hooks run once that
    // transaction has committed, so they are handed a post-commit context rather
    // than the (now closed) transaction-bound context used for the write.
    afterOperation: async (afterContext: KeystoneContext, updatedItem: BaseItem) => {
      await nestedMutationState.afterOperation(afterContext)

      // after operation
      await runSideEffectOnlyHook(list, 'afterOperation', {
        ...hookArgs,
        context: afterContext,
        item: updatedItem,
      })
    },
  }
}

function transformInnerDBField(
  dbField: Exclude<ResolvedDBField, { kind: 'multi' }>,
  context: KeystoneContext,
  value: unknown
) {
  if (dbField.kind === 'scalar' && dbField.scalar === 'Json' && value === null) {
    return context.__internal.prisma.DbNull
  }
  return value
}

function transformForPrismaClient(
  list: InitialisedList,
  context: KeystoneContext,
  data: Record<string, any>
) {
  return Object.fromEntries([
    ...(function* () {
      for (const fieldKey in data) {
        if (!(fieldKey in list.fields)) {
          // either the types are wrong, or someone didnt use them, either way, bail out
          throw new Error(`Attempted to use unknown field "${fieldKey}"`)
        }
        const value = data[fieldKey]
        const { dbField } = list.fields[fieldKey]

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
    })(),
  ])
}

// Run each item through `fn` one at a time (never concurrently), returning an
// array of per-item promises. Partial-success semantics are preserved: a rejected
// item settles independently and never prevents later items from running. Running
// sequentially means we only ever hold one interactive transaction open at a time,
// which is required for SQLite (a single-writer database) and harmless elsewhere.
function runSequentially<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R>[] {
  const results: Promise<R>[] = []
  // a promise that always resolves (never rejects), used to gate the next item on
  // the previous one having settled regardless of its outcome
  let gate: Promise<unknown> = Promise.resolve()
  for (const [index, item] of items.entries()) {
    const result = gate.then(() => fn(item, index))
    gate = result.then(
      () => {},
      () => {}
    )
    results.push(result)
  }
  return results
}

// This is not a thing that I really agree with but it's to make the behaviour consistent with old keystone.
// Basically, old keystone uses Promise.allSettled and then after that maps that into promises that resolve and reject,
// whereas the new stuff is just like "here are some promises" with no guarantees about the order they will be settled in.
// That doesn't matter when they all resolve successfully because the order they resolve successfully in
// doesn't affect anything, If some reject though, the order that they reject in will be the order in the errors array
// and some of our tests rely on the order of the graphql errors array. They shouldn't, but they do.
function promisesButSettledWhenAllSettledAndInOrder<T extends Promise<unknown>[]>(promises: T): T {
  const resultsPromise = Promise.allSettled(promises)
  return promises.map(async (_, i) => {
    const result: PromiseSettledResult<Awaited<T>> = (await resultsPromise)[i] as any
    return result.status === 'fulfilled'
      ? Promise.resolve(result.value)
      : Promise.reject(result.reason)
  }) as T
}

function nonNull<T extends GNullableInputType>(t: T) {
  if (t === g.Empty) return t
  return g.nonNull(t)
}

export function getMutationsForList(list: InitialisedList) {
  const defaultUniqueWhereInput = list.isSingleton ? { id: '1' } : undefined

  const createOne_ = g.field({
    type: list.graphql.types.output,
    args: {
      data: g.arg({ type: nonNull(list.graphql.types.create) }),
    },
    async resolve(_, { data }, context, info) {
      return await withSpan(
        `mutation ${info.fieldName}`,
        async () => {
          return createOne(data, list, context)
        },
        { 'keystone.list': list.listKey, 'keystone.operation': 'create' }
      )
    },
  })

  const createMany_ = g.field({
    type: g.list(list.graphql.types.output),
    args: {
      data: g.arg({
        type: g.nonNull(g.list(nonNull(list.graphql.types.create))),
      }),
    },
    async resolve(_, { data }, context, info) {
      return await withSpan(
        `mutation ${info.fieldName}`,
        async () => {
          return promisesButSettledWhenAllSettledAndInOrder(await createMany(data, list, context))
        },
        { 'keystone.list': list.listKey, 'keystone.operation': 'create', 'keystone.many': true }
      )
    },
  })

  const updateOne_ = g.field({
    type: list.graphql.types.output,
    args: {
      where: g.arg({
        type: g.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: defaultUniqueWhereInput,
      }),
      data: g.arg({ type: nonNull(list.graphql.types.update) }),
    },
    async resolve(_, { where, data }, context, info) {
      return await withSpan(
        `mutation ${info.fieldName}`,
        async () => {
          return updateOne({ where, data }, list, context)
        },
        { 'keystone.list': list.listKey, 'keystone.operation': 'update' }
      )
    },
  })

  const updateManyInput = g.inputObject({
    name: list.graphql.names.updateManyInputName,
    fields: {
      where: g.arg({
        type: g.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: defaultUniqueWhereInput,
      }),
      data: g.arg({ type: nonNull(list.graphql.types.update) }),
    },
  })
  const updateMany_ = g.field({
    type: g.list(list.graphql.types.output),
    args: {
      data: g.arg({
        type: g.nonNull(g.list(g.nonNull(updateManyInput))),
      }),
    },
    async resolve(_, { data }, context, info) {
      return await withSpan(
        `mutation ${info.fieldName}`,
        async () => {
          return promisesButSettledWhenAllSettledAndInOrder(await updateMany(data, list, context))
        },
        { 'keystone.list': list.listKey, 'keystone.operation': 'update', 'keystone.many': true }
      )
    },
  })

  const deleteOne_ = g.field({
    type: list.graphql.types.output,
    args: {
      where: g.arg({
        type: g.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: defaultUniqueWhereInput,
      }),
    },
    async resolve(_, { where }, context, info) {
      return await withSpan(
        `mutation ${info.fieldName}`,
        async () => {
          return deleteOne(where, list, context)
        },
        { 'keystone.list': list.listKey, 'keystone.operation': 'delete' }
      )
    },
  })

  const deleteMany_ = g.field({
    type: g.list(list.graphql.types.output),
    args: {
      where: g.arg({
        type: g.nonNull(g.list(g.nonNull(list.graphql.types.uniqueWhere))),
      }),
    },
    async resolve(_, { where }, context, info) {
      return await withSpan(
        `mutation ${info.fieldName}`,
        async () => {
          return promisesButSettledWhenAllSettledAndInOrder(await deleteMany(where, list, context))
        },
        { 'keystone.list': list.listKey, 'keystone.operation': 'delete', 'keystone.many': true }
      )
    },
  })

  const collectedTypes: GraphQLNamedType[] = []
  const { isEnabled } = list.graphql
  if (isEnabled.type) {
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    collectedTypes.push(list.graphql.types.output)
    if (isEnabled.query || isEnabled.update || isEnabled.delete) {
      collectedTypes.push(list.graphql.types.uniqueWhere)
    }
    if (isEnabled.query) {
      for (const field of Object.values(list.fields)) {
        if (
          isEnabled.query &&
          field.graphql.isEnabled.read &&
          field.unreferencedConcreteInterfaceImplementations
        ) {
          // this _IS_ actually necessary since they aren't implicitly referenced by other types, unlike the types above
          collectedTypes.push(...field.unreferencedConcreteInterfaceImplementations)
        }
      }
      collectedTypes.push(list.graphql.types.where)
      collectedTypes.push(list.graphql.types.orderBy)
    }
    if (isEnabled.update) {
      if (list.graphql.types.update instanceof GInputObjectType) {
        collectedTypes.push(list.graphql.types.update)
      }
      collectedTypes.push(updateManyInput)
    }
    if (isEnabled.create) {
      if (list.graphql.types.create instanceof GInputObjectType) {
        collectedTypes.push(list.graphql.types.create)
      }
    }
  }

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
      ...Object.fromEntries(
        (function* () {
          for (const action of list.actions) {
            yield [
              action.graphql.names.one,
              g.field({
                type: list.graphql.types.output,
                args: {
                  where: g.arg({
                    type: g.nonNull(list.graphql.types.uniqueWhere),
                    defaultValue: defaultUniqueWhereInput,
                  }),
                  ...action.graphql.types.arguments,
                },
                async resolve(_, { where, ...args }, context, info) {
                  return await withSpan(
                    `mutation ${info.fieldName}`,
                    async () => {
                      return actionOne({ where, args }, list, context, action)
                    },
                    { 'keystone.list': list.listKey, 'keystone.action': action.actionKey }
                  )
                },
              }),
            ]
            yield [
              action.graphql.names.many,
              g.field({
                type: g.list(list.graphql.types.output),
                args: {
                  data: g.arg({
                    type: g.nonNull(g.list(g.nonNull(action.graphql.types.args))),
                  }),
                },
                async resolve(_, { data }, context, info) {
                  return await withSpan(
                    `mutation ${info.fieldName}`,
                    async () => {
                      return promisesButSettledWhenAllSettledAndInOrder(
                        await actionMany(data as ActionInput[], list, context, action)
                      )
                    },
                    {
                      'keystone.list': list.listKey,
                      'keystone.action': action.actionKey,
                      'keystone.many': true,
                    }
                  )
                },
              }),
            ]
          }
        })()
      ),
    },
    types: collectedTypes,
  }
}
