import path from 'path';
import globby from 'globby';
import { multiAdapterRunners, setupServer } from '@keystone-next/test-utils-legacy';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.js`, {
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

            test('Delete', async () => {
              const createLists = (keystone: any) => {
                // Create a list with all the fields required for testing
                keystone.createList(listKey, { fields: mod.getTestFields(matrixValue) });
              };
              await expect(async () => setupServer({ adapterName, createLists })).rejects.toThrow(
                Error
              );
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
