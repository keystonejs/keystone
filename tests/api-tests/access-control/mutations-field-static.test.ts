import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig, expectAccessDenied } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      // Imperative -> Static access control
      User: list({
        fields: {
          other: text(),
          name: text({
            access: {
              read: true,
              create: ({ originalInput }) => {
                if (Array.isArray(originalInput)) {
                  return !originalInput.some(item => item.data.name === 'bad');
                } else {
                  return (originalInput as any).name !== 'bad';
                }
              },
              update: ({ originalInput }) => {
                if (Array.isArray(originalInput)) {
                  return !originalInput.some(item => item.data.name === 'bad');
                } else {
                  return (originalInput as any).name !== 'bad';
                }
              },
            },
          }),
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
      await context.lists.User.createOne({ data: { name: 'good', other: 'a' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput) { createUser(data: $data) { id } }`,
        variables: { data: { name: 'bad', other: 'b' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      expectAccessDenied(errors, [{ path: ['createUser'] }]);

      // Only the original user should exist
      const _users = await context.lists.User.findMany({ query: 'id name other' });
      expect(_users.map(({ name }) => name)).toEqual(['good']);
      expect(_users.map(({ other }) => other)).toEqual(['a']);
    })
  );

  test(
    'updateOne',
    runner(async ({ context }) => {
      context = context.exitSudo();
      // Valid name should pass
      const user = await context.lists.User.createOne({ data: { name: 'good', other: 'a' } });
      await context.lists.User.updateOne({ id: user.id, data: { name: 'better', other: 'b' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: UserUpdateInput) { updateUser(id: $id data: $data) { id } }`,
        variables: { id: user.id, data: { name: 'bad', other: 'c' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ updateUser: null });
      expectAccessDenied(errors, [{ path: ['updateUser'] }]);

      // User should have its original name
      const _users = await context.lists.User.findMany({ query: 'id name other' });
      expect(_users.map(({ name }) => name)).toEqual(['better']);
      expect(_users.map(({ other }) => other)).toEqual(['b']);
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
            { data: { name: 'good 1', other: 'a' } },
            { data: { name: 'bad', other: 'a' } },
            { data: { name: 'good 2', other: 'a' } },
            { data: { name: 'bad', other: 'a' } },
            { data: { name: 'good 3', other: 'a' } },
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

      // Valid users should exist in the database
      const users = await context.lists.User.findMany({
        orderBy: { name: 'asc' },
        query: 'id name',
      });
      expect(users).toHaveLength(3);
      expect(users[0].name).toEqual('good 1');
      expect(users[1].name).toEqual('good 2');
      expect(users[2].name).toEqual('good 3');
    })
  );

  test(
    'updateMany',
    runner(async ({ context }) => {
      context = context.exitSudo();
      // Start with some users
      const users = await context.lists.User.createMany({
        data: [
          { data: { name: 'good 1', other: 'a' } },
          { data: { name: 'good 2', other: 'a' } },
          { data: { name: 'good 3', other: 'a' } },
          { data: { name: 'good 4', other: 'a' } },
          { data: { name: 'good 5', other: 'a' } },
        ],
        query: 'id name',
      });

      // Mix of good and bad names
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: [UsersUpdateInput]) { updateUsers(data: $data) { id name } }`,
        variables: {
          data: [
            { id: users[0].id, data: { name: 'still good 1', other: 'b' } },
            { id: users[1].id, data: { name: 'bad', other: 'b' } },
            { id: users[2].id, data: { name: 'still good 3', other: 'b' } },
            { id: users[3].id, data: { name: 'bad', other: 'b' } },
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
});
