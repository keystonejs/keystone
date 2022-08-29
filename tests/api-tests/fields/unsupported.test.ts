import fs from 'fs';
import path from 'path';
import os from 'os';
import globby from 'globby';
import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { setupTestEnv } from '@keystone-6/core/testing';
import { apiTestConfig } from '../utils';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});

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

        test('Throws', async () => {
          await expect(
            async () =>
              await setupTestEnv({
                config: apiTestConfig({
                  models: {
                    [listKey]: list({
                      fields: { name: text(), ...mod.getTestFields(matrixValue) },
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
          ).rejects.toThrow(Error);
        });
      });
    });
  });
} else {
  // Appease jest, which doesn't like it when you have an empty test file.
  test('noop', () => {});
}
