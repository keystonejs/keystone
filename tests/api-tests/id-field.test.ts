import { list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { isCuid } from 'cuid';
import { validate } from 'uuid';
import { apiTestConfig, expectBadUserInput } from './utils';

export function assertNever(arg: never) {
  throw new Error('expected to never be called but received: ' + JSON.stringify(arg));
}

describe.each(['autoincrement', 'cuid', 'uuid'] as const)('%s', kind => {
  const runner = setupTestRunner({
    config: apiTestConfig({
      db: { idField: { kind } },
      lists: {
        User: list({ fields: { name: text() } }),
      },
    }),
  });
  test(
    'Fetching an item uniquely with an invalid id throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `{ user(where: { id: "adskjnfasdfkjekfj"}) { id } }`,
      });
      expect(body.data).toEqual({ user: null });
      const s = kind === 'autoincrement' ? 'an integer' : `a ${kind}`;
      expectBadUserInput(body.errors, [
        { path: ['user'], message: `Only ${s} can be passed to id filters` },
      ]);
    })
  );
  test(
    'Filtering an item with an invalid id throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `{ users(where: { id: { equals: "adskjnfasdfkjekfj" } }) { id } }`,
      });
      expect(body.data).toEqual({ users: null });
      const s = kind === 'autoincrement' ? 'an integer' : `a ${kind}`;
      expectBadUserInput(body.errors, [
        { path: ['users'], message: `Only ${s} can be passed to id filters` },
      ]);
    })
  );
  test(
    'Fetching an item uniquely with a null id throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({ query: `{ user(where: { id: null}) { id } }` });
      expect(body.data).toEqual({ user: null });
      expectBadUserInput(body.errors, [
        {
          path: ['user'],
          message: `The unique value provided in a unique where input must not be null`,
        },
      ]);
    })
  );
  test(
    'Filtering an item with a null id throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({ query: `{ users(where: { id: null }) { id } }` });
      expect(body.data).toEqual({ users: null });
      expectBadUserInput(body.errors, [{ path: ['users'], message: `id filter cannot be null` }]);
    })
  );
  test(
    'Filtering an item with { equals: null } throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `{ users(where: { id: { equals: null } }) { id } }`,
      });
      expect(body.data).toEqual({ users: null });
      const s = kind === 'autoincrement' ? 'an integer' : `a ${kind}`;
      expectBadUserInput(body.errors, [
        { path: ['users'], message: `Only ${s} can be passed to id filters` },
      ]);
    })
  );
  test(
    'Filtering an item with a in: null throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `{ users(where: { id: { in: null } }) { id } }`,
      });
      expect(body.data).toEqual({ users: null });
      expectBadUserInput(body.errors, [
        { path: ['users'], message: `in id filter cannot be null` },
      ]);
    })
  );
  test(
    'Filtering an item with a notIn: null throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `{ users(where: { id: { notIn: null } }) { id } }`,
      });
      expect(body.data).toEqual({ users: null });
      expectBadUserInput(body.errors, [
        { path: ['users'], message: `notIn id filter cannot be null` },
      ]);
    })
  );
  test(
    'Creating an item',
    runner(async ({ context }) => {
      const { id } = await context.lists.User.createOne({ data: { name: 'something' } });
      switch (kind) {
        case 'autoincrement': {
          expect(id).toEqual('1');
          return;
        }
        case 'cuid': {
          expect(isCuid(id)).toBe(true);
          return;
        }
        case 'uuid': {
          expect(validate(id)).toBe(true);
          return;
        }
        default: {
          assertNever(kind);
        }
      }
    })
  );
});

{
  const runner = setupTestRunner({
    config: apiTestConfig({
      db: { idField: { kind: 'uuid' } },
      lists: {
        User: list({ fields: { name: text() } }),
      },
    }),
  });
  test(
    'searching for uppercased uuid works',
    runner(async ({ context }) => {
      const { id } = (await context.lists.User.createOne({
        data: { name: 'something' },
      })) as { id: string };
      const { id: fromFound } = await context.lists.User.findOne({
        where: { id: id.toUpperCase() },
      });
      // it returns lower-cased
      expect(fromFound).toBe(id);
    })
  );
}

{
  const runner = setupTestRunner({
    config: apiTestConfig({
      db: { idField: { kind: 'cuid' } },
      lists: {
        User: list({ fields: { name: text() } }),
      },
    }),
  });
  test(
    'searching for uppercased cuid does not work',
    runner(async ({ context, graphQLRequest }) => {
      const { id } = (await context.lists.User.createOne({
        data: { name: 'something' },
      })) as { id: string };

      const { body } = await graphQLRequest({
        query: `query q($id: ID!){ user(where: { id: $id }) { id } }`,
        variables: { id: id.toUpperCase() },
      });
      expect(body.data).toEqual({ user: null });
      expectBadUserInput(body.errors, [
        { path: ['user'], message: `Only a cuid can be passed to id filters` },
      ]);
    })
  );
}
