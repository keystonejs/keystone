import { text } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig, expectExtensionError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      BadAccess: list({
        fields: { name: text() },
        access: {
          filter: {
            query: () => {
              return {
                name: 'blah',
              };
            },
          },
        },
      }),
      Coercion: list({
        fields: { name: text() },
        access: {
          filter: {
            query: () => {
              return { NOT: { name: { equals: 'blah' } } };
            },
          },
        },
      }),
    },
  }),
});

describe('Access control - Filter', () => {
  test(
    'findMany - Bad function return value',
    runner(async ({ context }) => {
      // Valid name
      const { data, errors } = await context.graphql.raw({
        query: `query { badAccesses { id } }`,
      });

      // Returns null and throws an error
      expect(data).toEqual({ badAccesses: null });
      const message =
        'Variable "$where" got invalid value "blah" at "where.name"; Expected type "StringFilter" to be an object.';
      expectExtensionError('dev', false, false, errors, 'Access control', [
        {
          path: ['badAccesses'],
          messages: [`BadAccess.access.filter.query: ${message}`],
          debug: [
            {
              message,
              stacktrace: expect.stringMatching(
                new RegExp(`GraphQLError: ${message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
              ),
            },
          ],
        },
      ]);
    })
  );
  test(
    'findMany - Coercion',
    runner(async ({ context }) => {
      await context.query.Coercion.createMany({ data: [{ name: 'something' }, { name: 'blah' }] });
      expect(await context.query.Coercion.findMany({ query: 'name' })).toEqual([
        { name: 'something' },
      ]);
    })
  );
});
