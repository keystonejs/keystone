import globby from 'globby';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';
import { BaseKeystone } from '@keystone-next/types';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
multiAdapterRunners().map(({ runner, provider, after }) =>
  describe(`Provider: ${provider}`, () => {
    testModules
      .map(require)
      .filter(mod => !mod.skipUniqueTest)
      .filter(
        ({ supportsUnique, unSupportedAdapterList = [] }) =>
          supportsUnique && !unSupportedAdapterList.includes(provider)
      )
      .forEach(mod => {
        (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
          describe(`${mod.name} - ${matrixValue} - isUnique`, () => {
            beforeAll(() => {
              if (mod.beforeAll) {
                mod.beforeAll();
              }
            });
            afterAll(async () => {
              if (mod.afterAll) {
                await mod.afterAll();
              }
            });
            const keystoneTestWrapper = (testFn: (setup: any) => Promise<void>) =>
              runner(
                () =>
                  setupFromConfig({
                    provider,
                    config: testConfig({
                      lists: createSchema({
                        Test: list({
                          fields: {
                            name: text(),
                            testField: mod.typeFunction({
                              isUnique: true,
                              ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                            }),
                          },
                        }),
                      }),
                    }),
                  }),
                testFn
              );
            test(
              'uniqueness is enforced over multiple mutations',
              keystoneTestWrapper(async ({ context }) => {
                await context.lists.Test.createOne({
                  data: { testField: mod.exampleValue(matrixValue) },
                });

                const { errors } = await context.graphql.raw({
                  query: `
                  mutation($data: TestCreateInput) {
                    createTest(data: $data) { id }
                  }
                `,
                  variables: { data: { testField: mod.exampleValue(matrixValue) } },
                });

                expect(errors).toHaveProperty('0.message');
                expect(errors[0].message).toEqual(
                  expect.stringMatching(
                    /duplicate key|to be unique|Unique constraint failed on the fields/
                  )
                );
              })
            );

            test(
              'uniqueness is enforced over single mutation',
              keystoneTestWrapper(async ({ context }) => {
                const { errors } = await context.graphql.raw({
                  query: `
                  mutation($fooData: TestCreateInput, $barData: TestCreateInput) {
                    foo: createTest(data: $fooData) { id }
                    bar: createTest(data: $barData) { id }
                  }
                `,
                  variables: {
                    fooData: { testField: mod.exampleValue(matrixValue) },
                    barData: { testField: mod.exampleValue(matrixValue) },
                  },
                });

                expect(errors).toHaveProperty('0.message');
                expect(errors[0].message).toEqual(
                  expect.stringMatching(
                    /duplicate key|to be unique|Unique constraint failed on the fields/
                  )
                );
              })
            );

            test(
              'Configuring uniqueness on one field does not affect others',
              keystoneTestWrapper(async ({ context }) => {
                const data = await context.graphql.run({
                  query: `
                  mutation($fooData: TestCreateInput, $barData: TestCreateInput) {
                    foo: createTest(data: $fooData) { id }
                    bar: createTest(data: $barData) { id }
                  }
                `,
                  variables: {
                    fooData: { testField: mod.exampleValue(matrixValue), name: 'jess' },
                    barData: { testField: mod.exampleValue2(matrixValue), name: 'jess' },
                  },
                });

                expect(data).toHaveProperty('foo.id');
                expect(data).toHaveProperty('bar.id');
              })
            );
          });
        });
      });

    testModules
      .map(require)
      .filter(mod => !mod.skipUniqueTest)
      .filter(
        ({ supportsUnique, unSupportedAdapterList = [] }) =>
          !supportsUnique && supportsUnique !== null && !unSupportedAdapterList.includes(provider)
      )
      .forEach(mod => {
        (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
          describe(`${mod.name} - ${matrixValue} - isUnique`, () => {
            test('Ensure non-supporting fields throw an error', async () => {
              // Try to create a thing and have it fail
              let erroredOut = false;
              try {
                await setupFromConfig({
                  provider,
                  config: testConfig({
                    lists: createSchema({
                      Test: list({
                        fields: {
                          name: text(),
                          testField: mod.typeFunction({
                            isUnique: true,
                            ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                          }),
                        },
                      }),
                    }),
                    images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
                  }),
                });
              } catch (error) {
                expect(error.message).toMatch('isUnique is not a supported option for field type');
                erroredOut = true;
              } finally {
                after({ disconnect: async () => {} } as BaseKeystone);
              }
              expect(erroredOut).toEqual(true);
            });
          });
        });
      });
  })
);
