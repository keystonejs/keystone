const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { Integer, Virtual } = require('@keystonejs/fields');

function makeSetupKeystone(fields) {
  return function setupKeystone(adapterName) {
    return setupServer({
      adapterName,
      createLists: keystone => {
        keystone.createList('Post', {
          fields: {
            value: { type: Integer },
            ...fields,
          },
        });
      },
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
            foo: { type: Virtual, resolver: () => 'Hello world!' },
          }),
          async ({ keystone }) => {
            const { data, errors } = await keystone.executeGraphQL({
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
            foo: { type: Virtual, graphQLReturnType: 'Int', resolver: () => 42 },
          }),
          async ({ keystone }) => {
            const { data, errors } = await keystone.executeGraphQL({
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
            foo: {
              type: Virtual,
              graphQLReturnType: 'Int',
              args: [
                { name: 'x', type: 'Int' },
                { name: 'y', type: 'Int' },
              ],
              resolver: (item, { x = 5, y = 6 }) => x * y,
            },
          }),
          async ({ keystone }) => {
            const { data, errors } = await keystone.executeGraphQL({
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
            foo: {
              type: Virtual,
              graphQLReturnType: 'Int',
              args: [
                { name: 'x', type: 'Int' },
                { name: 'y', type: 'Int' },
              ],
              resolver: (item, { x = 5, y = 6 }) => x * y,
            },
          }),
          async ({ keystone }) => {
            const { data, errors } = await keystone.executeGraphQL({
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
            foo: {
              type: Virtual,
              extendGraphQLTypes: [`type Movie { title: String, rating: Int }`],
              graphQLReturnType: '[Movie]',
              resolver: () => [{ title: 'CATS!', rating: 100 }],
            },
          }),
          async ({ keystone }) => {
            const { data, errors } = await keystone.executeGraphQL({
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
