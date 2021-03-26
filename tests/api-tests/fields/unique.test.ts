import globby from 'globby';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
multiAdapterRunners().map(({ runner, adapterName, after }) =>
  describe(`Adapter: ${adapterName}`, () => {
    testModules
      .map(require)
      .filter(
        ({ supportsUnique, unSupportedAdapterList = [] }) =>
          supportsUnique && !unSupportedAdapterList.includes(adapterName)
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
                    adapterName,
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
              keystoneTestWrapper(async ({ keystone, context }) => {
                const { errors } = await (context || keystone).executeGraphQL({
                  query: `
                  mutation($data: TestCreateInput) {
                    createTest(data: $data) { id }
                  }
                `,
                  variables: { data: { testField: mod.exampleValue(matrixValue) } },
                });
                expect(errors).toBe(undefined);

                const { errors: errors2 } = await (context || keystone).executeGraphQL({
                  query: `
                  mutation($data: TestCreateInput) {
                    createTest(data: $data) { id }
                  }
                `,
                  variables: { data: { testField: mod.exampleValue(matrixValue) } },
                });

                expect(errors2).toHaveProperty('0.message');
                expect(errors2[0].message).toEqual(
                  expect.stringMatching(
                    /duplicate key|to be unique|Unique constraint failed on the fields/
                  )
                );
              })
            );

            test(
              'uniqueness is enforced over single mutation',
              keystoneTestWrapper(async ({ keystone, context }) => {
                const { errors } = await (context || keystone).executeGraphQL({
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
              keystoneTestWrapper(async ({ keystone, context }) => {
                const { data, errors } = await (context || keystone).executeGraphQL({
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

                expect(errors).toBe(undefined);
                expect(data).toHaveProperty('foo.id');
                expect(data).toHaveProperty('bar.id');
              })
            );
          });
        });
      });

    testModules
      .map(require)
      .filter(
        ({ supportsUnique, unSupportedAdapterList = [] }) =>
          !supportsUnique &&
          supportsUnique !== null &&
          !unSupportedAdapterList.includes(adapterName)
      )
      .forEach(mod => {
        (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
          describe(`${mod.name} - ${matrixValue} - isUnique`, () => {
            test('Ensure non-supporting fields throw an error', async () => {
              // Try to create a thing and have it fail
              let erroredOut = false;
              try {
                await setupFromConfig({
                  adapterName,
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
                });
              } catch (error) {
                expect(error.message).toMatch('isUnique is not a supported option for field type');
                erroredOut = true;
              } finally {
                after({ disconnect: () => {} });
              }
              expect(erroredOut).toEqual(true);
            });
          });
        });
      });
  })
);
