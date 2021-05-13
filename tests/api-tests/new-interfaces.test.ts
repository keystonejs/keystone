import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';
import type { ProviderName } from '@keystone-next/test-utils-legacy';

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({ fields: { name: text() } }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    test(
      'Smoke test',
      runner(setupKeystone, async ({ context }) => {
        const users = await context.db.lists.User.findMany({});
        expect(users).toEqual([]);
      })
    );
  })
);
