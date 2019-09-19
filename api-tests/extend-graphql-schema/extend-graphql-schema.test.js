const { Text } = require('@keystone-alpha/fields');
const {
  multiAdapterRunners,
  setupServer,
  graphqlRequest,
  networkedGraphqlRequest,
} = require('@keystone-alpha/test-utils');
const cuid = require('cuid');

const falseFn = () => false;

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: { name: { type: Text } },
      });
      keystone.extendGraphQLSchema({
        queries: [
          {
            schema: 'double(x: Int): Int',
            resolver: (_, { x }) => 2 * x,
            access: true,
          },
          {
            schema: 'quads(x: Int): Int',
            resolver: (_, { x }) => 4 * x,
            access: falseFn,
          },
        ],
        mutations: [
          {
            schema: 'triple(x: Int): Int',
            resolver: (_, { x }) => 3 * x,
            access: { testing: true },
          },
        ],
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('keystone.extendGraphQLSchema()', () => {
      it(
        'Sets up access control properly',
        runner(setupKeystone, async ({ keystone }) => {
          expect(keystone._extendedQueries.map(({ access }) => access)).toEqual([
            { testing: true },
            { testing: falseFn },
          ]);
          expect(keystone._extendedMutations.map(({ access }) => access)).toEqual([
            { testing: true },
          ]);
        })
      );

      it(
        'Executes custom queries correctly',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
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
        runner(setupKeystone, async ({ app }) => {
          const { data, errors } = await networkedGraphqlRequest({
            app,
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
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
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
