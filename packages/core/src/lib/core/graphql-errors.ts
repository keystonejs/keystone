import { GraphQLError } from 'graphql'

export const userInputError = (msg: string) =>
  new GraphQLError(`Input error: ${msg}`, { extensions: { code: 'KS_USER_INPUT_ERROR' } })

export const accessDeniedError = (msg: string, code = 'KS_ACCESS_DENIED') =>
  new GraphQLError(`Access denied: ${msg}`, { extensions: { code } })

export const validationFailureError = (messages: string[]) => {
  const s = messages.map(m => `  - ${m}`).join('\n')
  return new GraphQLError(`You provided invalid data for this operation.\n${s}`, {
    extensions: { code: 'KS_VALIDATION_FAILURE' },
  })
}

export const extensionError = (extension: string, things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n')
  return new GraphQLError(`An error occurred while running "${extension}".\n${s}`, {
    extensions: {
      code: 'KS_EXTENSION_ERROR',
      debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })),
    },
  })
}

export const resolverError = (things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n')
  return new GraphQLError(`An error occurred while resolving input fields.\n${s}`, {
    extensions: {
      code: 'KS_RESOLVER_ERROR',
      debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })),
    },
  })
}

export const relationshipError = (things: { error: Error; tag: string }[]) => {
  const s = things
    .map(t => `  - ${t.tag}: ${t.error.message}`)
    .sort()
    .join('\n')
  return new GraphQLError(`An error occurred while resolving relationship fields.\n${s}`, {
    extensions: {
      code: 'KS_RELATIONSHIP_ERROR',
      debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })),
    },
  })
}

export const accessReturnError = (things: { tag: string; returned: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: Returned: ${t.returned}. Expected: boolean.`).join('\n')
  return new GraphQLError(`Invalid values returned from access control function.\n${s}`, {
    extensions: {
      code: 'KS_ACCESS_RETURN_ERROR',
    },
  })
}

export const limitsExceededError = (args: { type: string; limit: number; list: string }) =>
  new GraphQLError('Your request exceeded server limits', {
    extensions: {
      code: 'KS_LIMITS_EXCEEDED',
    },
  })

function formatKeys(keys: string[]) {
  if (keys.length < 4) return keys.join(', ')
  return keys.slice(0, 3).join(', ') + ` and ${keys.length - 3} others...`
}

export const filterAccessError = ({
  operation,
  fieldKeys,
}: {
  operation: 'filter' | 'orderBy'
  fieldKeys: string[]
}) => accessDeniedError(`You cannot ${operation} by ${formatKeys(fieldKeys)}`, `KS_FILTER_DENIED`)
