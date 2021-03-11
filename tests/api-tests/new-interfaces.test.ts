import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';
import type { AdapterName } from '@keystone-next/test-utils-legacy';

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({ lists: createSchema({ User: list({ fields: { name: text() } }) }) }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    test(
      'Smoke test',
      runner(setupKeystone, async ({ context }) => {
        const users = await context.lists.User.findMany({ resolveFields: false });
        expect(users).toEqual([]);
      })
    );
  })
);
