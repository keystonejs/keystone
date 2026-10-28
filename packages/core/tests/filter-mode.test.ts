import { describe, expect, test } from 'vitest'
import { resolveCommon, resolveString } from '../src/fields/filters/internal.ts'

// A nullish clause in an `AND` / `OR` / `NOT` array is not a valid where fragment, so any resolver
//   output containing one either crashes the query or silently drops the filter.
function nullishClauses(where: unknown, path = 'where'): string[] {
  const problems: string[] = []
  const walk = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item === null || item === undefined) {
          problems.push(`${path}[${index}]`)
        } else {
          walk(item, `${path}[${index}]`)
        }
      })
      return
    }
    if (value === null || typeof value !== 'object') return
    const clause = value as Record<string, unknown>
    for (const key of ['AND', 'OR', 'NOT']) {
      if (key in clause) walk(clause[key], `${path}.${key}`)
    }
  }
  walk(where, path)
  return problems
}

describe('string filter mode', () => {
  test('resolves the mode of a nested not filter object', () => {
    expect(resolveString({ not: { equals: 'a', mode: 'insensitive' } })).toEqual({
      AND: [{ NOT: [{ AND: [{ equals: 'a', mode: 'insensitive' }, { not: null }, {}] }] }, {}],
    })
    expect(resolveCommon({ not: { equals: 'a', mode: 'insensitive' } })).toEqual({
      AND: [{ NOT: [{ AND: [{ equals: 'a', mode: 'insensitive' }, { not: null }, {}] }] }, {}],
    })
  })

  test('a nested filter object inherits the mode of its parent', () => {
    expect(resolveString({ mode: 'insensitive', not: { contains: 'a' } })).toEqual(
      resolveString({ mode: 'insensitive', not: { contains: 'a', mode: 'insensitive' } })
    )
  })

  test('a nested filter object overrides the mode of its parent', () => {
    expect(resolveString({ mode: 'insensitive', not: { contains: 'a', mode: 'default' } })).toEqual(
      resolveString({ not: { contains: 'a', mode: 'default' } })
    )
  })

  test('resolves the mode of a filter object regardless of the key order', () => {
    expect(resolveString({ not: { mode: 'insensitive', equals: 'a' } })).toEqual(
      resolveString({ not: { equals: 'a', mode: 'insensitive' } })
    )
    expect(resolveCommon({ mode: 'insensitive', equals: 'a' })).toEqual(
      resolveCommon({ equals: 'a', mode: 'insensitive' })
    )
  })

  test('resolves every string filter shape to a where fragment without nullish clauses', () => {
    const inputs = [
      { equals: 'a' },
      { equals: 'a', mode: 'insensitive' },
      { mode: 'insensitive', equals: 'a' },
      { contains: 'a', mode: 'insensitive', not: { startsWith: 'b' } },
      { not: { equals: 'a', mode: 'insensitive' } },
      { not: { mode: 'insensitive', equals: 'a' } },
      { not: { contains: 'a', mode: 'insensitive' }, mode: 'default' },
      { in: ['a', 'b'], mode: 'insensitive', notIn: ['c'] },
      { equals: null, mode: 'insensitive' },
      { mode: null },
    ] as const
    for (const input of inputs) {
      for (const resolve of [resolveString, resolveCommon]) {
        const resolved = resolve(input)
        expect(resolved, `filter ${JSON.stringify(input)} must resolve`).not.toBe(undefined)
        expect(nullishClauses(resolved), `filter ${JSON.stringify(input)}`).toEqual([])
      }
    }
  })
})
