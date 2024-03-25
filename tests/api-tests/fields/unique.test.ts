import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import globby from 'globby'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { setupTestEnv, setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { dbProvider } from '../utils'

const testModules = globby.sync(`tests/api-tests/fields/types/fixtures/**/test-fixtures.{js,ts}`, {
  absolute: true,
})

for (const modulePath of testModules) {
  const mod = require(modulePath)
  if (mod.skipUniqueTest) continue
  if (!mod.supportsUnique) continue
  if (mod.unSupportedAdapterList?.includes(dbProvider)) continue

  for (const matrixValue of mod.testMatrix ?? ['default']) {
    describe(`${mod.name} (${matrixValue}, isIndexed: 'unique')`, () => {
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
      const runner = setupTestRunner({
        config: ({
          lists: {
            Test: list({
              access: allowAll,
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
      })
      test(
        'uniqueness is enforced over multiple mutations',
        runner(async ({ context }) => {
          await context.query.Test.createOne({
            data: { testField: mod.exampleValue(matrixValue) },
          })

          const { data, errors } = await context.graphql.raw({
            query: `
                mutation($data: TestCreateInput!) {
                  createTest(data: $data) { id }
                }
              `,
            variables: { data: { testField: mod.exampleValue(matrixValue) } },
          })
          expect(data).toEqual({ createTest: null })
          for (const error of errors ?? []) {
            expect(error.message).toEqual(expect.stringContaining('Unique constraint failed'))
          }
        })
      )

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
          })

          expect(data).toEqual({ foo: { id: expect.any(String) }, bar: null })
          for (const error of errors ?? []) {
            expect(error.message).toEqual(expect.stringContaining('Unique constraint failed'))
          }
        })
      )

      test(
        'Configuring uniqueness on one field does not affect others',
        runner(async ({ context }) => {
          const items = await context.query.Test.createMany({
            data: [
              { testField: mod.exampleValue(matrixValue), name: 'jess' },
              { testField: mod.exampleValue2(matrixValue), name: 'jess' },
            ],
          })
          expect(items).toHaveLength(2)
        })
      )
    })
  }
}

for (const modulePath of testModules) {
  const mod = require(modulePath)
  if (mod.skipUniqueTest) continue
  if (mod.supportsUnique) continue
  if (mod.unSupportedAdapterList?.includes(dbProvider)) continue

  for (const matrixValue of mod.testMatrix ?? ['default']) {
    describe(`${mod.name} (${matrixValue}, isIndexed: 'unique')`, () => {
      test('Ensure non-supporting fields throw an error', async () => {
        // Try to create a thing and have it fail
        let erroredOut = false
        try {
          await setupTestEnv({
            config: ({
              lists: {
                Test: list({
                  access: allowAll,
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
          })
        } catch (error: any) {
          expect(error.message).toMatch(
            "isIndexed: 'unique' is not a supported option for field type"
          )
          erroredOut = true
        }
        expect(erroredOut).toEqual(true)
      })
    })
  }
}
