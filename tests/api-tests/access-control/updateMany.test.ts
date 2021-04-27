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
            { data: { name: 'Jess', isUpdatable: true } },
            { data: { name: 'Johanna', isUpdatable: false } },
            { data: { name: 'Sam', isUpdatable: true } },
            { data: { name: 'Theo', isUpdatable: false } },
          ],
        })) as { id: any }[];
        // Attempt to update all four items
        const data = await context.exitSudo().graphql.run({
          query: `mutation ($data: [UsersUpdateInput]){
              updateUsers(data: $data) { id name isUpdatable }
            }`,
          variables: { data: users.map(({ id }) => ({ id, data: { name: 'new name' } })) },
        });
        // We don't expect an error, but only two of the items should get updated and returned
        expect(data.updateUsers).toHaveLength(2);
        expect(data.updateUsers[0].name).toEqual('new name');
        expect(data.updateUsers[1].name).toEqual('new name');
      })
    );
  })
);
