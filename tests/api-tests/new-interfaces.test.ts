import { createSchema, list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from './utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      User: list({ fields: { name: text() } }),
    }),
  }),
});

test(
  'Smoke test',
  runner(async ({ context }) => {
    const users = await context.db.lists.User.findMany({});
    expect(users).toEqual([]);
  })
);
