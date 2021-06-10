import { testConfig } from '@keystone-next/test-utils-legacy';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import { DatabaseProvider } from '@keystone-next/types';

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(provider: DatabaseProvider) {
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
          const _company = await context.lists.Company.createOne({
            data: { location: { create: { name: locationName } } },
            query: 'id location { id }',
          });

          const companyId = _company.id;
          const locationId = _company.location.id;

          const company = (await context.lists.Company.findOne({
            where: { id: companyId },
            query: 'id location { id }',
          })) as { id: any; location: { id: any } };
          // Everything should now be connected. 1:1 has a single connection on the first list defined.
          expect(company.location.id.toString()).toBe(locationId.toString());
        })
      );
    });
  })
);
