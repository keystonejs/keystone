import path from 'path';
import globby from 'globby';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestEnv } from '@keystone-next/testing';
import { apiTestConfig } from '../utils';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
testModules.push(path.resolve('packages-next/fields/src/tests/test-fixtures.ts'));

const unsupportedModules = testModules
  .map(require)
  .filter(({ unSupportedAdapterList = [] }) =>
    unSupportedAdapterList.includes(process.env.TEST_ADAPTER)
  );
if (unsupportedModules.length > 0) {
  unsupportedModules.forEach(mod => {
    (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
      const listKey = 'Test';

      describe(`${mod.name} - Unsupported field type`, () => {
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

        test('Throws', async () => {
          await expect(
            async () =>
              await setupTestEnv({
                config: apiTestConfig({
                  lists: createSchema({
                    [listKey]: list({ fields: mod.getTestFields(matrixValue) }),
                  }),
                  images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
                  files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
                }),
              })
          ).rejects.toThrow(Error);
        });
      });
    });
  });
} else {
  // Appease jest, which doesn't like it when you have an empty test file.
  test('noop', () => {});
}
