import { KeystoneContext } from '../../../types'
import { accessDeniedError } from './graphql-errors'
import { InitialisedList } from './initialise-lists'
import { resolveUniqueWhereInput } from './where-inputs'

export async function checkUniqueItemExists (
  uniqueInput: Record<string, any>,
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
  } catch (err: any) {
    // If it's an access denied error or a schema support error from context.db, we swallow it and throw our own
    // to keep the error message consistent with "item may not exist".
    // But if it's a real database error (e.g. connection, timeout, malformed query),
    // we MUST rethrow it so the developer knows what happened.
    if (
      err?.extensions?.code !== 'KS_ACCESS_DENIED' &&
      !err.message.startsWith('This query is not supported by the GraphQL schema')
    ) {
      throw err
    }
  }

  throw accessDeniedError(cannotForItem(operation, foreignList))
}

function cannotForItem (operation: string, list: InitialisedList) {
  return `You cannot ${operation} that ${list.listKey} - it may not exist`
}
