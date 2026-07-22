import type { ExecutionResult } from 'graphql'

import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { integer } from '@keystone-6/core/fields'

import {
  expectAccessDenied,
  expectAccessReturnError,
  expectBadUserInput,
  expectGraphQLValidationError,
  type ContextFromRunner,
} from '../utils'

const runner = setupTestRunner({
  serve: true,
  config: {
    lists: {
      User: list({
        access: allowAll,
        fields: {
          a: integer(),
          b: integer(),
          orderFalse: integer({
            graphql: { omit: { read: { item: false, filter: false, order: true } } },
          }),
          orderTrue: integer(),
          orderFunctionFalse: integer({
            access: { read: { item: allowAll, filter: allowAll, order: denyAll } },
          }),
          orderFunctionTrue: integer({
            access: { read: { item: allowAll, filter: allowAll, order: allowAll } },
          }),
          orderFunctionOtherFalsey: integer({
            access: { read: { item: allowAll, filter: allowAll, order: () => null } },
          } as any),
          orderFunctionOtherTruthy: integer({
            access: { read: { item: allowAll, filter: allowAll, order: () => ({}) } },
          } as any),
          orderFunctionFalseToo: integer({
            access: { read: { item: allowAll, filter: allowAll, order: denyAll } },
          }),
        },
      }),
      DefaultOrderUndefined: list({
        access: allowAll,
        fields: { a: integer(), b: integer() },
      }),
      DefaultOrderOmitted: list({
        access: allowAll,
        fieldDefaults: {
          graphql: { omit: { read: { item: false, filter: false, order: true } } },
        },
        fields: {
          a: integer(),
          b: integer({
            graphql: { omit: { read: { item: false, filter: false, order: false } } },
          }),
        },
      }),
      DefaultOrderRetained: list({
        access: allowAll,
        fieldDefaults: {
          graphql: { omit: { read: { item: false, filter: false, order: false } } },
        },
        fields: { a: integer(), b: integer() },
      }),
      DefaultOrderAccessDenied: list({
        access: allowAll,
        fieldDefaults: {
          access: { read: { item: allowAll, filter: allowAll, order: denyAll } },
        },
        fields: {
          a: integer(),
          b: integer({
            access: { read: { item: allowAll, filter: allowAll, order: allowAll } },
          }),
        },
      }),
      DefaultOrderAccessAllowed: list({
        access: allowAll,
        fieldDefaults: {
          access: { read: { item: allowAll, filter: allowAll, order: allowAll } },
        },
        fields: { a: integer(), b: integer() },
      }),
      DefaultOrderAccessFalsey: list({
        access: allowAll,
        fieldDefaults: {
          access: {
            // @ts-expect-error
            read: { item: allowAll, filter: allowAll, order: () => null },
          },
        },
        fields: { a: integer(), b: integer() },
      }),
      DefaultOrderAccessTruthy: list({
        access: allowAll,
        fieldDefaults: {
          access: {
            // @ts-expect-error
            read: { item: allowAll, filter: allowAll, order: () => ({}) },
          },
        },
        fields: { a: integer(), b: integer() },
      }),
    },
  },
})

const initialiseData = async ({ context }: { context: ContextFromRunner<typeof runner> }) => {
  // Use shuffled data to ensure that ordering is actually happening.
  for (const listKey of Object.keys(context.query) as Array<keyof (typeof context)['query']>) {
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

describe('Ordering by a single field', () => {
  test(
    'Single ascending filter - a',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({ orderBy: [{ a: 'asc' }], query: 'a' })
      expect(users.map(({ a }) => a)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3])
    })
  )
  test(
    'Single descending filter - a',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({ orderBy: [{ a: 'desc' }], query: 'a' })
      expect(users.map(({ a }) => a)).toEqual([3, 3, 3, 2, 2, 2, 1, 1, 1])
    })
  )
  test(
    'Single ascending filter - b',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({ orderBy: [{ b: 'asc' }], query: 'b' })
      expect(users.map(({ b }) => b)).toEqual([10, 10, 10, 20, 20, 20, 30, 30, 30])
    })
  )
  test(
    'Single descending filter - b',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({ orderBy: [{ b: 'desc' }], query: 'b' })
      expect(users.map(({ b }) => b)).toEqual([30, 30, 30, 20, 20, 20, 10, 10, 10])
    })
  )

  test(
    'Single ascending filter - non-list - a',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({ orderBy: { a: 'asc' }, query: 'a' })
      expect(users.map(({ a }) => a)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3])
    })
  )
})

describe('Ordering by Multiple', () => {
  test(
    'Multi ascending/ascending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'asc' }, { b: 'asc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [1, 10],
        [1, 20],
        [1, 30],
        [2, 10],
        [2, 20],
        [2, 30],
        [3, 10],
        [3, 20],
        [3, 30],
      ])
    })
  )
  test(
    'Multi ascending/ascending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'asc' }, { a: 'asc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [1, 10],
        [2, 10],
        [3, 10],
        [1, 20],
        [2, 20],
        [3, 20],
        [1, 30],
        [2, 30],
        [3, 30],
      ])
    })
  )

  test(
    'Multi ascending/descending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'asc' }, { b: 'desc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [1, 30],
        [1, 20],
        [1, 10],
        [2, 30],
        [2, 20],
        [2, 10],
        [3, 30],
        [3, 20],
        [3, 10],
      ])
    })
  )
  test(
    'Multi ascending/descending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'asc' }, { a: 'desc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [3, 10],
        [2, 10],
        [1, 10],
        [3, 20],
        [2, 20],
        [1, 20],
        [3, 30],
        [2, 30],
        [1, 30],
      ])
    })
  )

  test(
    'Multi descending/ascending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'desc' }, { b: 'asc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [3, 10],
        [3, 20],
        [3, 30],
        [2, 10],
        [2, 20],
        [2, 30],
        [1, 10],
        [1, 20],
        [1, 30],
      ])
    })
  )
  test(
    'Multi descending/ascending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'desc' }, { a: 'asc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [1, 30],
        [2, 30],
        [3, 30],
        [1, 20],
        [2, 20],
        [3, 20],
        [1, 10],
        [2, 10],
        [3, 10],
      ])
    })
  )

  test(
    'Multi descending/descending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'desc' }, { b: 'desc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [3, 30],
        [3, 20],
        [3, 10],
        [2, 30],
        [2, 20],
        [2, 10],
        [1, 30],
        [1, 20],
        [1, 10],
      ])
    })
  )
  test(
    'Multi descending/descending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'desc' }, { a: 'desc' }],
        query: 'a b',
      })
      expect(users.map(({ a, b }) => [a, b])).toEqual([
        [3, 30],
        [2, 30],
        [1, 30],
        [3, 20],
        [2, 20],
        [1, 20],
        [3, 10],
        [2, 10],
        [1, 10],
      ])
    })
  )

  test(
    'Multi filter, multiple keys throws error ',
    runner(async ({ context }) => {
      await initialiseData({ context })

      const { data, errors } = await context.graphql.raw({
        query: 'query { users(orderBy: [{ a: asc, b: asc }]) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectBadUserInput(errors, [
        { path: ['users'], message: 'Only a single key must be passed to UserOrderByInput' },
      ])
    })
  )

  test(
    'Multi filter, zero keys throws error ',
    runner(async ({ context }) => {
      await initialiseData({ context })

      const { data, errors } = await context.graphql.raw({
        query: 'query { users(orderBy: [{}]) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectBadUserInput(errors, [
        { path: ['users'], message: 'Only a single key must be passed to UserOrderByInput' },
      ])
    })
  )

  test(
    'Multi filter, null values throws error ',
    runner(async ({ context }) => {
      await initialiseData({ context })

      const { data, errors } = await context.graphql.raw({
        query: 'query { users(orderBy: [{ a: null }]) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectBadUserInput(errors, [
        { path: ['users'], message: 'null cannot be passed as an order direction' },
      ])
    })
  )
})

describe('isOrderable', () => {
  test(
    'isOrderable: false',
    runner(async ({ context, gqlSuper }) => {
      await initialiseData({ context })
      const { body } = await gqlSuper({
        query: '{ users(orderBy: [{orderFalse: asc}]) { id } }',
      })
      expectGraphQLValidationError(body.errors, [
        {
          message:
            'Field "orderFalse" is not defined by type "UserOrderByInput". Did you mean "orderTrue"?',
        },
      ])
    })
  )

  test(
    'isOrderable: true',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = (await context.graphql.raw({
        query: '{ users(orderBy: [{orderTrue: asc}]) { id } }',
      })) as ExecutionResult<{ users: { id: number }[] }>
      expect(data!.users).toHaveLength(9)
      expect(errors).toBe(undefined)
    })
  )

  test(
    'isOrderable: () => false',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionFalse: asc}]) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectAccessDenied(errors, [
        {
          path: ['users'],
          msg: 'You cannot order that User - you cannot order the fields orderFunctionFalse',
        },
      ])
    })
  )

  test(
    'isOrderable: () => true',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = (await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionTrue: asc}]) { id } }',
      })) as ExecutionResult<{ users: { id: number }[] }>
      expect(data!.users).toHaveLength(9)
      expect(errors).toBe(undefined)
    })
  )

  test(
    'isOrderable: () => null',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionOtherFalsey: asc}]) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectAccessReturnError(errors, [
        {
          path: ['users'],
          errors: [{ tag: 'User.orderFunctionOtherFalsey.access.read.order', returned: 'object' }],
        },
      ])
    })
  )

  test(
    'isOrderable: () => ({})',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionOtherTruthy: asc}]) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectAccessReturnError(errors, [
        {
          path: ['users'],
          errors: [{ tag: 'User.orderFunctionOtherTruthy.access.read.order', returned: 'object' }],
        },
      ])
    })
  )

  test(
    'isOrderable: multiple () => false',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = await context.graphql.raw({
        query:
          '{ users(orderBy: [{orderFunctionTrue: asc}, {orderFunctionFalse: asc}, {orderFunctionFalseToo: asc}]) { id } }',
      })
      expect(data).toEqual({ users: null })
      expectAccessDenied(errors, [
        {
          path: ['users'],
          msg: 'You cannot order that User - you cannot order the fields orderFunctionFalse',
        },
      ])
    })
  )
})

describe('fieldDefaults order', () => {
  test(
    'undefined retains order fields',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = (await context.graphql.raw({
        query: '{ defaultOrderUndefineds(orderBy: [{a: asc}]) { id } }',
      })) as ExecutionResult<{ defaultOrderUndefineds: { id: number }[] }>
      expect(data!.defaultOrderUndefineds).toHaveLength(9)
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.graphql.omit.read.order omits order fields and can be overridden',
    runner(async ({ context, gqlSuper }) => {
      await initialiseData({ context })
      const { body } = await gqlSuper({
        query: '{ defaultOrderOmitteds(orderBy: [{a: asc}]) { id } }',
      })
      expectGraphQLValidationError(body.errors, [
        {
          message:
            'Field "a" is not defined by type "DefaultOrderOmittedOrderByInput". Did you mean "b"?',
        },
      ])

      const { data, errors } = (await context.graphql.raw({
        query: '{ defaultOrderOmitteds(orderBy: [{b: asc}]) { id } }',
      })) as ExecutionResult<{ defaultOrderOmitteds: { id: number }[] }>
      expect(data!.defaultOrderOmitteds).toHaveLength(9)
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.graphql.omit.read.order false retains order fields',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = (await context.graphql.raw({
        query: '{ defaultOrderRetaineds(orderBy: [{a: asc}]) { id } }',
      })) as ExecutionResult<{ defaultOrderRetaineds: { id: number }[] }>
      expect(data!.defaultOrderRetaineds).toHaveLength(9)
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.access.read.order denyAll denies ordering and can be overridden',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const denied = await context.graphql.raw({
        query: '{ defaultOrderAccessDenieds(orderBy: [{a: asc}]) { id } }',
      })
      expect(denied.data).toEqual({ defaultOrderAccessDenieds: null })
      expectAccessDenied(denied.errors, [
        {
          path: ['defaultOrderAccessDenieds'],
          msg: 'You cannot order that DefaultOrderAccessDenied - you cannot order the fields a',
        },
      ])

      const { data, errors } = (await context.graphql.raw({
        query: '{ defaultOrderAccessDenieds(orderBy: [{b: asc}]) { id } }',
      })) as ExecutionResult<{ defaultOrderAccessDenieds: { id: number }[] }>
      expect(data!.defaultOrderAccessDenieds).toHaveLength(9)
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.access.read.order allowAll allows ordering',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = (await context.graphql.raw({
        query: '{ defaultOrderAccessAlloweds(orderBy: [{a: asc}]) { id } }',
      })) as ExecutionResult<{ defaultOrderAccessAlloweds: { id: number }[] }>
      expect(data!.defaultOrderAccessAlloweds).toHaveLength(9)
      expect(errors).toBe(undefined)
    })
  )

  test(
    'fieldDefaults.access.read.order returning null reports an invalid access return',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderAccessFalseys(orderBy: [{a: asc}]) { id } }',
      })
      expect(data).toEqual({ defaultOrderAccessFalseys: null })
      expectAccessReturnError(errors, [
        {
          path: ['defaultOrderAccessFalseys'],
          errors: [{ tag: 'DefaultOrderAccessFalsey.a.access.read.order', returned: 'object' }],
        },
      ])
    })
  )

  test(
    'fieldDefaults.access.read.order returning an object reports an invalid access return',
    runner(async ({ context }) => {
      await initialiseData({ context })
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderAccessTruthies(orderBy: [{a: asc}]) { id } }',
      })
      expect(data).toEqual({ defaultOrderAccessTruthies: null })
      expectAccessReturnError(errors, [
        {
          path: ['defaultOrderAccessTruthies'],
          errors: [{ tag: 'DefaultOrderAccessTruthy.a.access.read.order', returned: 'object' }],
        },
      ])
    })
  )
})
