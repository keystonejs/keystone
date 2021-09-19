import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectAccessDenied, expectInternalServerError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
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
      BadAccess: list({
        fields: { name: text({ isFilterable: true, isOrderable: true }) },
        access: {
          item: {
            // @ts-ignore Intentionally return a filter for testing purposes
            create: () => {
              return { name: { not: { equals: 'bad' } } };
            },
            // @ts-ignore Intentionally return a filter for testing purposes
            update: () => {
              return { name: { not: { equals: 'bad' } } };
            },
            // @ts-ignore Intentionally return a filter for testing purposes
            delete: async () => {
              return { name: { not: { startsWtih: 'no delete' } } };
            },
          },
        },
      }),
    },
  }),
});

describe('Access control - Item', () => {
  test(
    'createOne',
    runner(async ({ context }) => {
      // Valid name should pass
      await context.lists.User.createOne({ data: { name: 'good' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
        variables: { data: { name: 'bad' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      expectAccessDenied(errors, [
        {
          path: ['createUser'],
          msg: `You cannot perform the 'create' operation on the item '{"name":"bad"}'.`,
        },
      ]);

      // Only the original user should exist
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['good']);
    })
  );

  test(
    'createOne - Bad function return value',
    runner(async ({ context, graphQLRequest }) => {
      // Valid name
      const { body } = await graphQLRequest({
        query: `mutation ($data: BadAccessCreateInput!) { createBadAccess(data: $data) { id } }`,
        variables: { data: { name: 'better' } },
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ createBadAccess: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Must return a Boolean from BadAccess.access.item.create(). Got object',
          path: ['createBadAccess'],
        },
      ]);

      // No items should exist
      const _users = await context.lists.BadAccess.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual([]);
    })
  );

  test(
    'updateOne',
    runner(async ({ context }) => {
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
      expectAccessDenied(errors, [
        {
          path: ['updateUser'],
          msg: `You cannot perform the 'update' operation on the item '{"id":"${user.id}"}'. It may not exist.`,
        },
      ]);

      // User should have its original name
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['better']);
    })
  );

  test(
    'updateOne - Bad function return value',
    runner(async ({ context, graphQLRequest }) => {
      const item = await context.sudo().lists.BadAccess.createOne({ data: { name: 'good' } });

      // Valid name
      const { body } = await graphQLRequest({
        query: `mutation ($id: ID! $data: BadAccessUpdateInput!) { updateBadAccess(where: { id: $id }, data: $data) { id } }`,
        variables: { id: item.id, data: { name: 'better' } },
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ updateBadAccess: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Must return a Boolean from BadAccess.access.item.update(). Got object',
          path: ['updateBadAccess'],
        },
      ]);

      // Item should have its original name
      const _items = await context.lists.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual(['good']);
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
    'deleteOne - Bad function return value',
    runner(async ({ context, graphQLRequest }) => {
      const item = await context.sudo().lists.BadAccess.createOne({ data: { name: 'good' } });

      // Valid name
      const { body } = await graphQLRequest({
        query: `mutation ($id: ID!) { deleteBadAccess(where: { id: $id }) { id } }`,
        variables: { id: item.id },
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ deleteBadAccess: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Must return a Boolean from BadAccess.access.item.delete(). Got object',
          path: ['deleteBadAccess'],
        },
      ]);

      // Item should have its original name
      const _items = await context.lists.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual(['good']);
    })
  );

  test(
    'createMany',
    runner(async ({ context }) => {
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
      expectAccessDenied(errors, [
        {
          path: ['createUsers', 1],
          msg: `You cannot perform the 'create' operation on the item '{"name":"bad"}'.`,
        },
        {
          path: ['createUsers', 3],
          msg: `You cannot perform the 'create' operation on the item '{"name":"bad"}'.`,
        },
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

      const _users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(_users.map(({ name }) => name)).toEqual(['good 5', 'no delete 1', 'no delete 2']);
    })
  );
});
