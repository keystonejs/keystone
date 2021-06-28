import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';
import { setupTestRunner } from '@keystone-next/testing';
import { isCuid } from 'cuid';
import { validate } from 'uuid';
import { apiTestConfig } from './utils';

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
    runner(async ({ context }) => {
      await expect(
        context.lists.User.findOne({ where: { id: 'adskjnfasdfkjekfj' } })
      ).rejects.toMatchObject({
        message: `Only ${
          kind === 'autoincrement' ? 'an integer' : `a ${kind}`
        } can be passed to id filters`,
      });
    })
  );
  test(
    'Filtering an item with an invalid id throws an error',
    runner(async ({ context }) => {
      await expect(
        context.lists.User.findOne({ where: { id: 'adskjnfasdfkjekfj' } })
      ).rejects.toMatchObject({
        message: `Only ${
          kind === 'autoincrement' ? 'an integer' : `a ${kind}`
        } can be passed to id filters`,
      });
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
