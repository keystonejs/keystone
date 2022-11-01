import { list, graphql } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import { apiTestConfig, expectInternalServerError } from '../utils';
import { withServer } from '../with-server';

const falseFn: (...args: any) => boolean = () => false;

const withAccessCheck = <T, Args extends unknown[]>(
  access: boolean | ((...args: Args) => boolean),
  resolver: (...args: Args) => T
): ((...args: Args) => T) => {
  return (...args: Args) => {
    if (typeof access === 'function') {
      if (!access(...args)) {
        throw new Error('Access denied');
      }
    } else if (!access) {
      throw new Error('Access denied');
    }
    return resolver(...args);
  };
};

const extendGraphqlSchema = graphql.extend(() => {
  return {
    mutation: {
      triple: graphql.field({
        type: graphql.Int,
        args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
        resolve: withAccessCheck(true, (_, { x }: { x: number }) => 3 * x),
      }),
    },
    query: {
      double: graphql.field({
        type: graphql.Int,
        args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
        resolve: withAccessCheck(true, (_, { x }: { x: number }) => 2 * x),
      }),
      quads: graphql.field({
        type: graphql.Int,
        args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
        resolve: withAccessCheck(falseFn, (_, { x }: { x: number }) => 4 * x),
      }),
    },
  };
});

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        access: allowAll,
        fields: { name: text() },
      }),
    },
    extendGraphqlSchema,
  }),
});

describe('extendGraphqlSchema', () => {
  it(
    'Executes custom queries correctly',
    runner(async ({ context }) => {
      const data = await context.graphql.run({
        query: `
              query {
                double(x: 10)
              }
            `,
      });
      expect(data).toEqual({ double: 20 });
    })
  );
  it(
    'Denies access acording to access control',
    withServer(runner)(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `
          query {
            quads(x: 10)
          }
        `,
      });
      expect(body.data).toEqual({ quads: null });
      expectInternalServerError(body.errors, false, [
        { path: ['quads'], message: 'Access denied' },
      ]);
    })
  );
  it(
    'Executes custom mutations correctly',
    runner(async ({ context }) => {
      const data = await context.graphql.run({
        query: `
              mutation {
                triple(x: 10)
              }
            `,
      });

      expect(data).toEqual({ triple: 30 });
    })
  );
  it(
    'Default keystone resolvers remain unchanged',
    runner(async ({ context }) => {
      const data = await context.graphql.run({
        query: `
              mutation {
                createUser(data: { name: "Real User" }) {
                  name
                }
              }
            `,
      });

      expect(data).toEqual({ createUser: { name: 'Real User' } });
    })
  );
});
