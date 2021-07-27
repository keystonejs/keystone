import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig, expectAccessDenied } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
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
            return !item.name.startsWith('no delete');
          },
        },
      }),
    }),
  }),
});

describe('Access control - Imperative => static', () => {
  test(
    'createOne',
    runner(async ({ context }) => {
      context = context.exitSudo();
      // Valid name should pass
      await context.lists.User.createOne({ data: { name: 'good' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput) { createUser(data: $data) { id } }`,
        variables: { data: { name: 'bad' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      expectAccessDenied(errors, [{ path: ['createUser'] }]);

      // Only the original user should exist
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['good']);
    })
  );

  test(
    'updateOne',
    runner(async ({ context }) => {
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
      expect(data).toEqual({ updateUser: null });
      expectAccessDenied(errors, [{ path: ['updateUser'] }]);

      // User should have its original name
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['better']);
    })
  );

  test(
    'deleteOne',
    runner(async ({ context }) => {
      context = context.exitSudo();
      // Valid names should pass
      const user1 = await context.lists.User.createOne({ data: { name: 'good' } });
      const user2 = await context.lists.User.createOne({ data: { name: 'no delete' } });
      await context.lists.User.deleteOne({ where: { id: user1.id } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID!) { deleteUser(id: $id) { id } }`,
        variables: { id: user2.id },
      });

      // Returns null and throws an error
      expect(data).toEqual({ deleteUser: null });
      expectAccessDenied(errors, [{ path: ['deleteUser'] }]);

      // Bad users should still be in the database.
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['no delete']);
    })
  );

  test(
    'createMany',
    runner(async ({ context }) => {
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

      // Valid users are returned, invalid come back as null
      expect(data).toEqual({
        createUsers: [
          { id: expect.any(String), name: 'good 1' },
          null,
          { id: expect.any(String), name: 'good 2' },
          null,
          { id: expect.any(String), name: 'good 3' },
        ],
      });

      // The invalid updates should have errors which point to the nulls in their path
      expectAccessDenied(errors, [{ path: ['createUsers', 1] }, { path: ['createUsers', 3] }]);

      // The good users should exist in the database
      const users = await context.lists.User.findMany();
      // the ordering isn't consistent so we order them ourselves here
      expect(users.map(x => x.id).sort()).toEqual(
        [data!.createUsers[0].id, data!.createUsers[2].id, data!.createUsers[4].id].sort()
      );
    })
  );

  test(
    'updateMany',
    runner(async ({ context }) => {
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
        query: `mutation ($data: [UserUpdateArgs]) { updateUsers(data: $data) { id name } }`,
        variables: {
          data: [
            { id: users[0].id, data: { name: 'still good 1' } },
            { id: users[1].id, data: { name: 'bad' } },
            { id: users[2].id, data: { name: 'still good 3' } },
            { id: users[3].id, data: { name: 'bad' } },
          ],
        },
      });

      // Valid users are returned, invalid come back as null
      expect(data!.updateUsers).toEqual([
        { id: users[0].id, name: 'still good 1' },
        null,
        { id: users[2].id, name: 'still good 3' },
        null,
      ]);

      // The invalid updates should have errors which point to the nulls in their path
      expectAccessDenied(errors, [{ path: ['updateUsers', 1] }, { path: ['updateUsers', 3] }]);

      // All users should still exist in the database
      const _users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(_users.map(({ name }) => name)).toEqual([
        'good 2',
        'good 4',
        'good 5',
        'still good 1',
        'still good 3',
      ]);
    })
  );

  test(
    'deleteMany',
    runner(async ({ context }) => {
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
      expect(data!.deleteUsers).toEqual([
        { id: users[0].id, name: 'good 1' },
        null,
        { id: users[2].id, name: 'good 3' },
        null,
      ]);

      // The invalid updates should have errors which point to the nulls in their path
      expectAccessDenied(errors, [{ path: ['deleteUsers', 1] }, { path: ['deleteUsers', 3] }]);

      const _users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(_users.map(({ name }) => name)).toEqual(['good 5', 'no delete 1', 'no delete 2']);
    })
  );
});
