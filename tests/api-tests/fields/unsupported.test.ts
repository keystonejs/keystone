import path from 'path';
import globby from 'globby';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { BaseKeystone } from '@keystone-next/types';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
testModules.push(path.resolve('packages-next/fields/src/tests/test-fixtures.ts'));

multiAdapterRunners().map(({ provider, after }) => {
  const unsupportedModules = testModules
    .map(require)
    .filter(({ unSupportedAdapterList = [] }) => unSupportedAdapterList.includes(provider));
  if (unsupportedModules.length > 0) {
    describe(`${provider} provider`, () => {
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
              await after({ disconnect: async () => {} } as BaseKeystone);
            });

            test('Throws', async () => {
              await expect(async () =>
                setupFromConfig({
                  provider,
                  config: testConfig({
                    lists: createSchema({
                      [listKey]: list({ fields: mod.getTestFields(matrixValue) }),
                    }),
                  }),
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
