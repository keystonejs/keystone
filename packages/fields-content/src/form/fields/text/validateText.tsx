export function validateText(
  val: string,
  min: number,
  max: number,
  fieldLabel: string,
  pattern: { regex: RegExp; message?: string } | undefined
) {
  if (val.length < min) {
    if (min === 1) {
      return `${fieldLabel} must not be empty`
    } else {
      return `${fieldLabel} must be at least ${min} characters long`
    }
  }
  if (val.length > max) {
    return `${fieldLabel} must be no longer than ${max} characters`
  }
  if (pattern && !pattern.regex.test(val)) {
    return pattern.message || `${fieldLabel} must match the pattern ${pattern.regex}`
  }
}
