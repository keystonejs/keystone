import { text } from '@keystone-next/keystone/fields';
import { createSchema, list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectAccessDenied } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      // Item access control
      User: list({
        fields: { name: text({ isFilterable: true, isOrderable: true }) },
        access: {
          item: {
            create: ({ originalInput }) => {
              return originalInput.name !== 'bad';
            },
            update: ({ originalInput }) => {
              return originalInput.name !== 'bad';
            },
            delete: async ({ item }) => {
              return !item.name.startsWith('no delete');
            },
          },
        },
      }),
    }),
  }),
});

describe('Access control - Item', () => {
  test(
    'createOne',
    runner(async ({ context }) => {
      context = context.exitSudo();
      // Valid name should pass
      await context.lists.User.createOne({ data: { name: 'good' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
        variables: { data: { name: 'bad' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      expectAccessDenied('dev', false, undefined, errors, [{ path: ['createUser'] }]);

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
      await context.lists.User.updateOne({ where: { id: user.id }, data: { name: 'better' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
        variables: { id: user.id, data: { name: 'bad' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ updateUser: null });
      expectAccessDenied('dev', false, undefined, errors, [{ path: ['updateUser'] }]);

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
        query: `mutation ($id: ID!) { deleteUser(where: { id: $id }) { id } }`,
        variables: { id: user2.id },
      });

      // Returns null and throws an error
      expect(data).toEqual({ deleteUser: null });
      expectAccessDenied('dev', false, undefined, errors, [{ path: ['deleteUser'] }]);

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
        query: `mutation ($data: [UserCreateInput!]!) { createUsers(data: $data) { id name } }`,
        variables: {
          data: [
            { name: 'good 1' },
            { name: 'bad' },
            { name: 'good 2' },
            { name: 'bad' },
            { name: 'good 3' },
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
      expectAccessDenied('dev', false, undefined, errors, [
        { path: ['createUsers', 1] },
        { path: ['createUsers', 3] },
      ]);

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
          { name: 'good 1' },
          { name: 'good 2' },
          { name: 'good 3' },
          { name: 'good 4' },
          { name: 'good 5' },
        ],
        query: 'id name',
      });

      // Mix of good and bad names
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: [UserUpdateArgs!]!) { updateUsers(data: $data) { id name } }`,
        variables: {
          data: [
            { where: { id: users[0].id }, data: { name: 'still good 1' } },
            { where: { id: users[1].id }, data: { name: 'bad' } },
            { where: { id: users[2].id }, data: { name: 'still good 3' } },
            { where: { id: users[3].id }, data: { name: 'bad' } },
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
      expectAccessDenied('dev', false, undefined, errors, [
        { path: ['updateUsers', 1] },
        { path: ['updateUsers', 3] },
      ]);

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
          { name: 'good 1' },
          { name: 'no delete 1' },
          { name: 'good 3' },
          { name: 'no delete 2' },
          { name: 'good 5' },
        ],
        query: 'id name',
      });

      // Mix of good and bad names
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($where: [UserWhereUniqueInput!]!) { deleteUsers(where: $where) { id name } }`,
        variables: {
          where: [users[0].id, users[1].id, users[2].id, users[3].id].map(id => ({ id })),
        },
      });

      // Valid users are returned, invalid come back as null
      expect(data!.deleteUsers).toEqual([
        { id: users[0].id, name: 'good 1' },
        null,
        { id: users[2].id, name: 'good 3' },
        null,
      ]);

      // The invalid updates should have errors which point to the nulls in their path
      expectAccessDenied('dev', false, undefined, errors, [
        { path: ['deleteUsers', 1] },
        { path: ['deleteUsers', 3] },
      ]);

      const _users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(_users.map(({ name }) => name)).toEqual(['good 5', 'no delete 1', 'no delete 2']);
    })
  );
});
