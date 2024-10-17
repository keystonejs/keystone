import { text, relationship, integer } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import {
  type ContextFromRunner,
  expectAccessReturnError,
  expectBadUserInput,
  expectGraphQLValidationError,
  expectFilterDenied,
} from '../utils'

const runner = setupTestRunner({
  serve: true,
  config: {
    lists: {
      User: list({
        access: allowAll,
        fields: {
          noDash: text(),
          single_dash: text(),
          many_many_many_dashes: text(),
          multi____dash: text({ isFilterable: true }),
          email: text({ isIndexed: 'unique', isFilterable: true, db: { isNullable: true } }),

          filterFalse: integer({ isFilterable: false }),
          filterTrue: integer({ isFilterable: true }),
          filterFunctionFalse: integer({ isFilterable: () => false }),
          filterFunctionTrue: integer({ isFilterable: () => true }),
          filterFunctionOtherFalsey: integer({ isFilterable: () => null } as any), // as any for tests
          filterFunctionOtherTruthy: integer({ isFilterable: () => ({}) } as any), // as any for tests
        },
      }),
      SecondaryList: list({
        access: allowAll,
        fields: {
          filterFunctionFalse: integer({ isFilterable: () => false }),
          someUser: relationship({ ref: 'User', isFilterable: true }),
          otherUsers: relationship({ ref: 'User', isFilterable: true, many: true }),
        },
      }),

      DefaultFilterUndefined: list({
        access: allowAll,
        fields: { a: integer(), b: integer({ isFilterable: true }) },
      }),
      DefaultFilterFalse: list({
        access: allowAll,
        fields: { a: integer(), b: integer({ isFilterable: true }) },
        defaultIsFilterable: false,
      }),
      DefaultFilterTrue: list({
        access: allowAll,
        fields: { a: integer(), b: integer({ isFilterable: true }) },
        defaultIsFilterable: true as any, // not actually allowed
      }),
      DefaultFilterFunctionFalse: list({
        access: allowAll,
        fields: { a: integer(), b: integer({ isFilterable: true }) },
        defaultIsFilterable: () => false,
      }),
      DefaultFilterFunctionTrue: list({
        access: allowAll,
        fields: { a: integer(), b: integer({ isFilterable: true }) },
        defaultIsFilterable: () => true,
      }),
      DefaultFilterFunctionFalsey: list({
        access: allowAll,
        fields: { a: integer(), b: integer({ isFilterable: true }) },
        defaultIsFilterable: (() => null) as any, // not actually allowed
      }),
      DefaultFilterFunctionTruthy: list({
        access: allowAll,
        fields: { a: integer(), b: integer({ isFilterable: true }) },
        defaultIsFilterable: () => ({} as any), // not actually allowed
      }),
    },
  },
})

async function initialiseData ({ context }: { context: ContextFromRunner<typeof runner> }) {
  // Use shuffled data to ensure that ordering is actually happening.
  for (const listKey of Object.keys(context.query) as Array<keyof (typeof context)['query']>) {
    if (listKey === 'User' || listKey === 'SecondaryList') continue
    await context.query[listKey].createMany({
      data: [
        { a: 1, b: 10 },
        { a: 1, b: 30 },
        { a: 1, b: 20 },
        { a: 3, b: 30 },
        { a: 3, b: 10 },
        { a: 3, b: 20 },
        { a: 2, b: 30 },
        { a: 2, b: 20 },
        { a: 2, b: 10 },
      ],
    })
  }
}

describe('filtering on field name', () => {
  test(
    'filter works when there is no dash in field name',
    runner(async ({ context }) => {
      const users = await context.query.User.findMany({ where: { noDash: { equals: 'aValue' } } })
      expect(users).toEqual([])
    })
  )
  test(
    'filter works when there is one dash in field name',
    runner(async ({ context }) => {
      const users = await context.query.User.findMany({
        where: { single_dash: { equals: 'aValue' } },
      })
      expect(users).toEqual([])
    })
  )
  test(
    'filter works when there are multiple dashes in field name',
    runner(async ({ context }) => {
      const users = await context.query.User.findMany({
        where: { many_many_many_dashes: { equals: 'aValue' } },
      })
      expect(users).toEqual([])
    })
  )
  test(
    'filter works when there are multiple dashes in a row in a field name',
    runner(async ({ context }) => {
      const users = await context.query.User.findMany({
        where: { multi____dash: { equals: 'aValue' } },
      })
      expect(users).toEqual([])
    })
  )
  test(
    'filter works when there is one dash in field name as part of a relationship',
    runner(async ({ context }) => {
      const secondaries = await context.query.SecondaryList.findMany({
        where: { NOT: { someUser: null } },
      })
      expect(secondaries).toEqual([])
    })
  )
})

describe('filtering on relationships', () => {
  test(
    'findMany throws error with null relationship query',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ secondaryLists(where: { otherUsers: null }) { id } }',
      })
      // Returns null and throws an error
      expect(data).toEqual({ secondaryLists: null })
      expectBadUserInput(errors, [
        {
          message: 'A many relation filter cannot be set to null',
          path: ['secondaryLists'],
        },
      ])
    })
  )

  test(
    'findMany throws error with null relationship query value',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ secondaryLists(where: { otherUsers: { some: null } }) { id } }',
      })
      // Returns null and throws an error
      expect(data).toEqual({ secondaryLists: null })
      expectBadUserInput(errors, [
        {
          message: 'The key "some" in a many relation filter cannot be set to null',
          path: ['secondaryLists'],
        },
      ])
    })
  )

  test(
    'findMany returns all items with empty relationship query value',
    runner(async ({ context }) => {
      await context.query.SecondaryList.createOne({
        data: { otherUsers: { create: [{ noDash: 'a' }, { noDash: 'b' }] } },
      })
      const { data, errors } = await context.graphql.raw({
        query:
          '{ secondaryLists(where: { otherUsers: {} }) { otherUsers(orderBy: { noDash: asc }) { noDash } } }',
      })
      // Returns all the data
      expect(errors).toBe(undefined)
      expect(data).toEqual({
        secondaryLists: [{ otherUsers: [{ noDash: 'a' }, { noDash: 'b' }] }],
      })
    })
  )
})

describe('searching by unique fields', () => {
  test(
    'findOne works on a unique text field',
    runner(async ({ context }) => {
      const item = await context.query.User.createOne({ data: { email: 'test@example.com' } })
      const { data, errors } = await context.graphql.raw({
        query: '{ user(where: { email: "test@example.com" }) { id email } }',
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ user: { id: item.id, email: 'test@example.com' } })
    })
  )

  test(
    'findOne works on multiple unique fields',
    runner(async ({ context }) => {
      const item = await context.query.User.createOne({ data: { email: 'test@example.com' } })
      const { data, errors } = await context.graphql.raw({
        query: `{ user(where: { id: "${item.id}" email: "test@example.com" }) { id email } }`,
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ user: { id: item.id, email: 'test@example.com' } })
    })
  )

  // WARNING: this is database specific behaviour
  test(
    'findOne returns the first item for null if a value exists',
    runner(async ({ context }) => {
      const item = await context.query.User.createOne({ data: { email: null } })
      const { data, errors } = await context.graphql.raw({
        query: '{ user(where: { email: null }) { id email } }',
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ user: { id: item.id, email: null } })
    })
  )

  test(
    'findOne returns the unique item when filtering with multiple values',
    runner(async ({ context }) => {
      const item = await context.query.User.createOne({ data: { email: null } })
      const { data, errors } = await context.graphql.raw({
        query: `{ user(where: { id: "${item.id}" email: null }) { id email } }`,
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ user: { id: item.id, email: null } })
    })
  )

  test(
    'findOne returns null if missing',
    runner(async ({ context }) => {
      await context.query.User.createOne({ data: { email: 'test@example.com' } })
      const { data, errors } = await context.graphql.raw({
        query: '{ user(where: { email: "unknown@example.com" }) { id email } }',
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ user: null })
    })
  )

  test(
    'findOne returns null for zero where values',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ user(where: {}) { id email } }',
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ user: null })
    })
  )

  test(
    'findOne returns null for null where values',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ user(where: { email: null }) { id email } }',
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ user: null })
    })
  )
})

describe('isFilterable', () => {
  test(
    'isFilterable: false',
    runner(async ({ gqlSuper }) => {
      const { body } = await gqlSuper({
        query: '{ users(where: { filterFalse: { equals: 10 } }) { id } }',
      })
      expectGraphQLValidationError(body.errors, [
        {
          message:
            'Field "filterFalse" is not defined by type "UserWhereInput". Did you mean "filterTrue"?',
        },
      ])
    })
  )

  test(
    'isFilterable: true',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ users(where: { filterTrue: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ users: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'isFilterable: () => false',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ users(where: { filterFunctionFalse: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectFilterDenied(errors, [
        {
          path: ['users'],
          message: `You do not have access to perform 'filter' operations on the fields ["User.filterFunctionFalse"].`,
        },
      ])
    })
  )

  test(
    'isFilterable: () => true',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ users(where: { filterFunctionTrue: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ users: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'isFilterable: () => null',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ users(where: { filterFunctionOtherFalsey: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectAccessReturnError(errors, [
        {
          path: ['users'],
          errors: [{ tag: 'User.filterFunctionOtherFalsey.isFilterable', returned: 'object' }],
        },
      ])
    })
  )

  test(
    'isFilterable: () => ({})',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ users(where: { filterFunctionOtherTruthy: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectAccessReturnError(errors, [
        {
          path: ['users'],
          errors: [{ tag: 'User.filterFunctionOtherTruthy.isFilterable', returned: 'object' }],
        },
      ])
    })
  )

  test(
    'isFilterable: multiple () => false',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `{ secondaryLists(where: {
          OR: [
            { filterFunctionFalse: { gt: 10 } }
            { filterFunctionFalse: { lt: 20 } }
            { someUser: { filterFunctionFalse: { equals: 10 } } }
          ]
        } ) { id } }`,
      })
      expect(data).toEqual({ secondaryLists: null })
      expectFilterDenied(errors, [
        {
          path: ['secondaryLists'],
          message: `You do not have access to perform 'filter' operations on the fields ["SecondaryList.filterFunctionFalse","SecondaryList.filterFunctionFalse","User.filterFunctionFalse"].`,
        },
      ])
    })
  )
})

describe('defaultIsFilterable', () => {
  test(
    'defaultIsFilterable: undefined',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterUndefineds(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterUndefineds: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'defaultIsFilterable: false',
    runner(async ({ gqlSuper }) => {
      const { body } = await gqlSuper({
        query: '{ defaultFilterFalses(where: { a: { equals: 10 } }) { id } }',
      })
      expectGraphQLValidationError(body.errors, [
        {
          message:
            'Field "a" is not defined by type "DefaultFilterFalseWhereInput". Did you mean "b"?',
        },
      ])
    })
  )

  test(
    'defaultIsFilterable: true',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterTrues(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterTrues: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'defaultIsFilterable: () => false',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterFunctionFalses(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterFunctionFalses: null })
      expectFilterDenied(errors, [
        {
          path: ['defaultFilterFunctionFalses'],
          message: `You do not have access to perform 'filter' operations on the fields ["DefaultFilterFunctionFalse.a"].`,
        },
      ])
    })
  )

  test(
    'defaultIsFilterable: () => true',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterFunctionTrues(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterFunctionTrues: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'defaultIsFilterable: () => null',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterFunctionFalseys(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterFunctionFalseys: null })
      expectAccessReturnError(errors, [
        {
          path: ['defaultFilterFunctionFalseys'],
          errors: [{ tag: 'DefaultFilterFunctionFalsey.a.isFilterable', returned: 'object' }],
        },
      ])
    })
  )

  test(
    'defaultIsFilterable: () => ({})',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterFunctionTruthies(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterFunctionTruthies: null })
      expectAccessReturnError(errors, [
        {
          path: ['defaultFilterFunctionTruthies'],
          errors: [{ tag: 'DefaultFilterFunctionTruthy.a.isFilterable', returned: 'object' }],
        },
      ])
    })
  )
})
