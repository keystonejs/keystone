const { multiAdapterRunners, setupFromConfig } = require('@keystonejs/test-utils');
import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';

function setupKeystone(adapterName) {
  return setupFromConfig({
    adapterName,
    config: createSchema({ lists: { User: list({ fields: { name: text() } }) } }),
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
