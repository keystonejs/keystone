import globby from 'globby';
import { list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { humanize } from '@keystone-next/keystone/src/lib/utils';
import { apiTestConfig, expectValidationError } from '../utils';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
testModules
  .map(require)
  .filter(
    ({ skipRequiredTest, unSupportedAdapterList = [] }) =>
      !skipRequiredTest && !unSupportedAdapterList.includes(process.env.TEST_ADAPTER)
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

        const runner = setupTestRunner({
          config: apiTestConfig({
            lists: {
              Test: list({
                fields: {
                  name: text(),
                  testField: mod.typeFunction({
                    validation: { isRequired: true },
                    ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                  }),
                },
              }),
            },
            images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
            files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
          }),
        });

        const messages = [`Test.testField: ${humanize('testField')} is required`];

        test(
          'Create an object without the required field',
          runner(async ({ context }) => {
            const { data, errors } = await context.graphql.raw({
              query: `
                  mutation {
                    createTest(data: { name: "test entry" } ) { id }
                  }`,
            });
            expect(data).toEqual({ createTest: null });
            expectValidationError(errors, [
              {
                path: ['createTest'],
                messages:
                  mod.name === 'Text' ? ['Test.testField: Test Field must not be empty'] : messages,
              },
            ]);
          })
        );

        test(
          'Create an object with an explicit null value',
          runner(async ({ context }) => {
            const { data, errors } = await context.graphql.raw({
              query: `
                  mutation {
                    createTest(data: { name: "test entry", testField: null } ) { id }
                  }`,
            });
            expect(data).toEqual({ createTest: null });
            expectValidationError(errors, [
              {
                path: ['createTest'],
                messages,
              },
            ]);
          })
        );

        test(
          'Update an object with the required field having a null value',
          runner(async ({ context }) => {
            const data0 = await context.query.Test.createOne({
              data: {
                name: 'test entry',
                testField: mod.exampleValue(matrixValue),
              },
            });
            const { data, errors } = await context.graphql.raw({
              query: `
                  mutation {
                    updateTest(where: { id: "${data0.id}" }, data: { name: "updated test entry", testField: null } ) { id }
                  }`,
            });
            expect(data).toEqual({ updateTest: null });
            expectValidationError(errors, [
              {
                path: ['updateTest'],
                messages,
              },
            ]);
          })
        );

        test(
          'Update an object without the required field',
          runner(async ({ context }) => {
            const data0 = await context.query.Test.createOne({
              data: {
                name: 'test entry',
                testField: mod.exampleValue(matrixValue),
              },
            });
            const data = await context.query.Test.updateOne({
              where: { id: data0.id },
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
