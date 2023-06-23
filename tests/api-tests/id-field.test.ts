import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import { isCuid } from 'cuid';
import { validate } from 'uuid';
import { apiTestConfig, dbProvider, expectBadUserInput } from './utils';

export function assertNever(arg: never) {
  throw new Error('expected to never be called but received: ' + JSON.stringify(arg));
}

describe.each([
  { kind: 'autoincrement', type: 'Int', error: 'int' } as const,
  ...(dbProvider === 'sqlite' ? [] : [
    { kind: 'autoincrement', type: 'BigInt', error: 'bigint' } as const,
  ]),
  { kind: 'cuid', error: 'cuid' } as const,
  { kind: 'uuid', error: 'uuid' } as const,
  { kind: 'string', error: 'string' }  as const
] as const)('%s', idField => {
  const runner = setupTestRunner({
    config: apiTestConfig({
      db: {
        idField
      },
      lists: {
        User: list({ access: allowAll, fields: { name: text() } }),
      },
    }),
  });
  test(
    'Fetching an item uniquely with an invalid id throws an error',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `{ user(where: { id: "adskjnfasdfkjekfj"}) { id } }`,
      });
      expect(data).toEqual({ user: null });
      expectBadUserInput(errors, [
        { path: ['user'], message: `Only a ${idField.error} can be passed to id filters` },
      ]);
    })
  );

  if (idField.kind !== 'string') {
    test(
      'Filtering an item with an invalid id throws an error',
      runner(async ({ context }) => {
        const { data, errors } = await context.graphql.raw({
          query: `{ users(where: { id: { equals: "adskjnfasdfkjekfj" } }) { id } }`,
        });
        expect(data).toEqual({ users: null });
        expectBadUserInput(errors, [
          { path: ['users'], message: `Only a ${idField.error} can be passed to id filters` },
        ]);
      })
    );
  }

  test(
    'Fetching an item uniquely with a null id throws an error',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `{ user(where: { id: null }) { id } }`,
      });
      expect(data).toEqual({ user: null });
      expectBadUserInput(errors, [
        {
          path: ['user'],
          message: `The unique value provided in a unique where input must not be null`,
        },
      ]);
    })
  );

  test(
    'Filtering an item with a null id throws an error',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `{ users(where: { id: null }) { id } }`,
      });
      expect(data).toEqual({ users: null });
      expectBadUserInput(errors, [{ path: ['users'], message: `id filter cannot be null` }]);
    })
  );
  test(
    'Filtering an item with { equals: null } throws an error',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `{ users(where: { id: { equals: null } }) { id } }`,
      });
      expect(data).toEqual({ users: null });
      expectBadUserInput(errors, [
        { path: ['users'], message: `Only a ${idField.error} can be passed to id filters` },
      ]);
    })
  );
  test(
    'Filtering an item with a in: null throws an error',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `{ users(where: { id: { in: null } }) { id } }`,
      });
      expect(data).toEqual({ users: null });
      expectBadUserInput(errors, [{ path: ['users'], message: `in id filter cannot be null` }]);
    })
  );
  test(
    'Filtering an item with a notIn: null throws an error',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `{ users(where: { id: { notIn: null } }) { id } }`,
      });
      expect(data).toEqual({ users: null });
      expectBadUserInput(errors, [{ path: ['users'], message: `notIn id filter cannot be null` }]);
    })
  );
  test(
    'Querying with findOne',
    runner(async ({ context }) => {
      const { id } = await context.query.User.createOne({ data: { name: 'something' } });
      await context.query.User.createOne({ data: { name: 'another' } });
      const item = await context.query.User.findOne({ where: { id } });
      expect(item.id).toBe(id);
    })
  );
  test(
    'Querying with findMany',
    runner(async ({ context }) => {
      const { id } = await context.query.User.createOne({ data: { name: 'something' } });
      await context.query.User.createOne({ data: { name: 'another' } });
      const items = await context.query.User.findMany({ where: { id: { equals: id } } });
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(id);
    })
  );
  test(
    'Creating an item',
    runner(async ({ context }) => {
      const { id } = await context.query.User.createOne({ data: { name: 'something' } });
      const dbItem = await context.db.User.findOne({ where: { id } });
      switch (idField.kind) {
        case 'autoincrement': {
          if (idField.type === 'BigInt') {
            expect(id).toEqual('1');
            expect(dbItem?.id).toBe(1n);
            return;
          }

          expect(id).toBe('1');
          expect(dbItem?.id).toBe(1);
          return;
        }
        case 'cuid': {
          expect(isCuid(id)).toBe(true);
          expect(dbItem?.id).toBe(id);
          return;
        }
        case 'uuid': {
          expect(validate(id)).toBe(true);
          expect(dbItem?.id).toBe(id);
          return;
        }
        case 'string': {
          expect(isCuid(id)).toBe(true);
          expect(dbItem?.id).toBe(id);
          return;
        }
        default: {
          assertNever(idField);
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
        User: list({ access: allowAll, fields: { name: text() } }),
      },
    }),
  });
  test(
    'searching for uppercased uuid works',
    runner(async ({ context }) => {
      const { id } = (await context.query.User.createOne({
        data: { name: 'something' },
      })) as { id: string };
      const { id: fromFound } = await context.query.User.findOne({
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
        User: list({ access: allowAll, fields: { name: text() } }),
      },
    }),
  });
  test(
    'searching for uppercased cuid does not work',
    runner(async ({ context }) => {
      const { id } = (await context.query.User.createOne({
        data: { name: 'something' },
      })) as { id: string };

      const { data, errors } = await context.graphql.raw({
        query: `query q($id: ID!){ user(where: { id: $id }) { id } }`,
        variables: { id: id.toUpperCase() },
      });
      expect(data).toEqual({ user: null });
      expectBadUserInput(errors, [
        { path: ['user'], message: `Only a cuid can be passed to id filters` },
      ]);
    })
  );
}
