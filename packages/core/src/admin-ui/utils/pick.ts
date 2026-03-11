export function pick<T extends Record<string, unknown>, K extends keyof T>(
  value: T,
  keys: readonly K[]
): Pick<T, K> {
  const result: Partial<Pick<T, K>> = {}
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = value[key]
    }
  }
  return result as Pick<T, K>
}
