import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectAccessDenied } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      // Filter access control
      User: list({
        fields: { name: text({ isOrderable: true }) },
        access: {
          filter: {
            query: () => true,
            update: () => ({ name: { not: { equals: 'bad' } } }),
            delete: async () => ({ name: { not: { contains: 'no delete' } } }),
          },
        },
      }),
    },
  }),
});

describe('Access control - Filter', () => {
  test(
    'updateOne',
    runner(async ({ context }) => {
      // Valid name should pass
      const user = await context.lists.User.createOne({ data: { name: 'good' } });
      await context.lists.User.updateOne({ where: { id: user.id }, data: { name: 'better' } });

      // Setting up a bad name
      await context.lists.User.updateOne({ where: { id: user.id }, data: { name: 'bad' } });

      // Now it has a bad name, we can't update it.
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
        variables: { id: user.id, data: { name: 'good' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ updateUser: null });
      expectAccessDenied(errors, [
        {
          path: ['updateUser'],
          msg: `You cannot perform the 'update' operation on the item '{"id":"${user.id}"}'. It may not exist.`,
        },
      ]);

      // User should have its original name
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['bad']);
    })
  );

  test(
    'deleteOne',
    runner(async ({ context }) => {
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
      expectAccessDenied(errors, [
        {
          path: ['deleteUser'],
          msg: `You cannot perform the 'delete' operation on the item '{"id":"${user2.id}"}'. It may not exist.`,
        },
      ]);

      // Bad users should still be in the database.
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['no delete']);
    })
  );

  test(
    'updateMany',
    runner(async ({ context }) => {
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

      // Set up some of them with bad names
      await context.lists.User.updateMany({
        data: [
          { where: { id: users[1].id }, data: { name: 'bad' } },
          { where: { id: users[3].id }, data: { name: 'bad' } },
        ],
      });

      // Mix of good and bad names
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: [UserUpdateArgs!]!) { updateUsers(data: $data) { id name } }`,
        variables: {
          data: [
            { where: { id: users[0].id }, data: { name: 'still good 1' } },
            { where: { id: users[1].id }, data: { name: 'good' } },
            { where: { id: users[2].id }, data: { name: 'still good 3' } },
            { where: { id: users[3].id }, data: { name: 'good' } },
          ],
        },
      });

      // Valid users are returned, invalid come back as null
      // The invalid updates should have errors which point to the nulls in their path
      expect(data).toEqual({
        updateUsers: [
          { id: expect.any(String), name: 'still good 1' },
          null,
          { id: expect.any(String), name: 'still good 3' },
          null,
        ],
      });
      expectAccessDenied(errors, [
        {
          path: ['updateUsers', 1],
          msg: `You cannot perform the 'update' operation on the item '{"id":"${users[1].id}"}'. It may not exist.`,
        },
        {
          path: ['updateUsers', 3],
          msg: `You cannot perform the 'update' operation on the item '{"id":"${users[3].id}"}'. It may not exist.`,
        },
      ]);

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
    runner(async ({ context }) => {
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

      expectAccessDenied(errors, [
        {
          path: ['deleteUsers', 1],
          msg: `You cannot perform the 'delete' operation on the item '{"id":"${users[1].id}"}'. It may not exist.`,
        },
        {
          path: ['deleteUsers', 3],
          msg: `You cannot perform the 'delete' operation on the item '{"id":"${users[3].id}"}'. It may not exist.`,
        },
      ]);

      // Valid users are returned, invalid come back as null
      // The invalid deletes should have errors which point to the nulls in their path
      expect(data).toEqual({
        deleteUsers: [
          { id: expect.any(String), name: 'good 1' },
          null,
          { id: expect.any(String), name: 'good 3' },
          null,
        ],
      });

      // Three users should still exist in the database
      const _users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(_users.map(({ name }) => name)).toEqual(['good 5', 'no delete 1', 'no delete 2']);
    })
  );
});
