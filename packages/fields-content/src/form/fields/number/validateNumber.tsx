export function validateNumber(
  validation:
    | {
        min?: number
        max?: number
        isRequired?: boolean
        validateStep?: boolean
      }
    | undefined,
  value: unknown,
  step: number | undefined,
  label: string
) {
  if (value !== null && typeof value !== 'number') {
    return `${label} must be a number`
  }

  if (validation?.isRequired && value === null) {
    return `${label} is required`
  }

  if (value !== null) {
    if (validation?.min !== undefined && value < validation.min) {
      return `${label} must be at least ${validation.min}`
    }
    if (validation?.max !== undefined && value > validation.max) {
      return `${label} must be at most ${validation.max}`
    }
    if (step !== undefined && validation?.validateStep !== undefined && !isAtStep(value, step)) {
      return `${label} must be a multiple of ${step}`
    }
  }
}

function decimalPlaces(value: number) {
  const stringified = value.toString()
  const indexOfDecimal = stringified.indexOf('.')
  if (indexOfDecimal === -1) {
    const indexOfE = stringified.indexOf('e-')
    return indexOfE === -1 ? 0 : parseInt(stringified.slice(indexOfE + 2))
  }
  return stringified.length - indexOfDecimal - 1
}

export function isAtStep(value: number, step: number) {
  const dc = Math.max(decimalPlaces(step), decimalPlaces(value))
  const base = Math.pow(10, dc)
  return (value * base) % (step * base) === 0
}
