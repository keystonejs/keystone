import globby from 'globby'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

import { assertInputObjectType, assertObjectType, GraphQLNonNull } from 'graphql'

import { setupTestEnv } from '../test-runner'
import { dbProvider } from '../utils'

type TextFieldConfig = Parameters<typeof text>[0]

const testModules = globby.sync(`tests/api-tests/fields/types/fixtures/**/test-fixtures.{js,ts}`, {
  absolute: true,
})

testModules
  .map(require)
  .filter(
    ({ unSupportedAdapterList = [], name }) =>
      name !== 'ID' && !unSupportedAdapterList.includes(dbProvider)
  )
  .forEach(mod => {
    ;(mod.testMatrix ?? ['default']).forEach((matrixValue: string) => {
      describe(`${mod.name} - ${matrixValue} - graphql.isNonNull`, () => {
        beforeEach(() => {
          if (mod.beforeEach) {
            mod.beforeEach(matrixValue)
          }
        })
        afterEach(async () => {
          if (mod.afterEach) {
            await mod.afterEach(matrixValue)
          }
        })
        beforeAll(() => {
          if (mod.beforeAll) {
            mod.beforeAll(matrixValue)
          }
        })
        afterAll(async () => {
          if (mod.afterAll) {
            await mod.afterAll(matrixValue)
          }
        })

        const getSchema = async (fieldConfig: TextFieldConfig) => {
          const { context } = await setupTestEnv({
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
          })
          return context.graphql.schema
        }

        if (mod.supportsGraphQLIsNonNull) {
          test('Sets the output field as non-null when graphql.isNonNull.read is set', async () => {
            const schema = await getSchema({ graphql: { isNonNull: { read: true } } })

            const outputType = assertObjectType(schema.getType('Test'))
            expect(outputType.getFields().testField.type).toBeInstanceOf(GraphQLNonNull)
          })
          test('Throws when graphql.isNonNull.read and read access control is set', async () => {
            const error = await getSchema({
              graphql: { isNonNull: { read: true } },
              access: { read: () => false },
            }).catch(x => x)
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toEqual(
              `The field at Test.testField sets graphql.isNonNull.read: true, and has 'read' field access control, this is not allowed.\n` +
                `Either disable graphql.read.isNonNull, or disable 'read' field access control.`
            )
          })
          test('Sets the create field as non-null when graphql.isNonNull.create is set', async () => {
            const schema = await getSchema({ graphql: { isNonNull: { create: true } } })
            const createType = assertInputObjectType(schema.getType('TestCreateInput'))
            expect(createType.getFields().testField.type).toBeInstanceOf(GraphQLNonNull)
          })
        }

        test("Output field is nullable when graphql.isNonNull.read isn't set", async () => {
          const schema = await getSchema({})
          const outputType = assertObjectType(schema.getType('Test'))
          expect(outputType.getFields().testField.type).not.toBeInstanceOf(GraphQLNonNull)
        })
        test("Create field is nullable when graphql.isNonNull.create isn't set", async () => {
          const schema = await getSchema({})
          const createType = assertInputObjectType(schema.getType('TestCreateInput'))
          expect(createType.getFields().testField.type).not.toBeInstanceOf(GraphQLNonNull)
        })
      })
    })
  })
