import { integer } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import { KeystoneContext } from '@keystone-6/core/types';
import {
  apiTestConfig,
  expectAccessReturnError,
  expectBadUserInput,
  expectGraphQLValidationError,
  expectFilterDenied,
} from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          a: integer(),
          b: integer(),
          orderFalse: integer({ isOrderable: false }),
          orderTrue: integer({ isOrderable: true }),
          orderFunctionFalse: integer({ isOrderable: () => false }),
          orderFunctionTrue: integer({ isOrderable: () => true }),
          // @ts-ignore
          orderFunctionOtherFalsey: integer({ isOrderable: () => null }),
          // @ts-ignore
          orderFunctionOtherTruthy: integer({ isOrderable: () => ({}) }),
          orderFunctionFalseToo: integer({ isOrderable: () => false }),
        },
      }),
      DefaultOrderUndefined: list({ fields: { a: integer(), b: integer({ isOrderable: true }) } }),
      DefaultOrderFalse: list({
        fields: { a: integer(), b: integer({ isOrderable: true }) },
        defaultIsOrderable: false,
      }),
      DefaultOrderTrue: list({
        fields: { a: integer(), b: integer({ isOrderable: true }) },
        // @ts-ignore
        defaultIsOrderable: true,
      }),
      DefaultOrderFunctionFalse: list({
        fields: { a: integer(), b: integer({ isOrderable: true }) },
        defaultIsOrderable: () => false,
      }),
      DefaultOrderFunctionTrue: list({
        fields: { a: integer(), b: integer({ isOrderable: true }) },
        defaultIsOrderable: () => true,
      }),
      DefaultOrderFunctionFalsey: list({
        fields: { a: integer(), b: integer({ isOrderable: true }) },
        // @ts-ignore
        defaultIsOrderable: () => null,
      }),
      DefaultOrderFunctionTruthy: list({
        fields: { a: integer(), b: integer({ isOrderable: true }) },
        // @ts-ignore
        defaultIsOrderable: () => ({}),
      }),
    },
  }),
});

const initialiseData = async ({ context }: { context: KeystoneContext }) => {
  // Use shuffled data to ensure that ordering is actually happening.
  for (const listKey of Object.keys(context.query)) {
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
    });
  }
};

describe('Ordering by a single field', () => {
  test(
    'Single ascending filter - a',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({ orderBy: [{ a: 'asc' }], query: 'a' });
      expect(users.map(({ a }) => a)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
    })
  );
  test(
    'Single descending filter - a',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({ orderBy: [{ a: 'desc' }], query: 'a' });
      expect(users.map(({ a }) => a)).toEqual([3, 3, 3, 2, 2, 2, 1, 1, 1]);
    })
  );
  test(
    'Single ascending filter - b',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({ orderBy: [{ b: 'asc' }], query: 'b' });
      expect(users.map(({ b }) => b)).toEqual([10, 10, 10, 20, 20, 20, 30, 30, 30]);
    })
  );
  test(
    'Single descending filter - b',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({ orderBy: [{ b: 'desc' }], query: 'b' });
      expect(users.map(({ b }) => b)).toEqual([30, 30, 30, 20, 20, 20, 10, 10, 10]);
    })
  );

  test(
    'Single ascending filter - non-list - a',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({ orderBy: { a: 'asc' }, query: 'a' });
      expect(users.map(({ a }) => a)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
    })
  );
});

describe('Ordering by Multiple', () => {
  test(
    'Multi ascending/ascending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'asc' }, { b: 'asc' }],
        query: 'a b',
      });
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
      ]);
    })
  );
  test(
    'Multi ascending/ascending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'asc' }, { a: 'asc' }],
        query: 'a b',
      });
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
      ]);
    })
  );

  test(
    'Multi ascending/descending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'asc' }, { b: 'desc' }],
        query: 'a b',
      });
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
      ]);
    })
  );
  test(
    'Multi ascending/descending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'asc' }, { a: 'desc' }],
        query: 'a b',
      });
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
      ]);
    })
  );

  test(
    'Multi descending/ascending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'desc' }, { b: 'asc' }],
        query: 'a b',
      });
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
      ]);
    })
  );
  test(
    'Multi descending/ascending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'desc' }, { a: 'asc' }],
        query: 'a b',
      });
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
      ]);
    })
  );

  test(
    'Multi descending/descending filter - a,b ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ a: 'desc' }, { b: 'desc' }],
        query: 'a b',
      });
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
      ]);
    })
  );
  test(
    'Multi descending/descending filter - b,a ',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const users = await context.query.User.findMany({
        orderBy: [{ b: 'desc' }, { a: 'desc' }],
        query: 'a b',
      });
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
      ]);
    })
  );

  test(
    'Multi filter, multiple keys throws error ',
    runner(async ({ context }) => {
      await initialiseData({ context });

      const { data, errors } = await context.graphql.raw({
        query: 'query { users(orderBy: [{ a: asc, b: asc }]) { id } }',
      });
      expect(data).toEqual({ users: null });
      expectBadUserInput(errors, [
        { path: ['users'], message: 'Only a single key must be passed to UserOrderByInput' },
      ]);
    })
  );

  test(
    'Multi filter, zero keys throws error ',
    runner(async ({ context }) => {
      await initialiseData({ context });

      const { data, errors } = await context.graphql.raw({
        query: 'query { users(orderBy: [{}]) { id } }',
      });
      expect(data).toEqual({ users: null });
      expectBadUserInput(errors, [
        { path: ['users'], message: 'Only a single key must be passed to UserOrderByInput' },
      ]);
    })
  );

  test(
    'Multi filter, null values throws error ',
    runner(async ({ context }) => {
      await initialiseData({ context });

      const { data, errors } = await context.graphql.raw({
        query: 'query { users(orderBy: [{ a: null }]) { id } }',
      });
      expect(data).toEqual({ users: null });
      expectBadUserInput(errors, [
        { path: ['users'], message: 'null cannot be passed as an order direction' },
      ]);
    })
  );
});

describe('isOrderable', () => {
  test(
    'isOrderable: false',
    runner(async ({ context, graphQLRequest }) => {
      await initialiseData({ context });
      const { body } = await graphQLRequest({
        query: '{ users(orderBy: [{orderFalse: asc}]) { id } }',
      });
      expectGraphQLValidationError(body.errors, [
        {
          message:
            'Field "orderFalse" is not defined by type "UserOrderByInput". Did you mean "orderTrue"?',
        },
      ]);
    })
  );

  test(
    'isOrderable: true',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderTrue: asc}]) { id } }',
      });
      expect(data!.users).toHaveLength(9);
      expect(errors).toBe(undefined);
    })
  );

  test(
    'isOrderable: () => false',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionFalse: asc}]) { id } }',
      });
      expect(data).toEqual({ users: null });
      expectFilterDenied(errors, [
        {
          path: ['users'],
          message:
            'You do not have access to perform \'orderBy\' operations on the fields ["User.orderFunctionFalse"].',
        },
      ]);
    })
  );

  test(
    'isOrderable: () => true',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionTrue: asc}]) { id } }',
      });
      expect(data!.users).toHaveLength(9);
      expect(errors).toBe(undefined);
    })
  );

  test(
    'isOrderable: () => null',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionOtherFalsey: asc}]) { id } }',
      });
      expect(data).toEqual({ users: null });
      expectAccessReturnError(errors, [
        {
          path: ['users'],
          errors: [{ tag: 'User.orderFunctionOtherFalsey.isOrderable', returned: 'object' }],
        },
      ]);
    })
  );

  test(
    'isOrderable: () => ({})',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ users(orderBy: [{orderFunctionOtherTruthy: asc}]) { id } }',
      });
      expect(data).toEqual({ users: null });
      expectAccessReturnError(errors, [
        {
          path: ['users'],
          errors: [{ tag: 'User.orderFunctionOtherTruthy.isOrderable', returned: 'object' }],
        },
      ]);
    })
  );

  test(
    'isOrderable: multiple () => false',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query:
          '{ users(orderBy: [{orderFunctionTrue: asc}, {orderFunctionFalse: asc}, {orderFunctionFalseToo: asc}]) { id } }',
      });
      expect(data).toEqual({ users: null });
      expectFilterDenied(errors, [
        {
          path: ['users'],
          message:
            'You do not have access to perform \'orderBy\' operations on the fields ["User.orderFunctionFalse","User.orderFunctionFalseToo"].',
        },
      ]);
    })
  );
});

describe('defaultIsOrderable', () => {
  test(
    'defaultIsOrderable: undefined',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderUndefineds(orderBy: [{a: asc}]) { id } }',
      });
      expect(data!.defaultOrderUndefineds).toHaveLength(9);
      expect(errors).toBe(undefined);
    })
  );

  test(
    'defaultIsOrderable: false',
    runner(async ({ context, graphQLRequest }) => {
      await initialiseData({ context });
      const { body } = await graphQLRequest({
        query: '{ defaultOrderFalses(orderBy: [{a: asc}]) { id } }',
      });
      expectGraphQLValidationError(body.errors, [
        {
          message:
            'Field "a" is not defined by type "DefaultOrderFalseOrderByInput". Did you mean "b"?',
        },
      ]);
    })
  );

  test(
    'defaultIsOrderable: true',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderTrues(orderBy: [{a: asc}]) { id } }',
      });
      expect(data!.defaultOrderTrues).toHaveLength(9);
      expect(errors).toBe(undefined);
    })
  );

  test(
    'defaultIsOrderable: () => false',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderFunctionFalses(orderBy: [{a: asc}]) { id } }',
      });
      expect(data).toEqual({ defaultOrderFunctionFalses: null });
      expectFilterDenied(errors, [
        {
          path: ['defaultOrderFunctionFalses'],
          message:
            'You do not have access to perform \'orderBy\' operations on the fields ["DefaultOrderFunctionFalse.a"].',
        },
      ]);
    })
  );

  test(
    'defaultIsOrderable: () => true',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderFunctionTrues(orderBy: [{a: asc}]) { id } }',
      });
      expect(data!.defaultOrderFunctionTrues).toHaveLength(9);
      expect(errors).toBe(undefined);
    })
  );

  test(
    'defaultIsOrderable: () => null',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderFunctionFalseys(orderBy: [{a: asc}]) { id } }',
      });
      expect(data).toEqual({ defaultOrderFunctionFalseys: null });
      expectAccessReturnError(errors, [
        {
          path: ['defaultOrderFunctionFalseys'],
          errors: [{ tag: 'DefaultOrderFunctionFalsey.a.isOrderable', returned: 'object' }],
        },
      ]);
    })
  );

  test(
    'defaultIsOrderable: () => ({})',
    runner(async ({ context }) => {
      await initialiseData({ context });
      const { data, errors } = await context.graphql.raw({
        query: '{ defaultOrderFunctionTruthies(orderBy: [{a: asc}]) { id } }',
      });
      expect(data).toEqual({ defaultOrderFunctionTruthies: null });
      expectAccessReturnError(errors, [
        {
          path: ['defaultOrderFunctionTruthies'],
          errors: [{ tag: 'DefaultOrderFunctionTruthy.a.isOrderable', returned: 'object' }],
        },
      ]);
    })
  );
});
