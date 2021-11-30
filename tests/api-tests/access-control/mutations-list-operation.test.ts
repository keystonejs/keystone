import { text } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig, expectAccessReturnError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      BadAccess: list({
        fields: { name: text() },
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
    runner(async ({ context }) => {
      // Valid name
      const { data, errors } = await context.graphql.raw({
        query: `query { badAccesses { id } }`,
      });

      // Returns null and throws an error
      expect(data).toEqual({ badAccesses: null });
      expectAccessReturnError(errors, [
        {
          path: ['badAccesses'],
          errors: [{ tag: 'BadAccess.access.operation.query', returned: 'object' }],
        },
      ]);

      // No items should exist
      const _items = await context.sudo().query.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual([]);
    })
  );

  test(
    'createOne - Bad function return value',
    runner(async ({ context }) => {
      // Valid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: BadAccessCreateInput!) { createBadAccess(data: $data) { id } }`,
        variables: { data: { name: 'better' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ createBadAccess: null });
      expectAccessReturnError(errors, [
        {
          path: ['createBadAccess'],
          errors: [{ tag: 'BadAccess.access.operation.create', returned: 'object' }],
        },
      ]);

      // No items should exist
      const _users = await context.sudo().query.BadAccess.findMany({ query: 'id name' });
      expect(_users.map(({ name }) => name)).toEqual([]);
    })
  );

  test(
    'updateOne - Bad function return value',
    runner(async ({ context }) => {
      const item = await context.sudo().query.BadAccess.createOne({ data: { name: 'good' } });

      // Valid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID! $data: BadAccessUpdateInput!) { updateBadAccess(where: { id: $id }, data: $data) { id } }`,
        variables: { id: item.id, data: { name: 'better' } },
      });

      // Returns null and throws an error
      expect(data).toEqual({ updateBadAccess: null });
      expectAccessReturnError(errors, [
        {
          path: ['updateBadAccess'],
          errors: [{ tag: 'BadAccess.access.operation.update', returned: 'object' }],
        },
      ]);

      // Item should have its original name
      const _items = await context.sudo().query.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual(['good']);
    })
  );

  test(
    'deleteOne - Bad function return value',
    runner(async ({ context }) => {
      const item = await context.sudo().query.BadAccess.createOne({ data: { name: 'good' } });

      // Valid name
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($id: ID!) { deleteBadAccess(where: { id: $id }) { id } }`,
        variables: { id: item.id },
      });

      // Returns null and throws an error
      expect(data).toEqual({ deleteBadAccess: null });
      expectAccessReturnError(errors, [
        {
          path: ['deleteBadAccess'],
          errors: [{ tag: 'BadAccess.access.operation.delete', returned: 'object' }],
        },
      ]);

      // Item should have its original name
      const _items = await context.sudo().query.BadAccess.findMany({ query: 'id name' });
      expect(_items.map(({ name }) => name)).toEqual(['good']);
    })
  );
});
