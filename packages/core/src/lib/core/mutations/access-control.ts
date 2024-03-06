import { type KeystoneContext } from '../../../types'
import { accessDeniedError } from '../graphql-errors'
import { type InitialisedList } from '../initialise-lists'
import { cannotForItem } from '../access-control'
import {
  type UniqueInputFilter,
  resolveUniqueWhereInput,
} from '../where-inputs'

export async function checkUniqueItemExists (
  uniqueInput: UniqueInputFilter,
  foreignList: InitialisedList,
  context: KeystoneContext,
  operation: string
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, foreignList, context)

  // Check whether the item exists (from this users POV).
  try {
    const item = await context.db[foreignList.listKey].findOne({ where: uniqueInput })
    if (item !== null) return uniqueWhere
  } catch (err) {}

  throw accessDeniedError(cannotForItem(operation, foreignList))
}
