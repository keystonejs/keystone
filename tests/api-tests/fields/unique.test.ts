import fs from 'fs';
import path from 'path';
import os from 'os';
import globby from 'globby';
import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { setupTestEnv, setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig, expectPrismaError, dbProvider } from '../utils';

const expectedUniqueConstraintError =
  dbProvider === 'mysql'
    ? {
        message: 'Prisma error: Unique constraint failed on the constraint: `Test_testField_key`',
        code: 'P2002',
        target: 'Test_testField_key',
      }
    : {
        message: 'Prisma error: Unique constraint failed on the fields: (`testField`)',
        code: 'P2002',
        target: ['testField'],
      };

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
            mod.beforeEach(matrixValue);
          }
        });
        afterEach(async () => {
          if (mod.afterEach) {
            await mod.afterEach(matrixValue);
          }
        });
        beforeAll(() => {
          if (mod.beforeAll) {
            mod.beforeAll(matrixValue);
          }
        });
        afterAll(async () => {
          if (mod.afterAll) {
            await mod.afterAll(matrixValue);
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
            storage: {
              test_image: {
                kind: 'local',
                type: 'image',
                storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'tmp_test_images')),
                generateUrl: path => `http://localhost:3000/images${path}`,
                serverRoute: {
                  path: '/images',
                },
              },
              test_file: {
                kind: 'local',
                type: 'file',
                storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'tmp_test_files')),
                generateUrl: path => `http://localhost:3000/files${path}`,
                serverRoute: {
                  path: '/files',
                },
              },
            },
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
                ...expectedUniqueConstraintError,
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
                ...expectedUniqueConstraintError,
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
                storage: {
                  test_image: {
                    kind: 'local',
                    type: 'image',
                    storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'tmp_test_images')),
                    generateUrl: path => `http://localhost:3000/images${path}`,
                    serverRoute: {
                      path: '/images',
                    },
                  },
                  test_file: {
                    kind: 'local',
                    type: 'file',
                    storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'tmp_test_files')),
                    generateUrl: path => `http://localhost:3000/images${path}`,
                    serverRoute: {
                      path: '/images',
                    },
                  },
                },
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
