const { text, relationship } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { multiAdapterRunners, setupFromConfig } = require('@keystone-next/test-utils-legacy');

function setupKeystone(adapterName) {
  return setupFromConfig({
    adapterName,
    config: createSchema({
      lists: {
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
      },
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('filtering on list name', () => {
      test(
        'filter works when there is no dash in list name',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `{ allUsers(where: { noDash: "aValue" })}`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there is one dash in list name',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `{ allUsers(where: { single_dash: "aValue" })}`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there are multiple dashes in list name',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `{ allUsers(where: { many_many_many_dashes: "aValue" })}`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there are multiple dashes in a row in a list name',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `{ allUsers(where: { multi____dash: "aValue" })}`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers', []);
        })
      );
      test(
        'filter works when there is one dash in list name as part of a relationship',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
            query: `{ allSecondaryLists(where: { user_is_null: true })}`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allSecondaryLists', []);
        })
      );
    });
  })
);
