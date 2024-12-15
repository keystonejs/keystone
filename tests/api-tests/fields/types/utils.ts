import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { list } from '@keystone-6/core'
import { integer } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { type FieldTypeFunc, type BaseListTypeInfo } from '@keystone-6/core/types'
import { allowAll } from '@keystone-6/core/access'

function filterTestRunner (field: FieldTypeFunc<BaseListTypeInfo>) {
  return setupTestRunner({
    config: {
      lists: {
        Test: list({
          access: allowAll,
          fields: {
            index: integer(),
            testField: field,
          },
        }),
      },
      storage: {
        test_image: {
          kind: 'local',
          type: 'image',
          storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'tmp_test_images')),
          generateUrl: path => `http://localhost:3000/images${path}`,
          serverRoute: {
            path: '/images',
          },
        },
        test_file: {
          kind: 'local',
          type: 'file',
          storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'tmp_test_files')),
          generateUrl: path => `http://localhost:3000/files${path}`,
          serverRoute: {
            path: '/files',
          },
        },
      },
    },
  })
}

// this isn't for any proper checking, invalid things will throw at runtime anyway
// it's just a bit of autocomplete convenience
type VagueFieldFilter = {
  equals?: unknown
  in?: unknown[]
  notIn?: unknown[]
  lt?: unknown
  lte?: unknown
  gt?: unknown
  gte?: unknown
  contains?: string
  startsWith?: string
  endsWith?: string
  mode?: 'default' | 'insensitive'
  isSet?: boolean
  not?: VagueFieldFilter
}

type Match = (
  inputValues: readonly unknown[],
  where: VagueFieldFilter | undefined,
  expectedIndexes: readonly number[]
) => void

export function filterTests (field: FieldTypeFunc<BaseListTypeInfo>, cb: (match: Match) => void) {
  for (const kind of ['without negation', 'with negation'] as const) {
    describe(kind, () => {
      const match: Match = (inputValues, where, expectedIndexes) =>
        test(
          JSON.stringify(where),
          filterTestRunner(field)(async ({ context }) => {
            for (const [idx, data] of inputValues.entries()) {
              await context.query.Test.createOne({ data: { index: idx, testField: data } })
            }
            let expected = expectedIndexes
            if (kind === 'with negation') {
              const expectedWithoutNegation = new Set(expected)
              expected = inputValues.map((_, i) => i).filter(i => !expectedWithoutNegation.has(i))
            }
            expect(
              (
                await context.query.Test.findMany({
                  where:
                    kind === 'with negation' ? { NOT: { testField: where } } : { testField: where },
                  orderBy: { index: 'asc' },
                  query: 'index',
                })
              ).map(({ index }) => ({ index, value: inputValues[index] }))
            ).toEqual(expected.map(index => ({ index, value: inputValues[index] })))
          })
        )
      cb(match)
    })
  }
}

export function orderableFilterTests (
  match: Match,
  valuesInAscendingOrder: readonly [unknown, unknown, unknown, unknown, unknown],
  isNullable: boolean
) {
  equalityFilterTests(match, valuesInAscendingOrder, isNullable)
  const values = isNullable ? [...valuesInAscendingOrder, null] : valuesInAscendingOrder

  match(values, { gt: values[1] }, [2, 3, 4])
  match(values, { lt: values[2] }, [0, 1])
  match(values, { lte: values[2] }, [0, 1, 2])
  match(values, { gt: values[2] }, [3, 4])
  match(values, { gte: values[2] }, [2, 3, 4])
}

export function equalityFilterTests (
  match: Match,
  inputValues: readonly [unknown, unknown, unknown, unknown, unknown],
  isNullable: boolean
) {
  const values = isNullable ? [...inputValues, null] : inputValues
  const addExpectNull = isNullable ? [5] : []
  if (isNullable) {
    match(values, { equals: null }, [5])
    match(values, { not: { equals: null } }, [0, 1, 2, 3, 4])
  }
  match(values, { equals: values[2] }, [2])
  match(values, { not: { equals: values[2] } }, [0, 1, 3, 4, ...addExpectNull])

  match(values, { in: [] }, [])
  match(values, { notIn: [] }, [0, 1, 2, 3, 4, ...addExpectNull])
  match(values, { in: [values[0], values[2], values[3]] }, [0, 2, 3])
  match(values, { notIn: [values[0], values[2], values[3]] }, [1, 4, ...addExpectNull])
}

export function uniqueEqualityFilterTest (
  field: FieldTypeFunc<BaseListTypeInfo>,
  values: readonly unknown[],
  isNullable: boolean
) {
  test(
    'unique filter',
    filterTestRunner(field)(async ({ context }) => {
      for (const [idx, value] of values.entries()) {
        await context.query.Test.createOne({ data: { index: idx, testField: value } })
      }

      await Promise.all(
        values.map(async (testField, idx) => {
          const { index } = await context.query.Test.findOne({
            where: { testField },
            query: 'index',
          })
          expect(index).toEqual(idx)
        })
      )
    })
  )
  if (isNullable) {
    test(
      'unique filter with null returns null',
      filterTestRunner(field)(async ({ context }) => {
        const result = await context.query.Test.findOne({
          where: { testField: null },
          query: 'index',
        })
        expect(result).toEqual(null)
      })
    )
  }
}
