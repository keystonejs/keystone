import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';
import { setupTestRunner } from '@keystone-next/testing';
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
      lists: createSchema({
        User: list({ fields: { name: text() } }),
      }),
    }),
  });
  test(
    'Fetching an item uniquely with an invalid id throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `{ User(where: { id: "adskjnfasdfkjekfj"}) { id } }`,
      });
      expect(body.data).toEqual({ User: null });
      const s = kind === 'autoincrement' ? 'an integer' : `a ${kind}`;
      expectBadUserInput(body.errors, [
        { path: ['User'], message: `Only ${s} can be passed to id filters` },
      ]);
    })
  );
  test(
    'Filtering an item with an invalid id throws an error',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `{ allUsers(where: { id: "adskjnfasdfkjekfj"}) { id } }`,
      });
      expect(body.data).toEqual({ allUsers: null });
      const s = kind === 'autoincrement' ? 'an integer' : `a ${kind}`;
      expectBadUserInput(body.errors, [
        { path: ['allUsers'], message: `Only ${s} can be passed to id filters` },
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
      lists: createSchema({
        User: list({ fields: { name: text() } }),
      }),
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
      lists: createSchema({
        User: list({ fields: { name: text() } }),
      }),
    }),
  });
  test(
    'searching for uppercased cuid does not work',
    runner(async ({ context, graphQLRequest }) => {
      const { id } = (await context.lists.User.createOne({
        data: { name: 'something' },
      })) as { id: string };

      const { body } = await graphQLRequest({
        query: `query q($id: ID!){ User(where: { id: $id }) { id } }`,
        variables: { id: id.toUpperCase() },
      });
      expect(body.data).toEqual({ User: null });
      expectBadUserInput(body.errors, [
        { path: ['User'], message: `Only a cuid can be passed to id filters` },
      ]);
    })
  );
}
