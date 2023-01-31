import fs from 'fs';
import path from 'path';
import os from 'os';
import globby from 'globby';
import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { setupTestEnv } from '@keystone-6/api-tests/test-runner';
import { assertInputObjectType, assertObjectType, GraphQLNonNull } from 'graphql';
import { allowAll } from '@keystone-6/core/access';
import { apiTestConfig } from '../utils';

type TextFieldConfig = Parameters<typeof text>[0];
const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});

testModules
  .map(require)
  .filter(
    ({ unSupportedAdapterList = [], name }) =>
      name !== 'ID' && !unSupportedAdapterList.includes(process.env.TEST_ADAPTER)
  )
  .forEach(mod => {
    (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
      describe(`${mod.name} - ${matrixValue} - graphql.isNonNull`, () => {
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

        const getSchema = async (fieldConfig: TextFieldConfig) => {
          const { testArgs } = await setupTestEnv({
            config: apiTestConfig({
              lists: {
                Test: list({
                  access: allowAll,
                  fields: {
                    name: text(),
                    testField: mod.typeFunction({
                      ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                      ...fieldConfig,
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
          return testArgs.context.graphql.schema;
        };

        if (mod.supportsGraphQLIsNonNull) {
          test('Sets the output field as non-null when graphql.isNonNull.read is set', async () => {
            const schema = await getSchema({ graphql: { isNonNull: { read: true } } });

            const outputType = assertObjectType(schema.getType('Test'));
            expect(outputType.getFields().testField.type).toBeInstanceOf(GraphQLNonNull);
          });
          test('Throws when graphql.isNonNull.read and read access control is set', async () => {
            const error = await getSchema({
              graphql: { isNonNull: { read: true } },
              access: { read: () => false },
            }).catch(x => x);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toEqual(
              `The field at Test.testField sets graphql.isNonNull.read: true, and has 'read' field access control, this is not allowed.\n` +
                `Either disable graphql.read.isNonNull, or disable 'read' field access control.`
            );
          });
          test('Sets the create field as non-null when graphql.isNonNull.create is set', async () => {
            const schema = await getSchema({ graphql: { isNonNull: { create: true } } });
            const createType = assertInputObjectType(schema.getType('TestCreateInput'));
            expect(createType.getFields().testField.type).toBeInstanceOf(GraphQLNonNull);
          });
          test('Throws when graphql.isNonNull.create and create access control is set', async () => {
            const error = await getSchema({
              graphql: { isNonNull: { create: true } },
              access: { create: () => false },
            }).catch(x => x);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toEqual(
              `The field at Test.testField sets graphql.isNonNull.create: true, and has 'create' field access control, this is not allowed.\n` +
                `Either disable graphql.create.isNonNull, or disable 'create' field access control.`
            );
          });
        }

        test("Output field is nullable when graphql.isNonNull.read isn't set", async () => {
          const schema = await getSchema({});
          const outputType = assertObjectType(schema.getType('Test'));
          expect(outputType.getFields().testField.type).not.toBeInstanceOf(GraphQLNonNull);
        });
        test("Create field is nullable when graphql.isNonNull.create isn't set", async () => {
          const schema = await getSchema({});
          const createType = assertInputObjectType(schema.getType('TestCreateInput'));
          expect(createType.getFields().testField.type).not.toBeInstanceOf(GraphQLNonNull);
        });
      });
    });
  });
