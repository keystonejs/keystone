import globby from 'globby';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    testModules
      .map(require)
      .filter(
        ({ skipRequiredTest, unSupportedAdapterList = [] }) =>
          !skipRequiredTest && !unSupportedAdapterList.includes(provider)
      )
      .forEach(mod => {
        (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
          describe(`${mod.name} - ${matrixValue} - isRequired`, () => {
            beforeEach(() => {
              if (mod.beforeEach) {
                mod.beforeEach();
              }
            });
            afterEach(async () => {
              if (mod.afterEach) {
                await mod.afterEach();
              }
            });
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
                              isRequired: true,
                              ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                            }),
                          },
                        }),
                      }),
                      images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
                      files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
                    }),
                  }),
                testFn
              );
            test(
              'Create an object without the required field',
              keystoneTestWrapper(async ({ context }) => {
                const { data, errors } = await context.graphql.raw({
                  query: `
                  mutation {
                    createTest(data: { name: "test entry" } ) { id }
                  }`,
                });
                expect(data.createTest).toBe(null);
                expect(errors).not.toBe(null);
                expect(errors.length).toEqual(1);
                expect(errors[0].message).toEqual('You attempted to perform an invalid mutation');
                expect(errors[0].path[0]).toEqual('createTest');
              })
            );

            test(
              'Update an object with the required field having a null value',
              keystoneTestWrapper(async ({ context }) => {
                const data0 = await context.lists.Test.createOne({
                  data: {
                    name: 'test entry',
                    testField: mod.exampleValue(matrixValue),
                  },
                });
                const { data, errors } = await context.graphql.raw({
                  query: `
                  mutation {
                    updateTest(id: "${data0.id}" data: { name: "updated test entry", testField: null } ) { id }
                  }`,
                });
                expect(data.updateTest).toBe(null);
                expect(errors).not.toBe(undefined);
                expect(errors.length).toEqual(1);
                expect(errors[0].message).toEqual('You attempted to perform an invalid mutation');
                expect(errors[0].path[0]).toEqual('updateTest');
              })
            );

            test(
              'Update an object without the required field',
              keystoneTestWrapper(async ({ context }) => {
                const data0 = await context.lists.Test.createOne({
                  data: {
                    name: 'test entry',
                    testField: mod.exampleValue(matrixValue),
                  },
                });
                const data = await context.lists.Test.updateOne({
                  id: data0.id,
                  data: { name: 'updated test entry' },
                  query: 'id name',
                });
                expect(data).not.toBe(null);
                expect(data.name).toEqual('updated test entry');
              })
            );
          });
        });
      });
  })
);
