import { integer } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { DatabaseProvider, KeystoneContext } from '@keystone-next/types';

function setupKeystone(provider: DatabaseProvider) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            a: integer(),
            b: integer(),
          },
        }),
      }),
    }),
  });
}

const initialiseData = async ({ context }: { context: KeystoneContext }) => {
  // Use shuffled data to ensure that sorting is actually happening.
  await context.lists.User.createMany({
    data: [
      { data: { a: 1, b: 10 } },
      { data: { a: 1, b: 30 } },
      { data: { a: 1, b: 20 } },
      { data: { a: 3, b: 30 } },
      { data: { a: 3, b: 10 } },
      { data: { a: 3, b: 20 } },
      { data: { a: 2, b: 30 } },
      { data: { a: 2, b: 20 } },
      { data: { a: 2, b: 10 } },
    ],
  });
};

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('Sorting by a single field', () => {
      test(
        'Single ascending filter - a',
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({ sortBy: ['a_ASC'], query: 'a' });
          expect(users.map(({ a }) => a)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
        })
      );
      test(
        'Single descending filter - a',
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({ sortBy: ['a_DESC'], query: 'a' });
          expect(users.map(({ a }) => a)).toEqual([3, 3, 3, 2, 2, 2, 1, 1, 1]);
        })
      );
      test(
        'Single ascending filter - b',
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({ sortBy: ['b_ASC'], query: 'b' });
          expect(users.map(({ b }) => b)).toEqual([10, 10, 10, 20, 20, 20, 30, 30, 30]);
        })
      );
      test(
        'Single descending filter - b',
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({ sortBy: ['b_DESC'], query: 'b' });
          expect(users.map(({ b }) => b)).toEqual([30, 30, 30, 20, 20, 20, 10, 10, 10]);
        })
      );

      test(
        'Multi ascending/ascending filter - a,b ',
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['a_ASC', 'b_ASC'],
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
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['b_ASC', 'a_ASC'],
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
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['a_ASC', 'b_DESC'],
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
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['b_ASC', 'a_DESC'],
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
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['a_DESC', 'b_ASC'],
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
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['b_DESC', 'a_ASC'],
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
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['a_DESC', 'b_DESC'],
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
        runner(setupKeystone, async ({ context }) => {
          await initialiseData({ context });
          const users = await context.lists.User.findMany({
            sortBy: ['b_DESC', 'a_DESC'],
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
    });
  })
);
