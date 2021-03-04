const { multiAdapterRunners, setupFromConfig } = require('@keystone-next/test-utils-legacy');
import { createSchema, list, graphQLSchemaExtension, gql } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';

const falseFn = () => false;

const withAccessCheck = (access, resolver) => {
  return (...args) => {
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

function setupKeystone(adapterName) {
  return setupFromConfig({
    adapterName,
    config: createSchema({
      lists: {
        User: list({
          fields: { name: text() },
        }),
      },
      extendGraphqlSchema: graphQLSchemaExtension({
        typeDefs: gql`
          type Query {
            double(x: Int): Int
            quads(x: Int): Int
          }
          type Mutation {
            triple(x: Int): Int
          }
        `,
        resolvers: {
          Query: {
            double: withAccessCheck(true, (_, { x }) => 2 * x),
            quads: withAccessCheck(falseFn, (_, { x }) => 4 * x),
          },
          Mutation: {
            triple: withAccessCheck(true, (_, { x }) => 3 * x),
          },
        },
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('keystone.extendGraphQLSchema()', () => {
      it(
        'Executes custom queries correctly',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `
              query {
                double(x: 10)
              }
            `,
          });

          if (errors && errors.length) {
            throw errors;
          }

          expect(data.double).toEqual(20);
        })
      );
      it(
        'Denies access acording to access control',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `
              query {
                quads(x: 10)
              }
            `,
          });
          expect(data.quads).toBe(null);
          expect(errors).not.toBe(undefined);
          expect(errors).toHaveLength(1);
        })
      );
      it(
        'Executes custom mutations correctly',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `
              mutation {
                triple(x: 10)
              }
            `,
          });

          if (errors && errors.length) {
            throw errors;
          }

          expect(data.triple).toEqual(30);
        })
      );
    });
  })
);
