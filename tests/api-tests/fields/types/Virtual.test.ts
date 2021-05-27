import { integer, virtual } from '@keystone-next/fields';
import { BaseFields, createSchema, list } from '@keystone-next/keystone/schema';
import {
  ProviderName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';
import { types } from '@keystone-next/types';

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
        'no args',
        runner(
          makeSetupKeystone({
            foo: virtual({
              field: types.field({
                type: types.Int,
                resolve() {
                  return 42;
                },
              }),
            }),
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
              field: types.field({
                type: types.Int,
                args: {
                  x: types.arg({ type: types.Int }),
                  y: types.arg({ type: types.Int }),
                },
                resolve: (item, { x = 5, y = 6 }) => x! * y!,
              }),
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
              field: types.field({
                type: types.Int,
                args: {
                  x: types.arg({ type: types.Int }),
                  y: types.arg({ type: types.Int }),
                },
                resolve: (item, { x = 5, y = 6 }) => x! * y!,
              }),
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
              field: types.field({
                type: types.list(
                  types.object<{ title: string; rating: number }>()({
                    name: 'Movie',
                    fields: {
                      title: types.field({ type: types.String }),
                      rating: types.field({ type: types.Int }),
                    },
                  })
                ),
                resolve() {
                  return [{ title: 'CATS!', rating: 100 }];
                },
              }),
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
