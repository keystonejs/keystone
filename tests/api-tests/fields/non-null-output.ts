import globby from 'globby';
import { createSchema, list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { assertObjectType, GraphQLNonNull } from 'graphql';
import { apiTestConfig } from '../utils';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
testModules
  .map(require)
  .filter(
    ({ unSupportedAdapterList = [] }) => !unSupportedAdapterList.includes(process.env.TEST_ADAPTER)
  )
  .forEach(mod => {
    (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
      describe(`${mod.name} - ${matrixValue} - graphql.isNonNull`, () => {
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

        if (mod.supportsGraphQLIsNonNull) {
          const runner = setupTestRunner({
            config: apiTestConfig({
              lists: createSchema({
                Test: list({
                  fields: {
                    name: text(),
                    testField: mod.typeFunction({
                      graphql: { isNonNull: true },
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
            'Sets the output field as non-null when graphql.isNonNull is set',
            runner(async ({ context }) => {
              const outputType = assertObjectType(context.graphql.schema.getType('Test'));
              expect(outputType.getFields().testField).toBeInstanceOf(GraphQLNonNull);
            })
          );
          //   test('Throws when graphql.isNonNull and access control are set', async () => {
          //     setupTestEnv({
          //       config: apiTestConfig({
          //         lists: {
          //           Test: list({
          //             fields: {
          //               name: text(),
          //               testField: mod.typeFunction({
          //                 graphql: { isNonNull: true },
          //                 access:
          //                 ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
          //               }),
          //             },
          //           }),
          //         },
          //         images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
          //         files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
          //       }),
          //     });
          //   });
        }
      });
    });
  });
