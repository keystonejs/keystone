import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../utils';

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
    runner(async ({ graphQLRequest }) => {
      // Valid name
      const { body } = await graphQLRequest({
        query: `query { badAccesses { id } }`,
      });

      // Returns null and throws an error
      expect(body.data).toEqual({ badAccesses: null });
      expect(body.errors).toHaveLength(1);
      expect(body.errors[0].path).toEqual(['badAccesses']);
      expect(body.errors[0].message).toMatchInlineSnapshot(`
"An error occured while running \\"Access control\\".
  - BadAccess.access.filter.query: Variable \\"$where\\" got invalid value \\"blah\\" at \\"where.name\\"; Expected type \\"StringFilter\\" to be an object."
`);
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
