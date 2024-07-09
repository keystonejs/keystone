import globby from 'globby'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { type KeystoneContext } from '@keystone-6/core/types'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import {
  dbProvider,
  expectSingleResolverError,
  expectValidationError
} from '../utils'

const testModules = globby.sync(`tests/api-tests/fields/types/fixtures/**/test-fixtures.{js,ts}`, {
  absolute: true,
})

for (const modulePath of testModules) {
  const mod = require(modulePath)
  if (mod.skipCrudTest) continue
  if (mod.unSupportedAdapterList?.includes(dbProvider)) continue

  for (const matrixValue of mod.testMatrix ?? ['default']) {
    const listKey = 'Test'
    const runner = setupTestRunner({
      config: {
        lists: {
          [listKey]: list({
            access: allowAll,
            fields: {
              name: text(),
              ...mod.getTestFields(matrixValue),
            },
          }),
        },
        ...mod.getRootConfig?.(matrixValue),
      },
    })

    const keystoneTestWrapper = (testFn: (args: any) => void = () => {}) =>
      runner(async ({ context, ...rest }) => {
        // populate the database before running the tests
        for (const data of mod.initItems(matrixValue, context)) {
          await context.query[listKey].createOne({ data })
        }
        return testFn({
          context,
          listKey,
          provider: dbProvider,
          matrixValue,
          ...rest,
        })
      })

    if (mod.crudTests) {
      describe(`${mod.name} - ${matrixValue} - Custom CRUD operations`, () => {
        beforeAll(() => {
          if (mod.beforeAll) {
            mod.beforeAll(matrixValue)
          }
        })
        afterEach(async () => {
          if (mod.afterEach) {
            await mod.afterEach(matrixValue)
          }
        })
        beforeEach(() => {
          if (mod.beforeEach) {
            mod.beforeEach(matrixValue)
          }
        })
        afterAll(async () => {
          if (mod.afterAll) {
            await mod.afterAll(matrixValue)
          }
        })
        mod.crudTests(keystoneTestWrapper)
      })
    }

    if (!mod.skipCommonCrudTest) {
      describe(`${mod.name} - ${matrixValue} - CRUD operations`, () => {
        beforeEach(() => {
          if (mod.beforeEach) {
            mod.beforeEach(matrixValue)
          }
        })
        beforeAll(() => {
          if (mod.beforeAll) {
            mod.beforeAll(matrixValue)
          }
        })
        afterEach(async () => {
          if (mod.afterEach) {
            await mod.afterEach(matrixValue)
          }
        })
        afterAll(async () => {
          if (mod.afterAll) {
            await mod.afterAll(matrixValue)
          }
        })

        const {
          fieldName,
          exampleValue,
          exampleValue2,
          subfieldName,
          createReturnedValue,
          updateReturnedValue,
          readFieldName,
        } = mod

        // Some field types can have subfields
        const query = subfieldName
          ? `id name ${readFieldName || fieldName} { ${subfieldName} }`
          : `id name ${readFieldName || fieldName}`

        const withHelpers = (
          wrappedFn: (args: {
            context: KeystoneContext
            listKey: string
            items: readonly Record<string, any>[]
          }) => void | Promise<void>
        ) => {
          return async ({ context, listKey }: { context: KeystoneContext, listKey: string }) => {
            const items = await context.query[listKey].findMany({
              orderBy: { name: 'asc' },
              query,
            })
            return wrappedFn({ context, listKey, items })
          }
        }

        // Individual field types can have CRUD constraints.
        // For example, password field can only be written but not read.
        if (!mod.skipCreateTest) {
          test(
            'Create',
            keystoneTestWrapper(
              withHelpers(async ({ context, listKey }) => {
                const data = await context.query[listKey].createOne({
                  data: { name: 'Newly created', [fieldName]: exampleValue(matrixValue) },
                  query,
                })
                expect(data).not.toBe(null)
                expect(subfieldName ? data[fieldName][subfieldName] : data[fieldName]).toEqual(
                  createReturnedValue ? createReturnedValue : exampleValue(matrixValue)
                )
              })
            )
          )
        }

        if (!mod.skipReadTest) {
          test(
            'Read',
            keystoneTestWrapper(
              withHelpers(async ({ context, listKey, items }) => {
                const data = await context.query[listKey].findOne({
                  where: { id: items[0].id },
                  query,
                })
                expect(data).not.toBe(null)
                expect(
                  subfieldName ? data?.[fieldName][subfieldName] : data?.[fieldName]
                ).toEqual(subfieldName ? items[0][fieldName][subfieldName] : items[0][fieldName])
              })
            )
          )
        }

        if (!mod.skipUpdateTest) {
          describe('Update', () => {
            test(
              'Updating the value',
              keystoneTestWrapper(
                withHelpers(async ({ context, items, listKey }) => {
                  const data = await context.query[listKey].updateOne({
                    where: { id: items[0].id },
                    data: { [fieldName]: exampleValue2(matrixValue) },
                    query,
                  })
                  expect(data).not.toBe(null)
                  expect(
                    subfieldName ? data?.[fieldName][subfieldName] : data?.[fieldName]
                  ).toEqual(
                    updateReturnedValue ? updateReturnedValue : exampleValue2(matrixValue)
                  )
                })
              )
            )

            test(
              'Updating the value to null',
              keystoneTestWrapper(
                withHelpers(async ({ context, items, listKey }) => {
                  const updateMutationName = `update${listKey}`
                  const _query = `mutation { ${updateMutationName}(where: { id: "${items[0].id}" }, data: { ${fieldName}: null }) { ${query} } }`
                  const { data, errors } = await context.graphql.raw({ query: _query })
                  if (mod.supportsNullInput) {
                    expect(data).toEqual({
                      [updateMutationName]: {
                        id: expect.any(String),
                        name: expect.any(String),
                        [fieldName]: null,
                      },
                    })
                    expect(errors).toBe(undefined)
                  } else {
                    expect(data).toEqual({ [updateMutationName]: null })
                    if (mod.neverNull) {
                      const message = `Input error: ${mod.name} fields cannot be set to null`
                      expectSingleResolverError(
                        errors,
                        updateMutationName,
                        `Test.${fieldName}`,
                        message
                      )
                    } else {
                      expectValidationError(errors, [
                        {
                          path: [updateMutationName],
                          messages: [`Test.${fieldName}: missing value`],
                        },
                      ])
                    }
                  }
                })
              )
            )

            test(
              'Updating without this field',
              keystoneTestWrapper(
                withHelpers(async ({ context, items, listKey }) => {
                  const data = await context.query[listKey].updateOne({
                    where: { id: items[0].id },
                    data: { name: 'Updated value' },
                    query,
                  })
                  expect(data).not.toBe(null)
                  expect(data!.name).toBe('Updated value')
                  expect(
                    subfieldName ? data?.[fieldName][subfieldName] : data?.[fieldName]
                  ).toEqual(
                    subfieldName ? items[0][fieldName][subfieldName] : items[0][fieldName]
                  )
                })
              )
            )
          })
        }

        if (!mod.skipDeleteTest) {
          test(
            'Delete',
            keystoneTestWrapper(
              withHelpers(async ({ context, items, listKey }) => {
                const data = await context.query[listKey].deleteOne({
                  where: { id: items[0].id },
                  query,
                })
                expect(data).not.toBe(null)
                expect(data!.name).toBe(items[0].name)
                expect(
                  subfieldName ? data?.[fieldName][subfieldName] : data?.[fieldName]
                ).toEqual(subfieldName ? items[0][fieldName][subfieldName] : items[0][fieldName])

                const allItems = await context.query[listKey].findMany({ query })
                expect(allItems).toEqual(expect.not.arrayContaining([data]))
              })
            )
          )
        }
      })
    }
  }
}
