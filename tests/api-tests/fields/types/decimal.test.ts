import { describe, expect, test } from 'vitest'
import { config, list } from '@keystone-6/core'
import { createSystem } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'
import { allowAll } from '@keystone-6/core/access'
import { decimal } from '@keystone-6/core/fields'
import { dbProvider } from '../../utils.ts'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils.ts'

if (dbProvider === 'sqlite') {
  test('jest requires at least one test in a file and the decimal field does not support SQLite', () => {})
} else {
  for (const isNullable of [true, false]) {
    describe(`decimal with isNullable: ${isNullable}`, () => {
      const values = ['-123.4500', '0.0100', '50.0000', '2000.0000', '40000.0000'] as const
      filterTests(decimal({ db: { isNullable } }), match => {
        orderableFilterTests(match, values, isNullable)
      })
      uniqueEqualityFilterTest(
        decimal({ db: { isNullable }, isIndexed: 'unique' }),
        values,
        isNullable
      )
    })
  }
}

describe('decimal validation.min and validation.max', () => {
  function getSystem(validation: { min: string; max: string }) {
    return createSystem(
      config({
        db: { prismaClientOptions: () => ({}), provider: 'postgresql' },
        lists: {
          Test: list({ access: allowAll, fields: { value: decimal({ validation }) } }),
        },
      })
    )
  }

  for (const [min, max] of [
    ['2', '10'],
    ['-10', '-2'],
    ['9.5', '10'],
    ['5', '5'],
  ] as const) {
    test(`accepts min: ${min} and max: ${max}`, () => {
      expect(() => getSystem({ min, max })).not.toThrow()
    })
  }

  for (const [min, max] of [
    ['10', '2'],
    ['-2', '-10'],
    ['10', '9.5'],
  ] as const) {
    test(`rejects min: ${min} and max: ${max}`, () => {
      expect(() => getSystem({ min, max })).toThrow(
        'Test.value specifies a validation.max that is less than the validation.min, and therefore has no valid options'
      )
    })
  }
})
