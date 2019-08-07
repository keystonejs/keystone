const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone-alpha/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone-alpha/test-utils');

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
          company: { type: Relationship, ref: 'Company.location' },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('update one to one relationship back reference', () => {
      describe('nested connect', () => {
        test(
          'during create mutation',
          runner(setupKeystone, async ({ keystone, create, findById }) => {
            let location = await create('Location', {});
            const { data, errors } = await graphqlRequest({
              keystone,
              query: `
          mutation {
            createCompany(data: {
              location: { connect: { id: "${location.id}" } }
            }) {
              id
              location {
                id
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);

            const companyId = data.createCompany.id;

            location = await findById('Location', location.id);
            const company = await findById('Company', companyId);

            // Everything should now be connected
            expect(company.location.toString()).toBe(location.id.toString());
            expect(location.company.toString()).toBe(companyId.toString());
          })
        );

        test(
          'during update mutation',
          runner(setupKeystone, async ({ keystone, create, findById }) => {
            // Manually setup a connected Company <-> Location
            let location = await create('Location', {});
            let company = await create('Company', {});

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(company.location).not.toBe(expect.anything());
            expect(location.company).not.toBe(expect.anything());

            const { errors } = await graphqlRequest({
              keystone,
              query: `
          mutation {
            updateCompany(
              id: "${company.id}",
              data: {
                location: { connect: { id: "${location.id}" } }
              }
            ) {
              id
              location {
                id
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);

            location = await findById('Location', location.id);
            company = await findById('Company', company.id);

            // Everything should now be connected
            expect(company.location.toString()).toBe(location.id.toString());
            expect(location.company.toString()).toBe(company.id.toString());
          })
        );
      });

      describe('nested create', () => {
        test(
          'during create mutation',
          runner(setupKeystone, async ({ keystone, findById }) => {
            const locationName = sampleOne(alphanumGenerator);
            const { data, errors } = await graphqlRequest({
              keystone,
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

            expect(errors).toBe(undefined);

            const companyId = data.createCompany.id;
            const locationId = data.createCompany.location.id;

            const location = await findById('Location', locationId);
            const company = await findById('Company', companyId);

            // Everything should now be connected
            expect(company.location.toString()).toBe(locationId.toString());
            expect(location.company.toString()).toBe(companyId.toString());
          })
        );

        test(
          'during update mutation',
          runner(setupKeystone, async ({ keystone, create, findById }) => {
            const locationName = sampleOne(alphanumGenerator);
            let company = await create('Company', {});
            const { data, errors } = await graphqlRequest({
              keystone,
              query: `
          mutation {
            updateCompany(
              id: "${company.id}",
              data: {
                location: { create: { name: "${locationName}" } }
              }
            ) {
              id
              location {
                id
                name
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);

            const locationId = data.updateCompany.location.id;

            const location = await findById('Location', locationId);
            company = await findById('Company', company.id);

            // Everything should now be connected
            expect(company.location.toString()).toBe(locationId.toString());
            expect(location.company.toString()).toBe(company.id.toString());
          })
        );
      });

      test(
        'nested disconnect during update mutation',
        runner(setupKeystone, async ({ keystone, create, update, findById }) => {
          // Manually setup a connected Company <-> Location
          let location = await create('Location', {});
          let company = await create('Company', { location: location.id });
          await update('Location', location.id, { company: company.id });

          location = await findById('Location', location.id);
          company = await findById('Company', company.id);

          // Sanity check the links are setup correctly
          expect(company.location.toString()).toBe(location.id.toString());
          expect(location.company.toString()).toBe(company.id.toString());

          // Run the query to disconnect the location from company
          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateCompany(
            id: "${company.id}",
            data: {
              location: { disconnect: { id: "${location.id}" } }
            }
          ) {
            id
            location {
              id
              name
            }
          }
        }
    `,
          });

          expect(errors).toBe(undefined);

          // Check the link has been broken
          location = await findById('Location', location.id);
          company = await findById('Company', company.id);

          expect(company.location).toBe(null);
          expect(location.company).toBe(null);
        })
      );

      test(
        'nested disconnectAll during update mutation',
        runner(setupKeystone, async ({ keystone, create, update, findById }) => {
          // Manually setup a connected Company <-> Location
          let location = await create('Location', {});
          let company = await create('Company', { location: location.id });
          await update('Location', location.id, { company: company.id });

          location = await findById('Location', location.id);
          company = await findById('Company', company.id);

          // Sanity check the links are setup correctly
          expect(company.location.toString()).toBe(location.id.toString());
          expect(location.company.toString()).toBe(company.id.toString());

          // Run the query to disconnect the location from company
          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateCompany(
            id: "${company.id}",
            data: {
              location: { disconnectAll: true }
            }
          ) {
            id
            location {
              id
              name
            }
          }
        }
    `,
          });

          expect(errors).toBe(undefined);

          // Check the link has been broken
          location = await findById('Location', location.id);
          company = await findById('Company', company.id);

          expect(company.location).toBe(null);
          expect(location.company).toBe(null);
        })
      );
    });

    test(
      'one to one relationship back reference on deletes',
      runner(setupKeystone, async ({ keystone, create, update, findById }) => {
        // Manually setup a connected Company <-> Location
        let location = await create('Location', {});
        let company = await create('Company', { location: location.id });
        await update('Location', location.id, { company: company.id });

        location = await findById('Location', location.id);
        company = await findById('Company', company.id);

        // Sanity check the links are setup correctly
        expect(company.location.toString()).toBe(location.id.toString());
        expect(location.company.toString()).toBe(company.id.toString());

        // Run the query to disconnect the location from company
        const { errors } = await graphqlRequest({
          keystone,
          query: `
      mutation {
        deleteCompany(id: "${company.id}") {
          id
        }
      }
  `,
        });

        expect(errors).toBe(undefined);

        // Check the link has been broken
        location = await findById('Location', location.id);
        company = await findById('Company', company.id);

        expect(company).toBe(null);
        expect(location.company).toBe(null);
      })
    );
  })
);
