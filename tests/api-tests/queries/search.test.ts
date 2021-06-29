import { text, integer } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
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

test(
  'users',
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });
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
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });
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
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });
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
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });
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
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });

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
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });
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
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });
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
              orderBy: { name: asc },
              search: "",
            ) {
              name
            }
          }
      `,
    });
    expect(data).toHaveProperty('allTests');
    expect(data.allTests).toEqual([{ name: '%islikelike%' }, { name: 'one' }, { name: 'three' }]); // All results
  })
);
test(
  'custom',
  runner(async ({ context }) => {
    const create = async (listKey: string, data: any) => context.lists[listKey].createOne({ data });
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
