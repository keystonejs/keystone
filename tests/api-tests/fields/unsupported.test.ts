import path from 'path';
import globby from 'globby';
import {
  multiAdapterRunners,
  setupFromConfig,
  setupServer,
  testConfig,
} from '@keystone-next/test-utils-legacy';
import { createSchema, list } from '@keystone-next/keystone/schema';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
testModules.push(path.resolve('packages/fields/tests/test-fixtures.js'));

multiAdapterRunners().map(({ adapterName, after }) => {
  const unsupportedModules = testModules
    .map(require)
    .filter(({ unSupportedAdapterList = [] }) => unSupportedAdapterList.includes(adapterName));
  if (unsupportedModules.length > 0) {
    describe(`${adapterName} adapter`, () => {
      unsupportedModules.forEach(mod => {
        (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
          const listKey = 'Test';

          describe(`${mod.name} - Unsupported field type`, () => {
            beforeAll(() => {
              if (mod.beforeAll) {
                mod.beforeAll();
              }
            });
            afterAll(async () => {
              if (mod.afterAll) {
                await mod.afterAll();
              }
              // We expect setup to fail, so disconnect can be a noop
              await after({ disconnect: () => {} });
            });

            test('Throws', async () => {
              if (!mod.newInterfaces) throw new Error('Old interfaces no longer supportes');

              await expect(async () =>
                mod.newInterfaces
                  ? setupFromConfig({
                      adapterName,
                      config: testConfig({
                        lists: createSchema({
                          [listKey]: list({ fields: mod.getTestFields(matrixValue) }),
                        }),
                      }),
                    })
                  : setupServer({
                      adapterName,
                      createLists: (keystone: any) => {
                        // Create a list with all the fields required for testing
                        keystone.createList(listKey, { fields: mod.getTestFields(matrixValue) });
                      },
                    })
              ).rejects.toThrow(Error);
            });
          });
        });
      });
    });
  } else {
    // Appease jest, which doesn't like it when you have an empty test file.
    test('noop', () => {});
  }
});
