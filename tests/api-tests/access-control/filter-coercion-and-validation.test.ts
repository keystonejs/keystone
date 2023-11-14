import { text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { testConfig } from '../utils'

const runner = setupTestRunner({
  config: testConfig({
    lists: {
      BadAccess: list({
        access: {
          operation: allowAll,
          filter: {
            query: () => {
              return {
                name: 'blah',
              }
            },
          },
        },
        fields: { name: text() },
      }),
      Coercion: list({
        access: {
          operation: allowAll,
          filter: {
            query: () => {
              return { NOT: { name: { equals: 'blah' } } }
            },
          },
        },
        fields: { name: text() },
      }),
    },
  }),
})

describe('Access control - Filter', () => {
  test(
    'findMany - Bad function return value',
    runner(async ({ context }) => {
      // Valid name
      const { data, errors } = await context.graphql.raw({
        query: `query { badAccesses { id } }`,
      })

      // Returns null and throws an error
      expect(data).toEqual({ badAccesses: null })
      expect(errors).toMatchSnapshot()
    })
  )
  test(
    'findMany - Coercion',
    runner(async ({ context }) => {
      await context.query.Coercion.createMany({ data: [{ name: 'something' }, { name: 'blah' }] })
      expect(await context.query.Coercion.findMany({ query: 'name' })).toEqual([
        { name: 'something' },
      ])
    })
  )
})
