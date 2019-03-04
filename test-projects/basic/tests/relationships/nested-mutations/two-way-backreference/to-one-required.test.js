const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@voussoir/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@voussoir/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

jest.setTimeout(6000000);

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          location: { type: Relationship, ref: 'Location.company' },
        },
      });

      keystone.createList('Location', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company.location', isRequired: true },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('update one to one relationship back reference', () => {
      test(
        'nested create',
        runner(setupKeystone, async ({ server: { server }, findById }) => {
          const locationName = sampleOne(alphanumGenerator);
          const queryResult = await graphqlRequest({
            server,
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
        }
    `,
          });

          expect(queryResult.body).not.toHaveProperty('errors');

          const companyId = queryResult.body.data.createCompany.id;
          const locationId = queryResult.body.data.createCompany.location.id;

          const location = await findById('Location', locationId);
          const company = await findById('Company', companyId);

          // Everything should now be connected
          expect(company.location.toString()).toBe(locationId.toString());
          expect(location.company.toString()).toBe(companyId.toString());
        })
      );
    });
  })
);
