import { describe, expect, test } from 'vitest'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { integer } from '@keystone-6/core/fields'
import { setupTestRunner } from '../../test-runner.ts'
import { expectValidationError } from '../../utils.ts'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils.ts'

for (const isNullable of [true, false]) {
  describe(`integer with isNullable: ${isNullable}`, () => {
    const values = [-234, 0, 5, 43, 65345] as const
    filterTests(integer({ db: { isNullable } }), match => {
      orderableFilterTests(match, values, isNullable)
    })
    uniqueEqualityFilterTest(
      integer({ db: { isNullable }, isIndexed: 'unique' }),
      values,
      isNullable
    )
  })
}

test(
  'integer with a defaultValue and isRequired rejects null',
  setupTestRunner({
    config: {
      lists: {
        Test: list({
          access: allowAll,
          fields: {
            value: integer({
              defaultValue: 5,
              validation: { isRequired: true },
              db: { isNullable: true },
            }),
          },
        }),
      },
    },
  })(async ({ context }) => {
    const item = await context.query.Test.createOne({ data: {}, query: 'id value' })
    expect(item.value).toEqual(5)

    const created = await context.graphql.raw({
      query: `mutation { createTest(data: { value: null }) { id } }`,
    })
    expect(created.data).toEqual({ createTest: null })
    expectValidationError(created.errors, [
      { path: ['createTest'], messages: ['Test.value: missing value'] },
    ])

    const updated = await context.graphql.raw({
      query: `mutation { updateTest(where: { id: "${item.id}" }, data: { value: null }) { id } }`,
    })
    expect(updated.data).toEqual({ updateTest: null })
    expectValidationError(updated.errors, [
      { path: ['updateTest'], messages: ['Test.value: missing value'] },
    ])
  })
)
