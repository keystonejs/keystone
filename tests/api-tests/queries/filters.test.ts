import { describe, expect, test } from 'vitest'
import { text, relationship, integer } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll, denyAll } from '@keystone-6/core/access'
import {
  expectAccessDenied,
  expectAccessReturnError,
  expectBadUserInput,
  expectGraphQLValidationError,
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
          multi____dash: text(),
          email: text({ isIndexed: 'unique', db: { isNullable: true } }),
          uniqueButNotFilterable: text({
            isIndexed: 'unique',
            access: { read: { item: allowAll, filter: denyAll, order: allowAll } },
            db: { isNullable: true },
          }),

          filterFalse: integer({
            graphql: { omit: { read: { item: false, filter: true, order: false } } },
          }),
          filterTrue: integer(),
          filterFunctionFalse: integer({
            access: { read: { item: allowAll, filter: denyAll, order: allowAll } },
          }),
          filterFunctionTrue: integer({
            access: { read: { item: allowAll, filter: allowAll, order: allowAll } },
          }),
          filterFunctionOtherFalsey: integer({
            access: { read: { item: allowAll, filter: () => null, order: allowAll } },
          } as any), // as any for tests
          filterFunctionOtherTruthy: integer({
            access: { read: { item: allowAll, filter: () => ({}), order: allowAll } },
          } as any), // as any for tests
        },
      }),
      SecondaryList: list({
        access: allowAll,
        fields: {
          filterFunctionFalse: integer({
            access: { read: { item: allowAll, filter: () => false, order: allowAll } },
          }),
          someUser: relationship({ ref: 'User' }),
          otherUsers: relationship({ ref: 'User', many: true }),
        },
      }),
      DefaultFilterUndefined: list({
        access: allowAll,
        fields: { a: integer(), b: integer() },
      }),
      DefaultFilterOmitted: list({
        access: allowAll,
        fieldDefaults: {
          graphql: { omit: { read: { item: false, filter: true, order: false } } },
        },
        fields: {
          a: integer(),
          b: integer({
            graphql: { omit: { read: { item: false, filter: false, order: false } } },
          }),
        },
      }),
      DefaultFilterRetained: list({
        access: allowAll,
        fieldDefaults: {
          graphql: { omit: { read: { item: false, filter: false, order: false } } },
        },
        fields: { a: integer(), b: integer() },
      }),
      DefaultFilterAccessDenied: list({
        access: allowAll,
        fieldDefaults: {
          access: { read: { item: allowAll, filter: denyAll, order: allowAll } },
        },
        fields: {
          a: integer(),
          b: integer({
            access: { read: { item: allowAll, filter: allowAll, order: allowAll } },
          }),
        },
      }),
      DefaultFilterAccessAllowed: list({
        access: allowAll,
        fieldDefaults: {
          access: { read: { item: allowAll, filter: allowAll, order: allowAll } },
        },
        fields: { a: integer(), b: integer() },
      }),
      DefaultFilterAccessFalsey: list({
        access: allowAll,
        fieldDefaults: {
          access: {
            // @ts-expect-error
            read: { item: allowAll, filter: () => null, order: allowAll },
          },
        },
        fields: { a: integer(), b: integer() },
      }),
      DefaultFilterAccessTruthy: list({
        access: allowAll,
        fieldDefaults: {
          access: {
            // @ts-expect-error
            read: { item: allowAll, filter: () => ({}), order: allowAll },
          },
        },
        fields: { a: integer(), b: integer() },
      }),
    },
  },
})

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
      expectAccessDenied(errors, [
        {
          path: ['users'],
          msg: 'You cannot filter that User - you cannot filter the fields filterFunctionFalse',
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
          errors: [
            { tag: 'User.filterFunctionOtherFalsey.access.read.filter', returned: 'object' },
          ],
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
          errors: [
            { tag: 'User.filterFunctionOtherTruthy.access.read.filter', returned: 'object' },
          ],
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
      expectAccessDenied(errors, [
        {
          path: ['secondaryLists'],
          msg: 'You cannot filter that SecondaryList - you cannot filter the fields filterFunctionFalse',
        },
      ])
    })
  )
})

describe('isFilterable with cursor', () => {
  test(
    'cursor with isFilterable: () => false is denied',
    runner(async ({ context }) => {
      await context.query.User.createOne({
        data: { uniqueButNotFilterable: 'secret-value' },
      })
      const { data, errors } = await context.graphql.raw({
        query: '{ users(cursor: { uniqueButNotFilterable: "secret-value" }, take: 1) { id } }',
      })
      // cursor should be checked against isFilterable the same as where
      expect(data).toEqual({ users: null })
      expectAccessDenied(errors, [
        {
          path: ['users'],
          msg: 'You cannot filter that User - you cannot filter the fields uniqueButNotFilterable',
        },
      ])
    })
  )

  test(
    'cursor with isFilterable: true is allowed',
    runner(async ({ context }) => {
      const item = await context.query.User.createOne({
        data: { email: 'cursor-allowed@example.com' },
      })
      const { data, errors } = await context.graphql.raw({
        query: '{ users(cursor: { email: "cursor-allowed@example.com" }, take: 1) { id } }',
      })
      expect(errors).toBe(undefined)
      expect(data).toEqual({ users: [{ id: item.id }] })
    })
  )
})

describe('fieldDefaults filter', () => {
  test(
    'undefined retains filter fields',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterUndefineds(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterUndefineds: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.graphql.omit.read.filter omits filter fields and can be overridden',
    runner(async ({ context, gqlSuper }) => {
      const { body } = await gqlSuper({
        query: '{ defaultFilterOmitteds(where: { a: { equals: 10 } }) { id } }',
      })
      expectGraphQLValidationError(body.errors, [
        {
          message:
            'Field "a" is not defined by type "DefaultFilterOmittedWhereInput". Did you mean "b"?',
        },
      ])

      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterOmitteds(where: { b: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterOmitteds: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.graphql.omit.read.filter false retains filter fields',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterRetaineds(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterRetaineds: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.access.read.filter denyAll denies filtering and can be overridden',
    runner(async ({ context }) => {
      const denied = await context.graphql.raw({
        query: '{ defaultFilterAccessDenieds(where: { a: { equals: 10 } }) { id } }',
      })
      expect(denied.data).toEqual({ defaultFilterAccessDenieds: null })
      expectAccessDenied(denied.errors, [
        {
          path: ['defaultFilterAccessDenieds'],
          msg: 'You cannot filter that DefaultFilterAccessDenied - you cannot filter the fields a',
        },
      ])

      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterAccessDenieds(where: { b: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterAccessDenieds: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.access.read.filter allowAll allows filtering',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterAccessAlloweds(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterAccessAlloweds: [] })
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.access.read.filter returning null reports an invalid access return',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterAccessFalseys(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterAccessFalseys: null })
      expectAccessReturnError(errors, [
        {
          path: ['defaultFilterAccessFalseys'],
          errors: [{ tag: 'DefaultFilterAccessFalsey.a.access.read.filter', returned: 'object' }],
        },
      ])
    })
  )

  test(
    'fieldDefaults.access.read.filter returning an object reports an invalid access return',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultFilterAccessTruthies(where: { a: { equals: 10 } }) { id } }',
      })
      expect(data).toEqual({ defaultFilterAccessTruthies: null })
      expectAccessReturnError(errors, [
        {
          path: ['defaultFilterAccessTruthies'],
          errors: [{ tag: 'DefaultFilterAccessTruthy.a.access.read.filter', returned: 'object' }],
        },
      ])
    })
  )
})
