import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectAccessDenied, expectAccessReturnError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      // Imperative -> Static access control
      User: list({
        fields: {
          other: text(),
          name: text({
            access: {
              read: () => true,
              create: ({ inputData }: any) => {
                if (Array.isArray(inputData)) {
                  return !inputData.some(item => item.data.name === 'bad');
                } else {
                  return (inputData as any).name !== 'bad';
                }
              },
              update: ({ inputData }: any) => {
                if (Array.isArray(inputData)) {
                  return !inputData.some(item => item.data.name === 'bad');
                } else {
                  return (inputData as any).name !== 'bad';
                }
              },
            },
          }),
          badAccess: text({
            access: {
              // @ts-ignore Intentionally return a string for testing purposes
              read: () => 'non boolean value',
              // @ts-ignore Intentionally return a string for testing purposes
              create: () => 'non boolean value',
              // @ts-ignore Intentionally return a string for testing purposes
              update: () => 'non boolean value',
            },
          }),
        },
      }),
    },
  }),
});

describe('Access control', () => {
  test(
    'findMany - Bad function return value',
    runner(async ({ context }) => {
      const item = await context
        .sudo()
        .query.User.createOne({ data: { name: 'foo', badAccess: 'bar' } });

      const { data, errors } = await context.graphql.raw({
        query: `query { users { id name badAccess } }`,
      });

      // Returns the item, with null for the bad field, and an error message
      expect(data).toEqual({ users: [{ id: item.id, name: 'foo', badAccess: null }] });
      expectAccessReturnError(errors, [
        {
          path: ['users', 0, 'badAccess'],
          errors: [{ tag: 'User.badAccess.access.read', returned: 'string' }],
        },
      ]);
    })
  );
  test(
    'createOne',
    runner(async ({ context }) => {
      // Valid name should pass
      await context.query.User.createOne({ data: { name: 'good', other: 'a' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
        variables: { data: { name: 'bad', other: 'b' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      expectAccessDenied(errors, [
        {
          path: ['createUser'],
          msg: `You cannot perform the 'create' operation on the item '{"other":"b","name":"bad"}'. You cannot create the fields ["name"].`,
        },
      ]);

      // Only the original user should exist
      const _users = await context.query.User.findMany({ query: 'id name other' });
      expect(_users.map(({ name }) => name)).toEqual(['good']);
      expect(_users.map(({ other }) => other)).toEqual(['a']);
    })
  );

  test(
    'createOne - Bad function return value',
    runner(async ({ context }) => {
      // Valid name should pass
      await context.query.User.createOne({ data: { name: 'good', other: 'a' } });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
        variables: { data: { name: 'fine', other: 'b', badAccess: 'bar' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      expectAccessReturnError(errors, [
        {
          path: ['createUser'],
          errors: [{ tag: 'User.badAccess.access.create', returned: 'string' }],
        },
      ]);

      // Only the original user should exist
      const _users = await context.query.User.findMany({ query: 'id name other' });
      expect(_users.map(({ name }) => name)).toEqual(['good']);
      expect(_users.map(({ other }) => other)).toEqual(['a']);
    })
  );

  test(
    'updateOne',
    runner(async ({ context }) => {
      // Valid name should pass
      const user = await context.query.User.createOne({ data: { name: 'good', other: 'a' } });
      await context.query.User.updateOne({
        where: { id: user.id },
        data: { name: 'better', other: 'b' },
      });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
        variables: { id: user.id, data: { name: 'bad', other: 'c' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ updateUser: null });
      expectAccessDenied(errors, [
        {
          path: ['updateUser'],
          msg: `You cannot perform the 'update' operation on the item '{"id":"${user.id}"}'. You cannot update the fields ["name"].`,
        },
      ]);

      // User should have its original name
      const _users = await context.query.User.findMany({ query: 'id name other' });
      expect(_users.map(({ name }) => name)).toEqual(['better']);
      expect(_users.map(({ other }) => other)).toEqual(['b']);
    })
  );

  test(
    'updateOne - Bad function return value',
    runner(async ({ context }) => {
      // Valid name should pass
      const user = await context.query.User.createOne({ data: { name: 'good', other: 'a' } });
      await context.query.User.updateOne({
        where: { id: user.id },
        data: { name: 'better', other: 'b' },
      });

      // Invalid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
        variables: { id: user.id, data: { name: 'bad', other: 'c', badAccess: 'bar' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ updateUser: null });
      expectAccessReturnError(errors, [
        {
          path: ['updateUser'],
          errors: [{ tag: 'User.badAccess.access.update', returned: 'string' }],
        },
      ]);

      // User should have its original name
      const _users = await context.query.User.findMany({ query: 'id name other' });
      expect(_users.map(({ name }) => name)).toEqual(['better']);
      expect(_users.map(({ other }) => other)).toEqual(['b']);
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
            { name: 'good 1', other: 'a' },
            { name: 'bad', other: 'a' },
            { name: 'good 2', other: 'a' },
            { name: 'bad', other: 'a' },
            { name: 'good 3', other: 'a' },
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
          msg: `You cannot perform the 'create' operation on the item '{"other":"a","name":"bad"}'. You cannot create the fields [\"name\"].`,
        },
        {
          path: ['createUsers', 3],
          msg: `You cannot perform the 'create' operation on the item '{"other":"a","name":"bad"}'. You cannot create the fields [\"name\"].`,
        },
      ]);

      // Valid users should exist in the database
      const users = await context.query.User.findMany({
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
      // Start with some users
      const users = await context.query.User.createMany({
        data: [
          { name: 'good 1', other: 'a' },
          { name: 'good 2', other: 'a' },
          { name: 'good 3', other: 'a' },
          { name: 'good 4', other: 'a' },
          { name: 'good 5', other: 'a' },
        ],
        query: 'id name',
      });

      // Mix of good and bad names
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: [UserUpdateArgs!]!) { updateUsers(data: $data) { id name } }`,
        variables: {
          data: [
            { where: { id: users[0].id }, data: { name: 'still good 1', other: 'b' } },
            { where: { id: users[1].id }, data: { name: 'bad', other: 'b' } },
            { where: { id: users[2].id }, data: { name: 'still good 3', other: 'b' } },
            { where: { id: users[3].id }, data: { name: 'bad', other: 'b' } },
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
      expectAccessDenied(errors, [
        {
          path: ['updateUsers', 1],
          msg: `You cannot perform the 'update' operation on the item '{"id":"${users[1].id}"}'. You cannot update the fields [\"name\"].`,
        },
        {
          path: ['updateUsers', 3],
          msg: `You cannot perform the 'update' operation on the item '{"id":"${users[3].id}"}'. You cannot update the fields [\"name\"].`,
        },
      ]);

      // All users should still exist in the database
      const _users = await context.query.User.findMany({
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
