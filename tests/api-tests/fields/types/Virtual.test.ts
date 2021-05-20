// @ts-nocheck
// REMOVE THE ABOVE THING BEFORE MERGING
// i just want the errors to disappear for now
// (the errors are correct and represent things that need to be changed)
import { integer, virtual } from '@keystone-next/fields';
import { BaseFields, createSchema, list } from '@keystone-next/keystone/schema';
import {
  ProviderName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';

function makeSetupKeystone(fields: BaseFields<any>) {
  return function setupKeystone(provider: ProviderName) {
    return setupFromConfig({
      provider,
      config: testConfig({
        lists: createSchema({
          Post: list({
            fields: {
              value: integer(),
              ...fields,
            },
          }),
        }),
      }),
    });
  };
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('Virtual field type', () => {
      test(
        'Default - resolver returns a string',
        runner(
          makeSetupKeystone({
            foo: virtual({ resolver: () => 'Hello world!' }),
          }),
          async ({ context }) => {
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual('Hello world!');
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
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual(42);
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
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo(x: 10, y: 20)',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual(200);
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
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual(30);
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
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo { title rating }',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual([{ title: 'CATS!', rating: 100 }]);
          }
        )
      );
    });
  })
);
