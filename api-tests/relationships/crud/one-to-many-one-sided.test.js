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

  return { company: createCompany, location: createCompany.location };
};

const createComplexData = async keystone => {
  const { data, errors } = await graphqlRequest({
    keystone,
    query: `mutation {
    createCompanies(data: [
      { data: { name: "A" location: { create: { name: "A" } } } }
      { data: { name: "B" location: { create: { name: "D" } } } }
      { data: { name: "C" location: { create: { name: "B" } } } }
      { data: { name: "E" } }
    ]) { id name location { id name }}
  }`,
  });
  expect(errors).toBe(undefined);
  expect(data.createCompanies[0].name).toEqual('A');
  expect(data.createCompanies[0].location.name).toEqual('A');
  expect(data.createCompanies[1].name).toEqual('B');
  expect(data.createCompanies[1].location.name).toEqual('D');
  expect(data.createCompanies[2].name).toEqual('C');
  expect(data.createCompanies[2].location.name).toEqual('B');
  expect(data.createCompanies[3].name).toEqual('E');
  expect(data.createCompanies[3].location).toBe(null);
  const result = await graphqlRequest({
    keystone,
    query: `mutation {
      createCompany(data: { name: "D" location: { connect: { id: "${data.createCompanies[2].location.id}" } } }) {
        id name location { id name }
      }
      createLocation(data: { name: "C" }) { id name }
    }`,
  });
  expect(result.errors).toBe(undefined);
  expect(result.data.createCompany.name).toEqual('D');
  expect(result.data.createCompany.location.name).toEqual('B');
  expect(result.data.createLocation.name).toEqual('C');

  const {
    data: { allLocations },
  } = await graphqlRequest({ keystone, query: '{ allLocations { id name } }' });

  return {
    companies: [...data.createCompanies, result.data.createCompany],
    locations: allLocations,
  };
};

const getCompanyAndLocation = async (keystone, companyId, locationId) => {
  const { data } = await graphqlRequest({
    keystone,
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id location { id } }
    Location(where: { id: "${locationId}"} ) { id }
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
          location: { type: Relationship, ref: 'Location' },
        },
      });
    const createLocationList = keystone =>
      keystone.createList('Location', {
        fields: {
          name: { type: Text },
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
      describe(`One-to-many relationships - ${order}`, () => {
        function setupKeystone(adapterName) {
          return setupServer({
            adapterName,
            name: `ks5-testdb-${cuid()}`,
            createLists,
          });
        }

        describe('Count', () => {
          test(
            'Count',
            runner(setupKeystone, async ({ keystone }) => {
              await createInitialData(keystone);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                {
                  _allCompaniesMeta { count }
                  _allLocationsMeta { count }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data._allCompaniesMeta.count).toEqual(3);
              expect(data._allLocationsMeta.count).toEqual(3);
            })
          );
        });

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
              expect(data.createCompany.location.id.toString()).toBe(location.id.toString());

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                location.id
              );
              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
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
            })
          );

          ['A', 'B', 'C', 'D', 'E'].forEach(name => {
            test(
              `delete company ${name}`,
              runner(setupKeystone, async ({ keystone }) => {
                // Setup a complex set of data
                const { companies } = await createComplexData(keystone);

                // Delete company {name}
                const id = companies.find(company => company.name === name).id;
                const { data, errors } = await graphqlRequest({
                  keystone,
                  query: `mutation { deleteCompany(id: "${id}") { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data.deleteCompany.id).toBe(id);

                // Check all the companies look how we expect
                await (async () => {
                  const { data, errors } = await graphqlRequest({
                    keystone,
                    query: '{ allCompanies(sortBy: name_ASC) { id name location { id name } } }',
                  });
                  expect(errors).toBe(undefined);

                  const expected = [
                    ['A', 'A'],
                    ['B', 'D'],
                    ['C', 'B'],
                    ['D', 'B'],
                    ['E', null],
                  ].filter(([x]) => x !== name);

                  expect(data.allCompanies[0].name).toEqual(expected[0][0]);
                  expect(data.allCompanies[0].location.name).toEqual(expected[0][1]);
                  expect(data.allCompanies[1].name).toEqual(expected[1][0]);
                  expect(data.allCompanies[1].location.name).toEqual(expected[1][1]);
                  expect(data.allCompanies[2].name).toEqual(expected[2][0]);
                  expect(data.allCompanies[2].location.name).toEqual(expected[2][1]);
                  expect(data.allCompanies[3].name).toEqual(expected[3][0]);
                  if (expected[3][1] === null) {
                    expect(data.allCompanies[3].location).toBe(null);
                  } else {
                    expect(data.allCompanies[2].location.name).toEqual(expected[3][1]);
                  }
                })();

                // Check all the locations look how we expect
                await (async () => {
                  const { data, errors } = await graphqlRequest({
                    keystone,
                    query: '{ allLocations(sortBy: name_ASC) { id name } }',
                  });
                  expect(errors).toBe(undefined);
                  expect(data.allLocations[0].name).toEqual('A');
                  expect(data.allLocations[1].name).toEqual('B');
                  expect(data.allLocations[2].name).toEqual('C');
                  expect(data.allLocations[3].name).toEqual('D');
                })();
              })
            );
          });

          ['A', 'B', 'C', 'D'].forEach(name => {
            test(
              `delete location ${name}`,
              runner(setupKeystone, async ({ keystone }) => {
                // Setup a complex set of data
                const { locations } = await createComplexData(keystone);

                // Delete location {name}
                const id = locations.find(location => location.name === name).id;
                const { data, errors } = await graphqlRequest({
                  keystone,
                  query: `mutation { deleteLocation(id: "${id}") { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data.deleteLocation.id).toBe(id);

                // Check all the companies look how we expect
                await (async () => {
                  const { data, errors } = await graphqlRequest({
                    keystone,
                    query: '{ allCompanies(sortBy: name_ASC) { id name location { id name } } }',
                  });
                  expect(errors).toBe(undefined);
                  expect(data.allCompanies[0].name).toEqual('A');
                  if (name === 'A') {
                    expect(data.allCompanies[0].location).toBe(null);
                  } else {
                    expect(data.allCompanies[0].location.name).toEqual('A');
                  }
                  expect(data.allCompanies[1].name).toEqual('B');
                  if (name === 'D') {
                    expect(data.allCompanies[1].location).toBe(null);
                  } else {
                    expect(data.allCompanies[1].location.name).toEqual('D');
                  }
                  expect(data.allCompanies[2].name).toEqual('C');
                  if (name === 'B') {
                    expect(data.allCompanies[2].location).toBe(null);
                  } else {
                    expect(data.allCompanies[2].location.name).toEqual('B');
                  }
                  expect(data.allCompanies[3].name).toEqual('D');
                  if (name === 'B') {
                    expect(data.allCompanies[3].location).toBe(null);
                  } else {
                    expect(data.allCompanies[3].location.name).toEqual('B');
                  }
                  expect(data.allCompanies[4].name).toEqual('E');
                  expect(data.allCompanies[4].location).toBe(null);
                })();

                // Check all the locations look how we expect
                await (async () => {
                  const { data, errors } = await graphqlRequest({
                    keystone,
                    query: '{ allLocations(sortBy: name_ASC) { id name } }',
                  });
                  expect(errors).toBe(undefined);
                  const expected = ['A', 'B', 'C', 'D'].filter(x => x !== name);
                  expect(data.allLocations[0].name).toEqual(expected[0]);
                  expect(data.allLocations[1].name).toEqual(expected[1]);
                  expect(data.allLocations[2].name).toEqual(expected[2]);
                })();
              })
            );
          });
        });
      });
    });
  })
);
