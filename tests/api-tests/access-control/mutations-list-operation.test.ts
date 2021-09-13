import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectInternalServerError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      BadAccess: list({
        fields: { name: text({ isFilterable: true, isOrderable: true }) },
        access: {
          operation: {
            // @ts-ignore Intentionally return a filter for testing purposes
            query: () => {
              return { name: { not: { equals: 'bad' } } };
            },
            // @ts-ignore Intentionally return a filter for testing purposes
            create: () => {
              return { name: { not: { equals: 'bad' } } };
            },
            // @ts-ignore Intentionally return a filter for testing purposes
            update: () => {
              return { name: { not: { equals: 'bad' } } };
            },
            // @ts-ignore Intentionally return a filter for testing purposes
            delete: async () => {
              return { name: { not: { startsWtih: 'no delete' } } };
            },
          },
        },
      }),
    },
  }),
});

describe('Access control - Item', () => {
  test(
    'findMany - Bad function return value',
    runner(async ({ context, graphQLRequest }) => {
      // Valid name
      const { body } = await graphQLRequest({
        query: `query { badAccesses { id } }`,
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ badAccesses: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Must return a Boolean from BadAccess.access.operation.query(). Got object',
          path: ['badAccesses'],
        },
      ]);

      // No items should exist
      const _items = await context.sudo().lists.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual([]);
    })
  );

  test(
    'createOne - Bad function return value',
    runner(async ({ context, graphQLRequest }) => {
      // Valid name
      const { body } = await graphQLRequest({
        query: `mutation ($data: BadAccessCreateInput!) { createBadAccess(data: $data) { id } }`,
        variables: { data: { name: 'better' } },
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ createBadAccess: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Must return a Boolean from BadAccess.access.operation.create(). Got object',
          path: ['createBadAccess'],
        },
      ]);

      // No items should exist
      const _users = await context.sudo().lists.BadAccess.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual([]);
    })
  );

  test(
    'updateOne - Bad function return value',
    runner(async ({ context, graphQLRequest }) => {
      const item = await context.sudo().lists.BadAccess.createOne({ data: { name: 'good' } });

      // Valid name
      const { body } = await graphQLRequest({
        query: `mutation ($id: ID! $data: BadAccessUpdateInput!) { updateBadAccess(where: { id: $id }, data: $data) { id } }`,
        variables: { id: item.id, data: { name: 'better' } },
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ updateBadAccess: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Must return a Boolean from BadAccess.access.operation.update(). Got object',
          path: ['updateBadAccess'],
        },
      ]);

      // Item should have its original name
      const _items = await context.sudo().lists.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual(['good']);
    })
  );

  test(
    'deleteOne - Bad function return value',
    runner(async ({ context, graphQLRequest }) => {
      const item = await context.sudo().lists.BadAccess.createOne({ data: { name: 'good' } });

      // Valid name
      const { body } = await graphQLRequest({
        query: `mutation ($id: ID!) { deleteBadAccess(where: { id: $id }) { id } }`,
        variables: { id: item.id },
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ deleteBadAccess: null });
      expectInternalServerError(body.errors, false, [
        {
          message: 'Must return a Boolean from BadAccess.access.operation.delete(). Got object',
          path: ['deleteBadAccess'],
        },
      ]);

      // Item should have its original name
      const _items = await context.sudo().lists.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual(['good']);
    })
  );
});
