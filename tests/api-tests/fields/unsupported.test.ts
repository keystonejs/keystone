import globby from 'globby'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { setupTestEnv } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { dbProvider } from '../utils'

const testModules = globby.sync(`tests/api-tests/fields/types/fixtures/**/test-fixtures.{js,ts}`, {
  absolute: true,
})

const unsupportedModules = testModules
  .map(require)
  .filter(({ unSupportedAdapterList = [] }) => unSupportedAdapterList.includes(dbProvider))
if (unsupportedModules.length > 0) {
  unsupportedModules.forEach(mod => {
    ;(mod.testMatrix ?? ['default']).forEach((matrixValue: string) => {
      const listKey = 'Test'

      describe(`${mod.name} - Unsupported field type`, () => {
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

        test('Throws', async () => {
          await expect(
            async () =>
              await setupTestEnv({
                lists: {
                  [listKey]: list({
                    access: allowAll,
                    fields: { name: text(), ...mod.getTestFields(matrixValue) },
                  }),
                },
              })
          ).rejects.toThrow(Error)
        })
      })
    })
  })
} else {
  // Appease jest, which doesn't like it when you have an empty test file.
  test('noop', () => {})
}
