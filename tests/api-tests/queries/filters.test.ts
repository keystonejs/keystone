import { text, relationship } from '@keystone-next/keystone/fields';
import { createSchema, list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectInternalServerError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      User: list({
        fields: {
          noDash: text({ isFilterable: true, isOrderable: true }),
          single_dash: text({ isFilterable: true }),
          many_many_many_dashes: text({ isFilterable: true }),
          multi____dash: text({ isFilterable: true }),
          email: text({ isIndexed: 'unique', isFilterable: true }),
        },
      }),
      SecondaryList: list({
        fields: {
          someUser: relationship({ ref: 'User', isFilterable: true }),
          otherUsers: relationship({ ref: 'User', isFilterable: true, many: true }),
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

describe('filtering on relationships', () => {
  test(
    'findMany throws error with null relationship query',
    runner(async ({ context, graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: '{ secondaryLists(where: { otherUsers: null }) { id } }',
      });
      // Returns null and throws an error
      expect(body.data).toEqual({ secondaryLists: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'A many relation filter cannot be set to null',
          path: ['secondaryLists'],
        },
      ]);
    })
  );

  test(
    'findMany throws error with null relationship query value',
    runner(async ({ context, graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: '{ secondaryLists(where: { otherUsers: { some: null } }) { id } }',
      });
      // Returns null and throws an error
      expect(body.data).toEqual({ secondaryLists: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'The key "some" in a many relation filter cannot be set to null',
          path: ['secondaryLists'],
        },
      ]);
    })
  );

  test(
    'findMany returns all items with empty relationship query value',
    runner(async ({ context, graphQLRequest }) => {
      await context.lists.SecondaryList.createOne({
        data: { otherUsers: { create: [{ noDash: 'a' }, { noDash: 'b' }] } },
      });
      const { body } = await graphQLRequest({
        query:
          '{ secondaryLists(where: { otherUsers: {} }) { otherUsers(orderBy: { noDash: asc }) { noDash } } }',
      });
      // Returns all the data
      expect(body.errors).toBe(undefined);
      expect(body.data).toEqual({
        secondaryLists: [{ otherUsers: [{ noDash: 'a' }, { noDash: 'b' }] }],
      });
    })
  );
});

describe('searching by unique fields', () => {
  test(
    'findOne works on a unique text field',
    runner(async ({ context }) => {
      const item = await context.lists.User.createOne({ data: { email: 'test@example.com' } });
      const { data, errors } = await context.graphql.raw({
        query: '{ user(where: { email: "test@example.com" }) { id email } }',
      });
      expect(errors).toBe(undefined);
      expect(data).toEqual({ user: { id: item.id, email: 'test@example.com' } });
    })
  );

  test(
    'findOne throws error with zero where values',
    runner(async ({ context, graphQLRequest }) => {
      const { body } = await graphQLRequest({ query: '{ user(where: {}) { id email } }' });
      // Returns null and throws an error
      expect(body.data).toEqual({ user: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Exactly one key must be passed in a unique where input but 0 keys were passed',
          path: ['user'],
        },
      ]);
    })
  );

  test(
    'findOne throws error with more than one where values',
    runner(async ({ context, graphQLRequest }) => {
      const item = await context.lists.User.createOne({ data: { email: 'test@example.com' } });
      const { body } = await graphQLRequest({
        query: `{ user(where: { id: "${item.id}" email: "test@example.com" }) { id email } }`,
      });
      // Returns null and throws an error
      expect(body.data).toEqual({ user: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Exactly one key must be passed in a unique where input but 2 keys were passed',
          path: ['user'],
        },
      ]);
    })
  );

  test(
    'findOne throws error with null where values',
    runner(async ({ context, graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: '{ user(where: { email: null }) { id email } }',
      });
      // Returns null and throws an error
      expect(body.data).toEqual({ user: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'The unique value provided in a unique where input must not be null',
          path: ['user'],
        },
      ]);
    })
  );
});
