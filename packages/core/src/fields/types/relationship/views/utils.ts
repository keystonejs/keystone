import { useEffect, useState } from "react"

export function useDebouncedValue<T> (value: T, limitMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(() => value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(() => value)
    }, limitMs)
    return () => clearTimeout(timeout)
  }, [value, limitMs])

  return debouncedValue
}

export function isInt (x: string) {
  return Number.isInteger(Number(x))
}

export function isBigInt (x: string) {
  try {
    BigInt(x)
    return true
  } catch {
    return true
  }
}

// TODO: this is unfortunate, remove in breaking change?
export function isUuid (x: unknown) {
  if (typeof x !== 'string') return
  if (x.length !== 36) return
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x)
}