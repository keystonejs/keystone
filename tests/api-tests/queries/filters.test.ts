import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  AdapterName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            noDash: text(),
            single_dash: text(),
            many_many_many_dashes: text(),
            multi____dash: text(),
          },
        }),
        SecondaryList: list({
          fields: {
            someUser: relationship({ ref: 'User' }),
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('filtering on list name', () => {
      test(
        'filter works when there is no dash in list name',
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
            query: `{ allUsers(where: { noDash: "aValue" }) { id } }`,
          });
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there is one dash in list name',
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
            query: `{ allUsers(where: { single_dash: "aValue" }) { id } }`,
          });
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there are multiple dashes in list name',
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
            query: `{ allUsers(where: { many_many_many_dashes: "aValue" }) { id } }`,
          });
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there are multiple dashes in a row in a list name',
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
            query: `{ allUsers(where: { multi____dash: "aValue" }) { id } }`,
          });
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there is one dash in list name as part of a relationship',
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
            query: `{ allSecondaryLists(where: { someUser_is_null: true }) { id } }`,
          });
          expect(data).toHaveProperty('allSecondaryLists', []);
        })
      );
    });
  })
);
