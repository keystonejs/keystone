import { text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { type KeystoneContext } from '@keystone-6/core/types'
import { allowAll } from '@keystone-6/core/access'
import { setupTestRunner } from '../test-runner'
import { dbProvider } from '../utils'

const runner = setupTestRunner({
  config: {
    lists: {
      Singular: list({
        isSingleton: true,
        access: allowAll,
        fields: {
          field: text(),
        },
      }),
    },
  },
})

async function initialise ({ context }: { context: KeystoneContext }) {
  await context.db.Singular.createOne({ data: {} })
}

describe('queries "work" on singletons', () => {
  describe('read', () => {
    test(
      'read one works with defaulted query',
      runner(async ({ context }) => {
        await initialise({ context })

        const { errors, data } = await context.graphql.raw({
          query: `query { singular { id } }`,
        })

        expect(errors).toEqual(undefined)
        expect(data).toEqual({ singular: { id: '1' } })
      })
    )
    test(
      'read many works with defaulted query',
      runner(async ({ context }) => {
        await initialise({ context })

        const { errors, data } = await context.graphql.raw({
          query: `query { singulars { id } }`,
        })

        expect(errors).toEqual(undefined)
        expect(data).toEqual({ singulars: [{ id: '1' }] })
      })
    )
    test(
      'can query other identifiers (non-default)',
      runner(async ({ context }) => {
        await initialise({ context })
        await context.prisma.singular.create({ data: { id: 2 } })

        const { errors, data } = await context.graphql.raw({
          query: `query {
            singular(where: { id: 2 }) {
              id
            }
          }`,
        })

        expect(errors).toEqual(undefined)
        expect(data).toEqual({ singular: { id: '2' } })
      })
    )
  })
  test(
    'create',
    runner(async ({ context }) => {
      const { errors, data } = await context.graphql.raw({
        query: `mutation { createSingular(data: {}) { id } }`,
      })

      expect(errors).toEqual(undefined)
      expect(data).toEqual({ createSingular: { id: '1' } })
    })
  )
  test(
    'update',
    runner(async ({ context }) => {
      await initialise({ context })

      {
        const { errors, data } = await context.graphql.raw({
          query: `query { singular { id, field } }`,
        })
        expect(errors).toEqual(undefined)
        expect(data).toEqual({ singular: { id: '1', field: '' } })
      }

      {
        const { errors, data } = await context.graphql.raw({
          query: `mutation { updateSingular(data: { field: "something here" }) { id, field } }`,
        })

        expect(errors).toEqual(undefined)
        expect(data).toEqual({ updateSingular: { id: '1', field: 'something here' } })
      }
    })
  )
  test(
    'delete',
    runner(async ({ context }) => {
      await initialise({ context })

      const { data, errors } = await context.graphql.raw({
        query: `mutation { deleteSingular { id, field } }`,
      })

      expect(errors).toEqual(undefined)
      expect(data).toEqual({ deleteSingular: { field: '', id: '1' } })

      const { data: queryData, errors: readErrors } = await context.graphql.raw({
        query: `query { singular { id } }`,
      })

      expect(readErrors).toEqual(undefined)
      expect(queryData).toEqual({ singular: null })
    })
  )
  test(
    'fails to create when existing item',
    runner(async ({ context }) => {
      await initialise({ context })

      const { errors } = await context.graphql.raw({
        query: `mutation { createSingular(data: { field: "Something here" }) { id } }`,
      })

      const message =
        dbProvider === 'mysql'
          ? 'Prisma error: Unique constraint failed on the constraint: `PRIMARY`'
          : 'Prisma error: Unique constraint failed on the fields: (`id`)'

      expect(errors?.[0].message).toEqual(message)
    })
  )
  test(
    'fails to create with differing ID',
    runner(async ({ context }) => {
      const { errors } = await context.graphql.raw({
        query: `mutation { createSingular(data: { id: 2, field: "Something here" }) { id } }`,
      })

      expect(errors?.[0].message).toEqual(
        `Field "id" is not defined by type "SingularCreateInput".`
      )
    })
  )
  // Testing these for certainty - nobody should be using these
  test(
    'create many',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `mutation { createSingulars(data: [{ field: "Something here" }]) { id, field } }`,
      })

      expect(errors).toEqual(undefined)
      expect(data).toEqual({ createSingulars: [{ field: 'Something here', id: '1' }] })
    })
  )
  test(
    'update many',
    runner(async ({ context }) => {
      await initialise({ context })

      const { data, errors } = await context.graphql.raw({
        query: `mutation { updateSingulars(data: [{ data: { field: "Something here" } }]) { id, field } }`,
      })

      expect(errors).toEqual(undefined)
      expect(data).toEqual({ updateSingulars: [{ field: 'Something here', id: '1' }] })
    })
  )
  test(
    'delete many',
    runner(async ({ context }) => {
      await initialise({ context })

      const data = await context.graphql.run({
        query: `mutation { deleteSingulars(where: { id: 1 }) { id, field } }`,
      })

      expect(data).toEqual({ deleteSingulars: [{ id: '1', field: '' }] })
    })
  )
})
