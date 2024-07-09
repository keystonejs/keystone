import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import globby from 'globby'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import {
  dbProvider,
  expectValidationError
} from '../utils'

const testModules = globby.sync(`tests/api-tests/fields/types/fixtures/**/test-fixtures.{js,ts}`, {
  absolute: true,
})

for (const modulePath of testModules) {
  const mod = require(modulePath)
  if (mod.skipRequiredTest) continue
  if (mod.unSupportedAdapterList?.includes(dbProvider)) continue

  for (const matrixValue of mod.testMatrix ?? ['default']) {
    describe(`${mod.name} - ${matrixValue} - isRequired`, () => {
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

      const fieldConfig = mod.fieldConfig?.(matrixValue) ?? {}
      const runner = setupTestRunner({
        config: {
          lists: {
            Test: list({
              access: allowAll,
              fields: {
                name: text(),
                testField: mod.typeFunction({
                  ...(mod.nonNullableDefault ? {
                    db: {
                      isNullable: true
                    }
                  } : {}),
                  ...fieldConfig,
                  validation: {
                    ...fieldConfig.validation,
                    isRequired: true,
                  },
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
        },
      })

      const messages = [`Test.testField: missing value`]

      test(
        'Create an object without the required field',
        runner(async ({ context }) => {
          const { data, errors } = await context.graphql.raw({
            query: `
              mutation {
                createTest(data: { name: "test entry" } ) { id }
              }`,
          })
          expect(data).toEqual({ createTest: null })
          expectValidationError(errors, [
            {
              path: ['createTest'],
              messages,
            },
          ])
        })
      )

      test(
        'Create an object with an explicit null value',
        runner(async ({ context }) => {
          const { data, errors } = await context.graphql.raw({
            query: `
              mutation {
                createTest(data: { name: "test entry", testField: null } ) { id }
              }`,
          })
          expect(data).toEqual({ createTest: null })
          expectValidationError(errors, [
            {
              path: ['createTest'],
              messages,
            },
          ])
        })
      )

      test(
        'Update an object with the required field having a null value',
        runner(async ({ context }) => {
          const data0 = await context.db.Test.createOne({
            data: {
              name: 'test entry',
              testField: mod.exampleValue(matrixValue),
            },
          })
          const { data, errors } = await context.graphql.raw({
            query: `
              mutation {
                updateTest(
                  where: {
                    id: "${data0.id}"
                  },
                  data: {
                    name: "updated test entry",
                    testField: null
                  }
                ) {
                  id
                }
              }`,
          })
          expect(data).toEqual({ updateTest: null })
          expectValidationError(errors, [
            {
              path: ['updateTest'],
              messages,
            },
          ])
        })
      )

      test(
        'Update an object without the required field',
        runner(async ({ context }) => {
          const data0 = await context.query.Test.createOne({
            data: {
              name: 'test entry',
              testField: mod.exampleValue(matrixValue),
            },
          })
          const data = await context.query.Test.updateOne({
            where: { id: data0.id },
            data: { name: 'updated test entry' },
            query: 'id name',
          })
          expect(data).not.toBe(null)
          expect(data.name).toEqual('updated test entry')
        })
      )
    })
  }
}
