import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import { getItem } from '@keystone-next/server-side-graphql-client-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
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

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('update one to one relationship back reference', () => {
      test(
        'nested create',
        runner(setupKeystone, async ({ context }) => {
          const locationName = sampleOne(alphanumGenerator);
          const data = await context.graphql.run({
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

          const companyId = data.createCompany.id;
          const locationId = data.createCompany.location.id;

          const company = (await getItem({
            context,
            listKey: 'Company',
            itemId: companyId,
            returnFields: 'id location { id }',
          })) as { id: any; location: { id: any } };
          // Everything should now be connected. 1:1 has a single connection on the first list defined.
          expect(company.location.id.toString()).toBe(locationId.toString());
        })
      );
    });
  })
);
