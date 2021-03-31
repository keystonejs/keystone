import { text, integer } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  AdapterName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';
import { createItem } from '@keystone-next/server-side-graphql-client-legacy';

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        Test: list({
          fields: {
            name: text(),
          },
        }),
        Number: list({
          fields: {
            name: integer(),
          },
        }),
        Custom: list({
          fields: {
            other: text(),
          },
          db: { searchField: 'other' },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    test(
      'users',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allTests(
              search: "one",
            ) {
              name
            }
          }
      `,
        });
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([{ name: 'one' }]);
      })
    );

    test(
      'users - case sensitive',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allTests(
              search: "ONE",
            ) {
              name
            }
          }
      `,
        });
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([{ name: 'one' }]);
      })
    );

    test(
      'users - partial case sensitive',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allTests(
              search: "N",
            ) {
              name
            }
          }
      `,
        });
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([{ name: 'one' }]);
      })
    );

    test(
      'users - like escapes',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allTests(
              search: ${JSON.stringify(`%islikelike%`)},
            ) {
              name
            }
          }
      `,
        });
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([{ name: '%islikelike%' }]);
      })
    );

    test(
      'users - regex',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });

        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allTests(
              search: ${JSON.stringify(`/thr(.*)/`)},
            ) {
              name
            }
          }
      `,
        });
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([]); // No results
      })
    );

    test(
      'users - numbers',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allNumbers(
              search: "12345",
            ) {
              name
            }
          }
      `,
        });
        expect(data).toHaveProperty('allNumbers');
        expect(data.allNumbers).toEqual([]); // No results
      })
    );

    test(
      'empty string',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allTests(
              sortBy: name_ASC,
              search: "",
            ) {
              name
            }
          }
      `,
        });
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([
          { name: '%islikelike%' },
          { name: 'one' },
          { name: 'three' },
        ]); // All results
      })
    );
    test(
      'custom',
      runner(setupKeystone, async ({ context }) => {
        const create = async (listKey: string, item: any) => createItem({ context, listKey, item });
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
          create('Custom', { other: 'one' }),
          create('Custom', { other: 'two' }),
        ]);

        const data = await context.graphql.run({
          query: `
          query {
            allCustoms(
              search: "one",
            ) {
              other
            }
          }
      `,
        });
        expect(data).toHaveProperty('allCustoms');
        expect(data.allCustoms).toEqual([{ other: 'one' }]);
      })
    );
  })
);
