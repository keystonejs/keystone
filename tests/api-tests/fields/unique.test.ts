import globby from 'globby';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';
import { setupTestEnv, setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig, expectPrismaError } from '../utils';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
testModules
  .map(require)
  .filter(mod => !mod.skipUniqueTest)
  .filter(
    ({ supportsUnique, unSupportedAdapterList = [] }) =>
      supportsUnique && !unSupportedAdapterList.includes(process.env.TEST_ADAPTER)
  )
  .forEach(mod => {
    (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
      describe(`${mod.name} - ${matrixValue} - isUnique`, () => {
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
        const runner = setupTestRunner({
          config: apiTestConfig({
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
            files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
          }),
        });
        test(
          'uniqueness is enforced over multiple mutations',
          runner(async ({ context, graphQLRequest }) => {
            await context.lists.Test.createOne({
              data: { testField: mod.exampleValue(matrixValue) },
            });

            const { body } = await graphQLRequest({
              query: `
                  mutation($data: TestCreateInput) {
                    createTest(data: $data) { id }
                  }
                `,
              variables: { data: { testField: mod.exampleValue(matrixValue) } },
            });
            expect(body.data).toEqual({ createTest: null });
            expectPrismaError(body.errors, [
              {
                path: ['createTest'],
                message: expect.stringMatching(
                  /\nInvalid `prisma\.test\.create\(\)` invocation:\n(.*\n){2}  Unique constraint failed on the fields: \(`testField`\)/
                ),
              },
            ]);
          })
        );

        test(
          'uniqueness is enforced over single mutation',
          runner(async ({ graphQLRequest }) => {
            const { body } = await graphQLRequest({
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

            expect(body.data).toEqual({ foo: { id: expect.any(String) }, bar: null });
            expectPrismaError(body.errors, [
              {
                path: ['bar'],
                message: expect.stringMatching(
                  /\nInvalid `prisma\.test\.create\(\)` invocation:\n(.*\n){2}  Unique constraint failed on the fields: \(`testField`\)/
                ),
              },
            ]);
          })
        );

        test(
          'Configuring uniqueness on one field does not affect others',
          runner(async ({ context }) => {
            const items = await context.lists.Test.createMany({
              data: [
                { data: { testField: mod.exampleValue(matrixValue), name: 'jess' } },
                { data: { testField: mod.exampleValue2(matrixValue), name: 'jess' } },
              ],
            });
            expect(items).toHaveLength(2);
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
      !supportsUnique &&
      supportsUnique !== null &&
      !unSupportedAdapterList.includes(process.env.TEST_ADAPTER)
  )
  .forEach(mod => {
    (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
      describe(`${mod.name} - ${matrixValue} - isUnique`, () => {
        test('Ensure non-supporting fields throw an error', async () => {
          // Try to create a thing and have it fail
          let erroredOut = false;
          try {
            await setupTestEnv({
              config: apiTestConfig({
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
                files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
              }),
            });
          } catch (error) {
            expect(error.message).toMatch('isUnique is not a supported option for field type');
            erroredOut = true;
          }
          expect(erroredOut).toEqual(true);
        });
      });
    });
  });
