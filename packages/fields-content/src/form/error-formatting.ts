import { FieldDataError } from './fields/error'
import { PropValidationError } from './parse-props'

function flattenErrors(error: unknown): unknown[] {
  if (error instanceof AggregateError) {
    return error.errors.flatMap(flattenErrors)
  }
  return [error]
}

export function formatFormDataError(error: unknown) {
  const flatErrors = flattenErrors(error)

  return flatErrors
    .map(error => {
      if (error instanceof PropValidationError) {
        const path = error.path.join('.')
        return `${path}: ${
          error.cause instanceof FieldDataError
            ? error.cause.message
            : `Unexpected error: ${error.cause}`
        }`
      }
      return `Unexpected error: ${error}`
    })
    .join('\n')
}

export function toFormattedFormDataError(error: unknown) {
  const formatted = formatFormDataError(error)
  return new Error(`Field validation failed:\n` + formatted)
}
