import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      User: list({
        fields: { name: text() },
        hooks: {
          validateInput: ({ resolvedData, addValidationError }) => {
            if (resolvedData.name === 'bad') {
              addValidationError('Bad name');
            }
          },
          validateDelete: ({ existingItem, addValidationError }) => {
            if (existingItem.name.startsWith('no delete')) {
              addValidationError('Bad name');
            }
          },
        },
      }),
    }),
  }),
});

describe('List Hooks: #validateInput()', () => {
  test(
    'createOne',
    runner(async ({ context }) => {
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
      expect(errors![0].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![0].path).toEqual(['createUser']);

      // Only the original user should exist
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['good']);
    })
  );

  test(
    'updateOne',
    runner(async ({ context }) => {
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
      expect(errors![0].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![0].path).toEqual(['updateUser']);

      // User should have its original name
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['better']);
    })
  );

  test(
    'deleteOne',
    runner(async ({ context }) => {
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
      expect(errors![0].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![0].path).toEqual(['deleteUser']);

      // Bad users should still be in the database.
      const _users = await context.lists.User.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual(['no delete']);
    })
  );

  test(
    'createMany',
    runner(async ({ context }) => {
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
      expect(data!.createUsers).toHaveLength(5);
      expect(data!.createUsers[0].name).toEqual('good 1');
      expect(data!.createUsers[1]).toBe(null);
      expect(data!.createUsers[2].name).toEqual('good 2');
      expect(data!.createUsers[3]).toBe(null);
      expect(data!.createUsers[4].name).toEqual('good 3');
      // The invalid creates should have errors which point to the nulls in their path
      expect(errors).toHaveLength(2);
      expect(errors![0].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![0].path).toEqual(['createUsers', 1]);

      expect(errors![1].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![1].path).toEqual(['createUsers', 3]);

      // Three users should exist in the database
      const users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(users.map(({ name }) => name)).toEqual(['good 1', 'good 2', 'good 3']);
    })
  );

  test(
    'updateMany',
    runner(async ({ context }) => {
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

      // Valid users are returned, invalid come back as null
      expect(data!.updateUsers).toHaveLength(4);
      expect(data!.updateUsers[0].name).toEqual('still good 1');
      expect(data!.updateUsers[1]).toBe(null);
      expect(data!.updateUsers[2].name).toEqual('still good 3');
      expect(data!.updateUsers[3]).toBe(null);
      // The invalid updates should have errors which point to the nulls in their path
      expect(errors).toHaveLength(2);
      expect(errors![0].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![0].path).toEqual(['updateUsers', 1]);

      expect(errors![1].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![1].path).toEqual(['updateUsers', 3]);

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
      expect(errors![0].message).toEqual('You attempted to perform an invalid mutation');
      expect(errors![0].path).toEqual(['deleteUsers', 1]);

      expect(errors![1].message).toEqual('You attempted to perform an invalid mutation');
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
