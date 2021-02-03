const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async keystone => {
  const { data, errors } = await keystone.executeGraphQL({
    query: `
      mutation {
        createCompanies(data: [
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } }
        ]) { id }
        createLocations(data: [
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } }
        ]) { id }
      }`,
  });
  expect(errors).toBe(undefined);
  return { locations: data.createLocations, companies: data.createCompanies };
};

const createCompanyAndLocation = async keystone => {
  const {
    data: { createCompany },
    errors,
  } = await keystone.executeGraphQL({
    query: `
      mutation {
        createCompany(data: {
          location: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id location { id } }
      }`,
  });
  expect(errors).toBe(undefined);
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
  const { data, errors } = await keystone.executeGraphQL({
    query: `
      mutation {
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
  const result = await keystone.executeGraphQL({
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
    errors: errors2,
  } = await keystone.executeGraphQL({ query: '{ allLocations { id name } }' });
  expect(errors2).toBe(undefined);
  return {
    companies: [...data.createCompanies, result.data.createCompany],
    locations: allLocations,
  };
};

const getCompanyAndLocation = async (keystone, companyId, locationId) => {
  const { data } = await keystone.executeGraphQL({
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id location { id } }
    Location(where: { id: "${locationId}"} ) { id }
  }`,
  });
  return data;
};

const setupKeystone = adapterName =>
  setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          location: { type: Relationship, ref: 'Location' },
        },
      });
      keystone.createList('Location', {
        fields: {
          name: { type: Text },
        },
      });
    },
  });

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe(`One-to-many relationships`, () => {
      describe('Read', () => {
        test(
          'one',
          runner(setupKeystone, async ({ keystone }) => {
            await createComplexData(keystone);
            await Promise.all(
              [
                ['A', 1],
                ['B', 2],
                ['C', 0],
                ['D', 1],
                ['E', 0],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ allCompanies(where: { location: { name_contains: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
                expect(data.allCompanies.length).toEqual(count);
              })
            );
          })
        );
        test(
          'is_null: true',
          runner(setupKeystone, async ({ keystone }) => {
            await createComplexData(keystone);
            const { data, errors } = await keystone.executeGraphQL({
              query: `{ allCompanies(where: { location_is_null: true }) { id }}`,
            });
            expect(errors).toBe(undefined);
            expect(data.allCompanies.length).toEqual(1);
          })
        );
        test(
          'is_null: false',
          runner(setupKeystone, async ({ keystone }) => {
            await createComplexData(keystone);
            const { data, errors } = await keystone.executeGraphQL({
              query: `{ allCompanies(where: { location_is_null: false }) { id }}`,
            });
            expect(errors).toBe(undefined);
            expect(data.allCompanies.length).toEqual(4);
          })
        );
      });

      describe('Count', () => {
        test(
          'Count',
          runner(setupKeystone, async ({ keystone }) => {
            await createInitialData(keystone);
            const { data, errors } = await keystone.executeGraphQL({
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
            const { data, errors } = await keystone.executeGraphQL({
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
            const { data, errors } = await keystone.executeGraphQL({
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

            const { errors } = await keystone.executeGraphQL({
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
            const { data, errors } = await keystone.executeGraphQL({
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
            const { data, errors } = await keystone.executeGraphQL({
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
            const { data, errors } = await keystone.executeGraphQL({
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
            const { data, errors } = await keystone.executeGraphQL({
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
              const { data, errors } = await keystone.executeGraphQL({
                query: `mutation { deleteCompany(id: "${id}") { id } }`,
              });
              expect(errors).toBe(undefined);
              expect(data.deleteCompany.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const { data, errors } = await keystone.executeGraphQL({
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
                const { data, errors } = await keystone.executeGraphQL({
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
              const { data, errors } = await keystone.executeGraphQL({
                query: `mutation { deleteLocation(id: "${id}") { id } }`,
              });
              expect(errors).toBe(undefined);
              expect(data.deleteLocation.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const { data, errors } = await keystone.executeGraphQL({
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
                const { data, errors } = await keystone.executeGraphQL({
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
  })
);
