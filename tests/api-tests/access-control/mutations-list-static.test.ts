import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        // Imperative -> Static access control
        User: list({
          fields: { name: text() },
          access: {
            read: true,
            create: ({ originalInput }) => {
              return originalInput.name !== 'bad';
            },
            update: ({ originalInput }) => {
              return originalInput.name !== 'bad';
            },
            delete: async ({ context, itemId }) => {
              const item = await context.lists.User.findOne({
                where: { id: itemId as string },
                query: 'id name',
              });
              return item.name.startsWith('no delete');
            },
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('Access control - Imperative => static', () => {
      test(
        'createOne',
        runner(setupKeystone, async ({ context }) => {
          context = context.exitSudo();
          // Valid name should pass
          await context.lists.User.createOne({ data: { name: 'good' } });

          // Invalid name
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($data: UserCreateInput) { createUser(data: $data) { id } }`,
            variables: { data: { name: 'bad' } },
          });

          // Returns null and throws an error
          expect(data!.createUser).toBe(null);
          expect(errors).toHaveLength(1);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['createUser']);

          // Only the original user should exist
          const _users = await context.lists.User.findMany({ query: 'id name' });
          expect(_users.map(({ name }) => name)).toEqual(['good']);
        })
      );

      test(
        'updateOne',
        runner(setupKeystone, async ({ context }) => {
          context = context.exitSudo();
          // Valid name should pass
          const user = await context.lists.User.createOne({ data: { name: 'good' } });
          await context.lists.User.updateOne({ id: user.id, data: { name: 'better' } });

          // Invalid name
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($id: ID! $data: UserUpdateInput) { updateUser(id: $id data: $data) { id } }`,
            variables: { id: user.id, data: { name: 'bad' } },
          });

          // Returns null and throws an error
          expect(data!.updateUser).toBe(null);
          expect(errors).toHaveLength(1);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['updateUser']);

          // User should have its original name
          const _users = await context.lists.User.findMany({ query: 'id name' });
          expect(_users.map(({ name }) => name)).toEqual(['better']);
        })
      );

      test(
        'deleteOne',
        runner(setupKeystone, async ({ context }) => {
          context = context.exitSudo();
          // Valid names should pass
          const user1 = await context.lists.User.createOne({ data: { name: 'good' } });
          const user2 = await context.lists.User.createOne({ data: { name: 'no delete' } });
          await context.lists.User.deleteOne({ id: user1.id });

          // Invalid name
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($id: ID!) { deleteUser(id: $id) { id } }`,
            variables: { id: user2.id },
          });

          // Returns null and throws an error
          expect(data!.deleteUser).toBe(null);
          expect(errors).toHaveLength(1);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['deleteUser']);

          // Bad users should still be in the database.
          const _users = await context.lists.User.findMany({ query: 'id name' });
          expect(_users.map(({ name }) => name)).toEqual(['no delete']);
        })
      );

      test(
        'createMany',
        runner(setupKeystone, async ({ context }) => {
          context = context.exitSudo();
          // Mix of good and bad names
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($data: [UsersCreateInput]) { createUsers(data: $data) { id name } }`,
            variables: {
              data: [
                { data: { name: 'good 1' } },
                { data: { name: 'bad' } },
                { data: { name: 'good 2' } },
                { data: { name: 'bad' } },
                { data: { name: 'good 3' } },
              ],
            },
          });

          // If one item errors, they all error, so they all return null
          expect(data!.createUsers).toEqual([null, null, null, null, null]);

          // Error messages for each item
          expect(errors).toHaveLength(5);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['createUsers', 0]);
          expect(errors![1].message).toEqual('You do not have access to this resource');
          expect(errors![1].path).toEqual(['createUsers', 1]);
          expect(errors![2].message).toEqual('You do not have access to this resource');
          expect(errors![2].path).toEqual(['createUsers', 2]);
          expect(errors![3].message).toEqual('You do not have access to this resource');
          expect(errors![3].path).toEqual(['createUsers', 3]);
          expect(errors![4].message).toEqual('You do not have access to this resource');
          expect(errors![4].path).toEqual(['createUsers', 4]);

          // No users should exist in the database
          const users = await context.lists.User.findMany();
          expect(users).toEqual([]);
        })
      );

      test(
        'updateMany',
        runner(setupKeystone, async ({ context }) => {
          context = context.exitSudo();
          // Start with some users
          const users = await context.lists.User.createMany({
            data: [
              { data: { name: 'good 1' } },
              { data: { name: 'good 2' } },
              { data: { name: 'good 3' } },
              { data: { name: 'good 4' } },
              { data: { name: 'good 5' } },
            ],
            query: 'id name',
          });

          // Mix of good and bad names
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($data: [UsersUpdateInput]) { updateUsers(data: $data) { id name } }`,
            variables: {
              data: [
                { id: users[0].id, data: { name: 'still good 1' } },
                { id: users[1].id, data: { name: 'bad' } },
                { id: users[2].id, data: { name: 'still good 3' } },
                { id: users[3].id, data: { name: 'bad' } },
              ],
            },
          });

          // If one item errors, they all error, so they all return null
          expect(data!.updateUsers).toEqual([null, null, null, null]);

          // Error messages for each item
          expect(errors).toHaveLength(4);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['updateUsers', 0]);
          expect(errors![1].message).toEqual('You do not have access to this resource');
          expect(errors![1].path).toEqual(['updateUsers', 1]);
          expect(errors![2].message).toEqual('You do not have access to this resource');
          expect(errors![2].path).toEqual(['updateUsers', 2]);
          expect(errors![3].message).toEqual('You do not have access to this resource');
          expect(errors![3].path).toEqual(['updateUsers', 3]);

          // All users should still exist in the database
          const _users = await context.lists.User.findMany({
            orderBy: { name: 'asc' },
            query: 'id name',
          });
          expect(_users.map(({ name }) => name)).toEqual([
            'good 1',
            'good 2',
            'good 3',
            'good 4',
            'good 5',
          ]);
        })
      );

      test(
        'deleteMany',
        runner(setupKeystone, async ({ context }) => {
          context = context.exitSudo();
          // Start with some users
          const users = await context.lists.User.createMany({
            data: [
              { data: { name: 'good 1' } },
              { data: { name: 'no delete 1' } },
              { data: { name: 'good 3' } },
              { data: { name: 'no delete 2' } },
              { data: { name: 'good 5' } },
            ],
            query: 'id name',
          });

          // Mix of good and bad names
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($ids: [ID!]) { deleteUsers(ids: $ids) { id name } }`,
            variables: { ids: [users[0].id, users[1].id, users[2].id, users[3].id] },
          });

          // If one item errors, they all error, so they all return null
          expect(data!.deleteUsers).toEqual([null, null, null, null]);

          // Error messages for each item
          expect(errors).toHaveLength(4);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['deleteUsers', 0]);
          expect(errors![1].message).toEqual('You do not have access to this resource');
          expect(errors![1].path).toEqual(['deleteUsers', 1]);
          expect(errors![2].message).toEqual('You do not have access to this resource');
          expect(errors![2].path).toEqual(['deleteUsers', 2]);
          expect(errors![3].message).toEqual('You do not have access to this resource');
          expect(errors![3].path).toEqual(['deleteUsers', 3]);

          // All users should still exist in the database
          const _users = await context.lists.User.findMany({
            orderBy: { name: 'asc' },
            query: 'id name',
          });
          expect(_users.map(({ name }) => name)).toEqual([
            'good 1',
            'good 3',
            'good 5',
            'no delete 1',
            'no delete 2',
          ]);
        })
      );
    });
  })
);
