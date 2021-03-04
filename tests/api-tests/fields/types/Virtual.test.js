const { integer, virtual } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { multiAdapterRunners, setupFromConfig } = require('@keystone-next/test-utils-legacy');

function makeSetupKeystone(fields) {
  return function setupKeystone(adapterName) {
    return setupFromConfig({
      adapterName,
      config: createSchema({
        lists: {
          Post: list({
            fields: {
              value: integer(),
              ...fields,
            },
          }),
        },
      }),
    });
  };
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Virtual field type', () => {
      test(
        'Default - resolver returns a string',
        runner(
          makeSetupKeystone({
            foo: virtual({ resolver: () => 'Hello world!' }),
          }),
          async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `mutation {
                createPost(data: { value: 1 }) { value, foo }
              }`,
            });
            expect(errors).toBe(undefined);
            expect(data.createPost.value).toEqual(1);
            expect(data.createPost.foo).toEqual('Hello world!');
          }
        )
      );

      test(
        'graphQLReturnType',
        runner(
          makeSetupKeystone({
            foo: virtual({ graphQLReturnType: 'Int', resolver: () => 42 }),
          }),
          async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `mutation {
                createPost(data: { value: 1 }) { value, foo }
              }`,
            });
            expect(errors).toBe(undefined);
            expect(data.createPost.value).toEqual(1);
            expect(data.createPost.foo).toEqual(42);
          }
        )
      );

      test(
        'args',
        runner(
          makeSetupKeystone({
            foo: virtual({
              graphQLReturnType: 'Int',
              args: [
                { name: 'x', type: 'Int' },
                { name: 'y', type: 'Int' },
              ],
              resolver: (item, { x = 5, y = 6 }) => x * y,
            }),
          }),
          async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `mutation {
                createPost(data: { value: 1 }) { value, foo(x: 10, y: 20) }
              }`,
            });
            expect(errors).toBe(undefined);
            expect(data.createPost.value).toEqual(1);
            expect(data.createPost.foo).toEqual(200);
          }
        )
      );

      test(
        'args - use defaults',
        runner(
          makeSetupKeystone({
            foo: virtual({
              graphQLReturnType: 'Int',
              args: [
                { name: 'x', type: 'Int' },
                { name: 'y', type: 'Int' },
              ],
              resolver: (item, { x = 5, y = 6 }) => x * y,
            }),
          }),
          async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `mutation {
                createPost(data: { value: 1 }) { value, foo }
              }`,
            });
            expect(errors).toBe(undefined);
            expect(data.createPost.value).toEqual(1);
            expect(data.createPost.foo).toEqual(30);
          }
        )
      );

      test(
        'graphQLReturnFragment',
        runner(
          makeSetupKeystone({
            foo: virtual({
              extendGraphQLTypes: [`type Movie { title: String, rating: Int }`],
              graphQLReturnType: '[Movie]',
              resolver: () => [{ title: 'CATS!', rating: 100 }],
            }),
          }),
          async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `mutation {
                createPost(data: { value: 1 }) { value, foo { title rating } }
              }`,
            });
            expect(errors).toBe(undefined);
            expect(data.createPost.value).toEqual(1);
            expect(data.createPost.foo).toEqual([{ title: 'CATS!', rating: 100 }]);
          }
        )
      );
    });
  })
);
