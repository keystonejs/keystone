import { AdapterName, testConfig } from '@keystone-next/test-utils-legacy';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
// @ts-ignore
import { getItem } from '@keystone-next/server-side-graphql-client-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        Company: list({
          fields: {
            name: text(),
            location: relationship({ ref: 'Location.company' }),
          },
        }),
        Location: list({
          fields: {
            name: text(),
            // FIXME: We don't actully enforce isRequired.
            // @ts-ignore
            company: relationship({ ref: 'Company.location', isRequired: true }),
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('update one to one relationship back reference', () => {
      test(
        'nested create',
        runner(setupKeystone, async ({ context }) => {
          const locationName = sampleOne(alphanumGenerator);
          const { data, errors } = await context.executeGraphQL({
            query: `
              mutation {
                createCompany(data: {
                  location: { create: { name: "${locationName}" } }
                }) {
                  id
                  location {
                    id
                  }
                }
              }`,
          });

          expect(errors).toBe(undefined);

          const companyId = data.createCompany.id;
          const locationId = data.createCompany.location.id;

          const company = await getItem({
            context,
            listKey: 'Company',
            itemId: companyId,
            returnFields: 'id location { id }',
          });
          // Everything should now be connected. 1:1 has a single connection on the first list defined.
          expect(company.location.id.toString()).toBe(locationId.toString());
        })
      );
    });
  })
);
