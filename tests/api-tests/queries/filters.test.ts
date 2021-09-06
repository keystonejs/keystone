import { text, relationship } from '@keystone-next/keystone/fields';
import { createSchema, list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      User: list({
        fields: {
          noDash: text({ isFilterable: true }),
          single_dash: text({ isFilterable: true }),
          many_many_many_dashes: text({ isFilterable: true }),
          multi____dash: text({ isFilterable: true }),
        },
      }),
      SecondaryList: list({
        fields: {
          someUser: relationship({ ref: 'User', isFilterable: true }),
        },
      }),
    }),
  }),
});

describe('filtering on field name', () => {
  test(
    'filter works when there is no dash in field name',
    runner(async ({ context }) => {
      const users = await context.lists.User.findMany({ where: { noDash: { equals: 'aValue' } } });
      expect(users).toEqual([]);
    })
  );
  test(
    'filter works when there is one dash in field name',
    runner(async ({ context }) => {
      const users = await context.lists.User.findMany({
        where: { single_dash: { equals: 'aValue' } },
      });
      expect(users).toEqual([]);
    })
  );
  test(
    'filter works when there are multiple dashes in field name',
    runner(async ({ context }) => {
      const users = await context.lists.User.findMany({
        where: { many_many_many_dashes: { equals: 'aValue' } },
      });
      expect(users).toEqual([]);
    })
  );
  test(
    'filter works when there are multiple dashes in a row in a field name',
    runner(async ({ context }) => {
      const users = await context.lists.User.findMany({
        where: { multi____dash: { equals: 'aValue' } },
      });
      expect(users).toEqual([]);
    })
  );
  test(
    'filter works when there is one dash in field name as part of a relationship',
    runner(async ({ context }) => {
      const secondaries = await context.lists.SecondaryList.findMany({
        where: { NOT: { someUser: null } },
      });
      expect(secondaries).toEqual([]);
    })
  );
});
