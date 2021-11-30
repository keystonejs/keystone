import globby from 'globby';
import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { setupTestEnv, setupTestRunner } from '@keystone-6/core/testing';
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
      describe(`${mod.name} - ${matrixValue} - isIndexed: 'unique'`, () => {
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
            lists: {
              Test: list({
                fields: {
                  name: text(),
                  testField: mod.typeFunction({
                    isIndexed: 'unique',
                    ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                  }),
                },
              }),
            },
            images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
            files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
          }),
        });
        test(
          'uniqueness is enforced over multiple mutations',
          runner(async ({ context }) => {
            await context.query.Test.createOne({
              data: { testField: mod.exampleValue(matrixValue) },
            });

            const { data, errors } = await context.graphql.raw({
              query: `
                  mutation($data: TestCreateInput!) {
                    createTest(data: $data) { id }
                  }
                `,
              variables: { data: { testField: mod.exampleValue(matrixValue) } },
            });
            expect(data).toEqual({ createTest: null });
            expectPrismaError(errors, [
              {
                path: ['createTest'],
                message: expect.stringMatching(
                  /Prisma error: Unique constraint failed on the fields: \(`testField`\)/
                ),
                code: 'P2002',
                target: ['testField'],
              },
            ]);
          })
        );

        test(
          'uniqueness is enforced over single mutation',
          runner(async ({ context }) => {
            const { data, errors } = await context.graphql.raw({
              query: `
                  mutation($fooData: TestCreateInput!, $barData: TestCreateInput!) {
                    foo: createTest(data: $fooData) { id }
                    bar: createTest(data: $barData) { id }
                  }
                `,
              variables: {
                fooData: { testField: mod.exampleValue(matrixValue) },
                barData: { testField: mod.exampleValue(matrixValue) },
              },
            });

            expect(data).toEqual({ foo: { id: expect.any(String) }, bar: null });
            expectPrismaError(errors, [
              {
                path: ['bar'],
                message: expect.stringMatching(
                  /Prisma error: Unique constraint failed on the fields: \(`testField`\)/
                ),
                code: 'P2002',
                target: ['testField'],
              },
            ]);
          })
        );

        test(
          'Configuring uniqueness on one field does not affect others',
          runner(async ({ context }) => {
            const items = await context.query.Test.createMany({
              data: [
                { testField: mod.exampleValue(matrixValue), name: 'jess' },
                { testField: mod.exampleValue2(matrixValue), name: 'jess' },
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
      describe(`${mod.name} - ${matrixValue} - isIndexed: 'unique'`, () => {
        test('Ensure non-supporting fields throw an error', async () => {
          // Try to create a thing and have it fail
          let erroredOut = false;
          try {
            await setupTestEnv({
              config: apiTestConfig({
                lists: {
                  Test: list({
                    fields: {
                      name: text(),
                      testField: mod.typeFunction({
                        isIndexed: 'unique',
                        ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                      }),
                    },
                  }),
                },
                images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
                files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
              }),
            });
          } catch (error: any) {
            expect(error.message).toMatch(
              "isIndexed: 'unique' is not a supported option for field type"
            );
            erroredOut = true;
          }
          expect(erroredOut).toEqual(true);
        });
      });
    });
  });
