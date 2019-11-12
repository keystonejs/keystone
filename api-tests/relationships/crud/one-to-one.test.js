const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

jest.setTimeout(6000000);

const createInitialData = async keystone => {
  const { data } = await graphqlRequest({
    keystone,
    query: `
mutation {
  createCompanies(data: [{ data: { name: "${sampleOne(
    alphanumGenerator
  )}" } }, { data: { name: "${sampleOne(alphanumGenerator)}" } }, { data: { name: "${sampleOne(
      alphanumGenerator
    )}" } }]) { id }
  createLocations(data: [{ data: { name: "${sampleOne(
    alphanumGenerator
  )}" } }, { data: { name: "${sampleOne(alphanumGenerator)}" } }, { data: { name: "${sampleOne(
      alphanumGenerator
    )}" } }]) { id }
}
`,
  });
  return { locations: data.createLocations, companies: data.createCompanies };
};

const createCompanyAndLocation = async keystone => {
  const {
    data: { createCompany },
  } = await graphqlRequest({
    keystone,
    query: `
mutation {
  createCompany(data: {
    location: { create: { name: "${sampleOne(alphanumGenerator)}" } }
  }) { id location { id } }
}`,
  });
  const { Company, Location } = await getCompanyAndLocation(
    keystone,
    createCompany.id,
    createCompany.location.id
  );

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString());
  expect(Location.company.id.toString()).toBe(Company.id.toString());

  return { company: createCompany, location: createCompany.location };
};

const getCompanyAndLocation = async (keystone, companyId, locationId) => {
  const { data } = await graphqlRequest({
    keystone,
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id location { id } }
    Location(where: { id: "${locationId}"} ) { id company { id } }
  }`,
  });
  return data;
};

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    // 1:1 relationships are symmetric in how they behave, but
    // are (in general) implemented in a non-symmetric way. For example,
    // in postgres we may decide to store a single foreign key on just
    // one of the tables involved. As such, we want to ensure that our
    // tests work correctly no matter which side of the relationship is
    // defined first.
    const createCompanyList = keystone =>
      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          location: { type: Relationship, ref: 'Location.company' },
        },
      });
    const createLocationList = keystone =>
      keystone.createList('Location', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company.location' },
        },
      });

    const createListsLR = keystone => {
      createCompanyList(keystone);
      createLocationList(keystone);
    };
    const createListsRL = keystone => {
      createLocationList(keystone);
      createCompanyList(keystone);
    };

    [
      [createListsLR, 'Left -> Right'],
      [createListsRL, 'Right -> Left'],
    ].forEach(([createLists, order]) => {
      describe(`One-to-one relationships - ${order}`, () => {
        function setupKeystone(adapterName) {
          return setupServer({
            adapterName,
            name: `ks5-testdb-${cuid()}`,
            createLists,
          });
        }

        describe('Create', () => {
          test(
            'With connect',
            runner(setupKeystone, async ({ keystone }) => {
              const { locations } = await createInitialData(keystone);
              const location = locations[0];
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createCompany(data: {
                    location: { connect: { id: "${location.id}" } }
                  }) { id location { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.createCompany.location.id.toString()).toEqual(location.id);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                location.id
              );
              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());
            })
          );

          test(
            'With create',
            runner(setupKeystone, async ({ keystone }) => {
              const locationName = sampleOne(alphanumGenerator);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createCompany(data: {
                    location: { create: { name: "${locationName}" } }
                  }) { id location { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                data.createCompany.location.id
              );

              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());
            })
          );

          test(
            'With nested connect',
            runner(setupKeystone, async ({ keystone }) => {
              const { companies } = await createInitialData(keystone);
              const company = companies[0];
              const locationName = sampleOne(alphanumGenerator);

              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createCompany(data: {
                    location: { create: { name: "${locationName}" company: { connect: { id: "${company.id}" } } } }
                  }) { id location { id company { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                data.createCompany.location.id
              );
              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const {
                data: { allCompanies },
              } = await graphqlRequest({
                keystone,
                query: `{ allCompanies { id location { id company { id }} } }`,
              });

              // The nested company should not have a location
              expect(
                allCompanies.filter(({ id }) => id === Company.id)[0].location.company.id
              ).toEqual(Company.id);
              allCompanies
                .filter(({ id }) => id !== Company.id)
                .forEach(company => {
                  expect(company.location).toBe(null);
                });
            })
          );

          test(
            'With nested create',
            runner(setupKeystone, async ({ keystone }) => {
              const locationName = sampleOne(alphanumGenerator);
              const companyName = sampleOne(alphanumGenerator);

              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createCompany(data: {
                    location: { create: { name: "${locationName}" company: { create: { name: "${companyName}" } } } }
                  }) { id location { id company { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                data.createCompany.location.id
              );
              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              // The nested company should not have a location
              const {
                data: { allCompanies },
              } = await graphqlRequest({
                keystone,
                query: `{ allCompanies { id location { id company { id }} } }`,
              });
              expect(
                allCompanies.filter(({ id }) => id === Company.id)[0].location.company.id
              ).toEqual(Company.id);
              allCompanies
                .filter(({ id }) => id !== Company.id)
                .forEach(company => {
                  expect(company.location).toBe(null);
                });
            })
          );
        });

        describe('Update', () => {
          test(
            'With connect',
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { location, company } = await createCompanyAndLocation(keystone);

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
                    data: { location: { connect: { id: "${location.id}" } } }
                  ) { id location { id } } }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                company.id,
                location.id
              );
              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());
            })
          );

          test(
            'With create',
            runner(setupKeystone, async ({ keystone }) => {
              const { companies } = await createInitialData(keystone);
              let company = companies[0];
              const locationName = sampleOne(alphanumGenerator);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { location: { create: { name: "${locationName}" } } }
                  ) { id location { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                company.id,
                data.updateCompany.location.id
              );

              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());
            })
          );

          test(
            'With disconnect',
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { location, company } = await createCompanyAndLocation(keystone);

              // Run the query to disconnect the location from company
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { location: { disconnect: { id: "${location.id}" } } }
                  ) { id location { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateCompany.id).toEqual(company.id);
              expect(data.updateCompany.location).toBe(null);

              // Check the link has been broken
              const result = await getCompanyAndLocation(keystone, company.id, location.id);
              expect(result.Company.location).toBe(null);
              expect(result.Location.company).toBe(null);
            })
          );

          test(
            'With disconnectAll',
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { location, company } = await createCompanyAndLocation(keystone);

              // Run the query to disconnect the location from company
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { location: { disconnectAll: true } }
                  ) { id location { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateCompany.id).toEqual(company.id);
              expect(data.updateCompany.location).toBe(null);

              // Check the link has been broken
              const result = await getCompanyAndLocation(keystone, company.id, location.id);
              expect(result.Company.location).toBe(null);
              expect(result.Location.company).toBe(null);
            })
          );
        });

        describe('Delete', () => {
          test(
            'delete',
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { location, company } = await createCompanyAndLocation(keystone);

              // Run the query to disconnect the location from company
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `mutation { deleteCompany(id: "${company.id}") { id } } `,
              });
              expect(errors).toBe(undefined);
              expect(data.deleteCompany.id).toBe(company.id);

              // Check the link has been broken
              const result = await getCompanyAndLocation(keystone, company.id, location.id);
              expect(result.Company).toBe(null);
              expect(result.Location.company).toBe(null);
            })
          );
        });
      });
    });
  })
);
