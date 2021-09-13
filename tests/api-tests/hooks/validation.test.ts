import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectValidationError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: { name: text({ isOrderable: true }) },
        hooks: {
          validateInput: ({ resolvedData, addValidationError }) => {
            if (resolvedData.name === 'bad') {
              addValidationError('This is not a valid name');
            }
          },
          validateDelete: ({ existingItem, addValidationError }) => {
            if (existingItem.name.startsWith('no delete')) {
              addValidationError('Deleting this item would be bad');
            }
          },
        },
      }),
      Post: list({
        fields: {
          neverValid: text({
            hooks: {
              validateInput: ({ operation, addValidationError }) => {
                if (operation === 'update') {
                  addValidationError('never change me');
                }
              },
            },
          }),
          sometimesValid: text({
            hooks: {
              validateInput: ({ resolvedData, addValidationError }) => {
                if (resolvedData.sometimesValid === 'invalid') {
                  addValidationError('not this time');
                }
              },
            },
          }),
          doubleInvalid: text({
            hooks: {
              validateInput: ({ operation, addValidationError }) => {
                if (operation === 'update') {
                  addValidationError('first error');
                  addValidationError('second error');
                }
              },
            },
          }),
          noDelete: text({
            hooks: {
              validateDelete: ({ addValidationError }) => {
                addValidationError('I am invincible!');
              },
            },
          }),
        },
      }),
    },
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
        query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
        variables: { data: { name: 'bad' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      expectValidationError(errors, [
        { path: ['createUser'], messages: ['User: This is not a valid name'] },
      ]);

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
      await context.lists.User.updateOne({ where: { id: user.id }, data: { name: 'better' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
        variables: { id: user.id, data: { name: 'bad' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ updateUser: null });
      expectValidationError(errors, [
        { path: ['updateUser'], messages: ['User: This is not a valid name'] },
      ]);

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
      await context.lists.User.deleteOne({ where: { id: user1.id } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID!) { deleteUser(where: { id: $id }) { id } }`,
        variables: { id: user2.id },
      });

      // Returns null and throws an error
      expect(data).toEqual({ deleteUser: null });
      expectValidationError(errors, [
        { path: ['deleteUser'], messages: ['User: Deleting this item would be bad'] },
      ]);

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
      // The invalid creates should have errors which point to the nulls in their path
      expectValidationError(errors, [
        { path: ['createUsers', 1], messages: ['User: This is not a valid name'] },
        { path: ['createUsers', 3], messages: ['User: This is not a valid name'] },
      ]);

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
      expect(data).toEqual({
        updateUsers: [
          { id: users[0].id, name: 'still good 1' },
          null,
          { id: users[2].id, name: 'still good 3' },
          null,
        ],
      });
      // The invalid updates should have errors which point to the nulls in their path
      expectValidationError(errors, [
        { path: ['updateUsers', 1], messages: ['User: This is not a valid name'] },
        { path: ['updateUsers', 3], messages: ['User: This is not a valid name'] },
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
      expect(data).toEqual({
        deleteUsers: [
          { id: users[0].id, name: 'good 1' },
          null,
          { id: users[2].id, name: 'good 3' },
          null,
        ],
      });
      // The invalid deletes should have errors which point to the nulls in their path
      expectValidationError(errors, [
        { path: ['deleteUsers', 1], messages: ['User: Deleting this item would be bad'] },
        { path: ['deleteUsers', 3], messages: ['User: Deleting this item would be bad'] },
      ]);

      // Three users should still exist in the database
      const _users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(_users.map(({ name }) => name)).toEqual(['good 5', 'no delete 1', 'no delete 2']);
    })
  );
});

describe('Field Hooks: #validateInput()', () => {
  test(
    'update',
    runner(async ({ context }) => {
      const post = await context.lists.Post.createOne({ data: {} });

      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: PostUpdateInput!) { updatePost(where: { id: $id }, data: $data) { id } }`,
        variables: { id: post.id, data: {} },
      });
      expectValidationError(errors, [
        {
          path: ['updatePost'],
          messages: [
            'Post.neverValid: never change me',
            'Post.doubleInvalid: first error',
            'Post.doubleInvalid: second error',
          ],
        },
      ]);
      expect(data).toEqual({ updatePost: null });
    })
  );

  test(
    'delete',
    runner(async ({ context }) => {
      const post = await context.lists.Post.createOne({ data: {} });
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID!) { deletePost(where: { id: $id }) { id } }`,
        variables: { id: post.id },
      });
      expectValidationError(errors, [
        { path: ['deletePost'], messages: ['Post.noDelete: I am invincible!'] },
      ]);
      expect(data).toEqual({ deletePost: null });
    })
  );
});
