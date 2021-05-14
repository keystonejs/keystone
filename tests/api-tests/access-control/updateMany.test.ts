import { text, checkbox } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import type { ProviderName } from '@keystone-next/test-utils-legacy';

const setupKeystone = (provider: ProviderName) =>
  setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            name: text(),
            isUpdatable: checkbox(),
          },
          access: {
            create: true,
            read: true,
            update: { isUpdatable: true },
            delete: true,
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    test(
      'updateMany with declarative access control',
      runner(setupKeystone, async ({ context }) => {
        // Create some items, half of which have `isUpdatable: true`
        const users = (await context.lists.User.createMany({
          data: [
            { name: 'Jess', isUpdatable: true },
            { name: 'Johanna', isUpdatable: false },
            { name: 'Sam', isUpdatable: true },
            { name: 'Theo', isUpdatable: false },
          ],
        })) as { id: any }[];
        // Attempt to update all four items
        const _users = await context.exitSudo().lists.User.updateMany({
          data: users.map(({ id }) => ({ where: { id }, data: { name: 'new name' } })),
          query: 'id name isUpdatable',
        });
        // We don't expect an error, but only two of the items should get updated and returned
        expect(_users).toHaveLength(2);
        expect(_users[0].name).toEqual('new name');
        expect(_users[1].name).toEqual('new name');
      })
    );
  })
);
