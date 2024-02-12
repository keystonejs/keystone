import type { KeystoneContext } from '../../../types'
import { cannotForItem, getOperationAccess, getAccessFilters } from '../access-control'
import { checkFilterOrderAccess } from '../filter-order-access'
import { accessDeniedError } from '../graphql-errors'
import type { InitialisedList } from '../initialise-lists'
import { type InputFilter, resolveUniqueWhereInput, type UniqueInputFilter } from '../where-inputs'
import { getAccessControlledItemForDelete } from './access-control'
import { runSideEffectOnlyHook } from './hooks'
import { validateDelete } from './validation'

async function deleteSingle (
  uniqueInput: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter
) {
  // validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list, context)

  // check filter access
  const fieldKey = Object.keys(uniqueWhere)[0]
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter')

  // filter and item access control throw an AccessDeniedError if not allowed
  const item = await getAccessControlledItemForDelete(list, context, uniqueWhere, accessFilters)

  const hookArgs = {
    operation: 'delete' as const,
    listKey: list.listKey,
    context,
    item,
    resolvedData: undefined,
    inputData: undefined,
  }

  // hooks
  await validateDelete({ list, hookArgs })

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

export async function deleteMany (
  uniqueInputs: UniqueInputFilter[],
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'delete')

  // Check filter permission to pass into single operation
  const accessFilters = await getAccessFilters(list, context, 'delete')

  return uniqueInputs.map(async uniqueInput => {
    // throw for each item
    if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list))

    return deleteSingle(uniqueInput, list, context, accessFilters)
  })
}

export async function deleteOne (
  uniqueInput: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
) {
  const operationAccess = await getOperationAccess(list, context, 'delete')
  if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list))

  // Check filter permission to pass into single operation
  const accessFilters = await getAccessFilters(list, context, 'delete')

  return deleteSingle(uniqueInput, list, context, accessFilters)
}
