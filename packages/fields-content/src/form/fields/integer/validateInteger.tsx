export function validateInteger(
  validation: { min?: number; max?: number; isRequired?: boolean } | undefined,
  value: unknown,
  label: string
) {
  if (value !== null && (typeof value !== 'number' || !Number.isInteger(value))) {
    return `${label} must be a whole number`
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
  }
}
