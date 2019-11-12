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
    locations: { create: [{ name: "${sampleOne(alphanumGenerator)}" }] }
  }) { id locations { id } }
}`,
  });
  const { Company, Location } = await getCompanyAndLocation(
    keystone,
    createCompany.id,
    createCompany.locations[0].id
  );

  // Sanity check the links are setup correctly
  expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id]);
  expect(Location.company.id.toString()).toBe(Company.id.toString());

  return { company: createCompany, location: createCompany.locations[0] };
};

const getCompanyAndLocation = async (keystone, companyId, locationId) => {
  const { data } = await graphqlRequest({
    keystone,
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id locations { id } }
    Location(where: { id: "${locationId}"} ) { id company { id } }
  }`,
  });
  return data;
};

const createReadData = async keystone => {
  // create locations [A, A, B, B, C, C];
  const { data } = await graphqlRequest({
    keystone,
    query: `mutation create($locations: [LocationsCreateInput]) { createLocations(data: $locations) { id name } }`,
    variables: {
      locations: ['A', 'A', 'B', 'B', 'C', 'C'].map(name => ({ data: { name } })),
    },
  });
  const { createLocations } = data;
  await Promise.all(
    Object.entries({
      ABC: [0, 2, 4], //  -> [A, B, C]
      AB: [1, 3], //  -> [A, B]
      C: [5], //  -> [C]
      '': [], //  -> []
    }).map(async ([name, locationIdxs]) => {
      const ids = locationIdxs.map(i => ({ id: createLocations[i].id }));
      const { data } = await graphqlRequest({
        keystone,
        query: `mutation create($locations: [LocationWhereUniqueInput], $name: String) { createCompany(data: {
          name: $name
    locations: { connect: $locations }
  }) { id locations { name }}}`,
        variables: { locations: ids, name },
      });
      return data.createCompany;
    })
  );
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
          locations: { type: Relationship, ref: 'Location.company', many: true },
        },
      });
    const createLocationList = keystone =>
      keystone.createList('Location', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company.locations' },
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

        describe('Read', () => {
          test(
            'one',
            runner(setupKeystone, async ({ keystone }) => {
              await createReadData(keystone);
              await Promise.all(
                [
                  ['A', 5],
                  ['B', 5],
                  ['C', 4],
                  ['D', 0],
                ].map(async ([name, count]) => {
                  const { data } = await graphqlRequest({
                    keystone,
                    query: `{ allLocations(where: { company: { name_contains: "${name}"}}) { id }}`,
                  });
                  expect(data.allLocations.length).toEqual(count);
                })
              );
            })
          );
          test(
            '_some',
            runner(setupKeystone, async ({ keystone }) => {
              await createReadData(keystone);
              await Promise.all(
                [
                  ['A', 2],
                  ['B', 2],
                  ['C', 2],
                  ['D', 0],
                ].map(async ([name, count]) => {
                  const { data } = await graphqlRequest({
                    keystone,
                    query: `{ allCompanies(where: { locations_some: { name: "${name}"}}) { id }}`,
                  });
                  expect(data.allCompanies.length).toEqual(count);
                })
              );
            })
          );
          test(
            '_none',
            runner(setupKeystone, async ({ keystone }) => {
              await createReadData(keystone);
              await Promise.all(
                [
                  ['A', 2],
                  ['B', 2],
                  ['C', 2],
                  ['D', 4],
                ].map(async ([name, count]) => {
                  const { data } = await graphqlRequest({
                    keystone,
                    query: `{ allCompanies(where: { locations_none: { name: "${name}"}}) { id }}`,
                  });
                  expect(data.allCompanies.length).toEqual(count);
                })
              );
            })
          );
          test(
            '_every',
            runner(setupKeystone, async ({ keystone }) => {
              await createReadData(keystone);
              await Promise.all(
                [
                  ['A', 1],
                  ['B', 1],
                  ['C', 2],
                  ['D', 1],
                ].map(async ([name, count]) => {
                  const { data } = await graphqlRequest({
                    keystone,
                    query: `{ allCompanies(where: { locations_every: { name: "${name}"}}) { id }}`,
                  });
                  expect(data.allCompanies.length).toEqual(count);
                })
              );
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
                    locations: { connect: [{ id: "${location.id}" }] }
                  }) { id locations { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.createCompany.locations.map(({ id }) => id.toString())).toEqual([
                location.id,
              ]);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                location.id
              );

              // Everything should now be connected
              expect(data.createCompany.locations.map(({ id }) => id.toString())).toEqual([
                location.id,
              ]);
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
                    locations: { create: [{ name: "${locationName}" }] }
                  }) { id locations { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                data.createCompany.locations[0].id
              );

              // Everything should now be connected
              expect(Company.locations.map(({ id }) => id.toString())).toEqual([
                Location.id.toString(),
              ]);
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
                    locations: { create: [{ name: "${locationName}" company: { connect: { id: "${company.id}" } } }] }
                  }) { id locations { id company { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                data.createCompany.locations[0].id
              );

              // Everything should now be connected
              expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id]);
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const {
                data: { allCompanies },
              } = await graphqlRequest({
                keystone,
                query: `{ allCompanies { id locations { id company { id } } } }`,
              });

              // The nested company should not have a location
              expect(
                allCompanies.filter(({ id }) => id === Company.id)[0].locations[0].company.id
              ).toEqual(Company.id);
              allCompanies
                .filter(({ id }) => id !== Company.id)
                .forEach(company => {
                  expect(company.locations).toEqual([]);
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
                    locations: { create: [{ name: "${locationName}" company: { create: { name: "${companyName}" } } }] }
                  }) { id locations { id company { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                data.createCompany.id,
                data.createCompany.locations[0].id
              );
              // Everything should now be connected
              expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id]);
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              // The nested company should not have a location
              const {
                data: { allCompanies },
              } = await graphqlRequest({
                keystone,
                query: `{ allCompanies { id locations { id company { id } } } }`,
              });
              expect(
                allCompanies.filter(({ id }) => id === Company.id)[0].locations[0].company.id
              ).toEqual(Company.id);
              allCompanies
                .filter(({ id }) => id !== Company.id)
                .forEach(company => {
                  expect(company.locations).toEqual([]);
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
                    data: { locations: { connect: [{ id: "${location.id}" }] } }
                  ) { id locations { id } } }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                company.id,
                location.id
              );
              // Everything should now be connected
              expect(Company.locations.map(({ id }) => id.toString())).toEqual([
                Location.id.toString(),
              ]);
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
                    data: { locations: { create: [{ name: "${locationName}" }] } }
                  ) { id locations { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                keystone,
                company.id,
                data.updateCompany.locations[0].id
              );

              // Everything should now be connected
              expect(Company.locations.map(({ id }) => id.toString())).toEqual([
                Location.id.toString(),
              ]);
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
                    data: { locations: { disconnect: [{ id: "${location.id}" }] } }
                  ) { id locations { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateCompany.id).toEqual(company.id);
              expect(data.updateCompany.locations).toEqual([]);

              // Check the link has been broken
              const result = await getCompanyAndLocation(keystone, company.id, location.id);
              expect(result.Company.locations).toEqual([]);
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
                    data: { locations: { disconnectAll: true } }
                  ) { id locations { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateCompany.id).toEqual(company.id);
              expect(data.updateCompany.locations).toEqual([]);

              // Check the link has been broken
              const result = await getCompanyAndLocation(keystone, company.id, location.id);
              expect(result.Company.locations).toEqual([]);
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
