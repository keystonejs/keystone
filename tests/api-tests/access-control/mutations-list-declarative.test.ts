import { testConfig } from '@keystone-next/test-utils-legacy';
import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import { DatabaseProvider } from '@keystone-next/types';

function setupKeystone(provider: DatabaseProvider) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        // Imperative -> Declarative access control
        User: list({
          fields: { name: text() },
          access: {
            read: true,
            create: true,
            update: () => ({ name_not: 'bad' }),
            delete: async () => ({ name_not_contains: 'no delete' }),
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('Access control - Imperative => declarative', () => {
      test(
        'updateOne',
        runner(setupKeystone, async ({ context }) => {
          context = context.exitSudo();
          // Valid name should pass
          const user = await context.lists.User.createOne({ data: { name: 'good' } });
          await context.lists.User.updateOne({ id: user.id, data: { name: 'better' } });

          // Setting up a bad name
          await context.lists.User.updateOne({ id: user.id, data: { name: 'bad' } });

          // Now it has a bad name, we can't update it.
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($id: ID! $data: UserUpdateInput) { updateUser(id: $id data: $data) { id } }`,
            variables: { id: user.id, data: { name: 'good' } },
          });

          // Returns null and throws an error
          expect(data!.updateUser).toBe(null);
          expect(errors).toHaveLength(1);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['updateUser']);

          // User should have its original name
          const _users = await context.lists.User.findMany({ query: 'id name' });
          expect(_users.map(({ name }) => name)).toEqual(['bad']);
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

          // Set up some of them with bad names
          await context.lists.User.updateMany({
            data: [
              { id: users[1].id, data: { name: 'bad' } },
              { id: users[3].id, data: { name: 'bad' } },
            ],
          });

          // Mix of good and bad names
          const { data, errors } = await context.graphql.raw({
            query: `mutation ($data: [UsersUpdateInput]) { updateUsers(data: $data) { id name } }`,
            variables: {
              data: [
                { id: users[0].id, data: { name: 'still good 1' } },
                { id: users[1].id, data: { name: 'good' } },
                { id: users[2].id, data: { name: 'still good 3' } },
                { id: users[3].id, data: { name: 'good' } },
              ],
            },
          });

          // Valid users are returned, invalid come back as null
          expect(data!.updateUsers).toHaveLength(4);
          expect(data!.updateUsers[0].name).toEqual('still good 1');
          expect(data!.updateUsers[1]).toBe(null);
          expect(data!.updateUsers[2].name).toEqual('still good 3');
          expect(data!.updateUsers[3]).toBe(null);
          // The invalid updates should have errors which point to the nulls in their path
          expect(errors).toHaveLength(2);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['updateUsers', 1]);
          expect(errors![1].message).toEqual('You do not have access to this resource');
          expect(errors![1].path).toEqual(['updateUsers', 3]);

          // All users should still exist in the database
          const _users = await context.lists.User.findMany({
            orderBy: { name: 'asc' },
            query: 'id name',
          });
          expect(_users.map(({ name }) => name)).toEqual([
            'bad',
            'bad',
            'good 5',
            'still good 1',
            'still good 3',
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

          // Valid users are returned, invalid come back as null
          expect(data!.deleteUsers).toHaveLength(4);
          expect(data!.deleteUsers[0].name).toEqual('good 1');
          expect(data!.deleteUsers[1]).toBe(null);
          expect(data!.deleteUsers[2].name).toEqual('good 3');
          expect(data!.deleteUsers[3]).toBe(null);
          // The invalid deletes should have errors which point to the nulls in their path
          expect(errors).toHaveLength(2);
          expect(errors![0].message).toEqual('You do not have access to this resource');
          expect(errors![0].path).toEqual(['deleteUsers', 1]);

          expect(errors![1].message).toEqual('You do not have access to this resource');
          expect(errors![1].path).toEqual(['deleteUsers', 3]);

          // Three users should still exist in the database
          const _users = await context.lists.User.findMany({
            orderBy: { name: 'asc' },
            query: 'id name',
          });
          expect(_users.map(({ name }) => name)).toEqual(['good 5', 'no delete 1', 'no delete 2']);
        })
      );
    });
  })
);
