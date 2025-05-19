export function validateDate(
  validation: { min?: string; max?: string; isRequired?: boolean } | undefined,
  value: string | null,
  label: string
) {
  if (value !== null && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${label} is not a valid date`
  }

  if (validation?.isRequired && value === null) {
    return `${label} is required`
  }
  if ((validation?.min || validation?.max) && value !== null) {
    const date = new Date(value)
    if (validation?.min !== undefined) {
      const min = new Date(validation.min)
      if (date < min) {
        return `${label} must be after ${min.toLocaleDateString()}`
      }
    }
    if (validation?.max !== undefined) {
      const max = new Date(validation.max)
      if (date > max) {
        return `${label} must be no later than ${max.toLocaleDateString()}`
      }
    }
  }
}
