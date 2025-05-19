export function validateDatetime(
  validation: { min?: string; max?: string; isRequired?: boolean } | undefined,
  value: string | null,
  label: string
) {
  if (value !== null && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${label} is not a valid datetime`
  }

  if (validation?.isRequired && value === null) {
    return `${label} is required`
  }
  if ((validation?.min || validation?.max) && value !== null) {
    const datetime = new Date(value)
    if (validation?.min !== undefined) {
      const min = new Date(validation.min)
      if (datetime < min) {
        return `${label} must be after ${min.toISOString()}`
      }
    }
    if (validation?.max !== undefined) {
      const max = new Date(validation.max)
      if (datetime > max) {
        return `${label} must be no later than ${max.toISOString()}`
      }
    }
  }
}
