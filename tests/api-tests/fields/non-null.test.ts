import globby from 'globby';
import { list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';
import { setupTestEnv } from '@keystone-next/keystone/testing';
import { assertInputObjectType, assertObjectType, GraphQLNonNull } from 'graphql';
import { apiTestConfig } from '../utils';

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

        const getSchema = async (fieldConfig: any) => {
          const { testArgs } = await setupTestEnv({
            config: apiTestConfig({
              lists: {
                Test: list({
                  fields: {
                    name: text(),
                    testField: mod.typeFunction({
                      ...(mod.fieldConfig ? mod.fieldConfig(matrixValue) : {}),
                      ...fieldConfig,
                    }),
                  },
                }),
              },
              images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
              files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
            }),
          });
          return testArgs.context.graphql.schema;
        };

        if (mod.supportsGraphQLIsNonNull) {
          test('Sets the output field as non-null when graphql.read.isNonNull is set', async () => {
            const schema = await getSchema({ graphql: { read: { isNonNull: true } } });
            const outputType = assertObjectType(schema.getType('Test'));
            expect(outputType.getFields().testField.type).toBeInstanceOf(GraphQLNonNull);
          });
          test('Throws when graphql.read.isNonNull and read access control is set', async () => {
            const error = await getSchema({
              graphql: { read: { isNonNull: true } },
              access: { read: () => false },
            }).catch(x => x);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toEqual(
              `The field at Test.testField sets graphql.read.isNonNull: true and has read access control, this is not allowed.\n` +
                `Either disable graphql.read.isNonNull or read access control.`
            );
          });
          test('Sets the create field as non-null when graphql.create.isNonNull is set', async () => {
            const schema = await getSchema({ graphql: { create: { isNonNull: true } } });
            const createType = assertInputObjectType(schema.getType('TestCreateInput'));
            expect(createType.getFields().testField.type).toBeInstanceOf(GraphQLNonNull);
          });
          test('Throws when graphql.create.isNonNull and create access control is set', async () => {
            const error = await getSchema({
              graphql: { create: { isNonNull: true } },
              access: { create: () => false },
            }).catch(x => x);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toEqual(
              `The field at Test.testField sets graphql.create.isNonNull: true and has create access control, this is not allowed.\n` +
                `Either disable graphql.create.isNonNull or create access control.`
            );
          });
        }

        test("Output field is nullable when graphql.read.isNonNull isn't set", async () => {
          const schema = await getSchema({});
          const outputType = assertObjectType(schema.getType('Test'));
          expect(outputType.getFields().testField.type).not.toBeInstanceOf(GraphQLNonNull);
        });
        test("Create field is nullable when graphql.create.isNonNull isn't set", async () => {
          const schema = await getSchema({});
          const createType = assertInputObjectType(schema.getType('TestCreateInput'));
          expect(createType.getFields().testField.type).not.toBeInstanceOf(GraphQLNonNull);
        });
      });
    });
  });
