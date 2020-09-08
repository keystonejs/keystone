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
          locations: { create: [{ name: "${sampleOne(alphanumGenerator)}" }] }
        }) { id locations { id } }
      }`,
  });
  expect(errors).toBe(undefined);
  const { Company, Location } = await getCompanyAndLocation(
    keystone,
    createCompany.id,
    createCompany.locations[0].id
  );

  // Sanity check the links are setup correctly
  expect(Company.locations.map(({ id }) => id.toString())).toStrictEqual([Location.id.toString()]);

  return { company: createCompany, location: createCompany.locations[0] };
};

const getCompanyAndLocation = async (keystone, companyId, locationId) => {
  const { data } = await keystone.executeGraphQL({
    query: `
      {
        Company(where: { id: "${companyId}"} ) { id locations { id } }
        Location(where: { id: "${locationId}"} ) { id }
      }`,
  });
  return data;
};

const createReadData = async keystone => {
  // create locations [A, A, B, B, C, C];
  const { data, errors } = await keystone.executeGraphQL({
    query: `mutation create($locations: [LocationsCreateInput]) { createLocations(data: $locations) { id name } }`,
    variables: {
      locations: ['A', 'A', 'B', 'B', 'C', 'C'].map(name => ({ data: { name } })),
    },
  });
  expect(errors).toBe(undefined);
  const { createLocations } = data;
  await Promise.all(
    [
      [0, 1, 2, 3, 4, 5], //  -> [A, A, B, B, C, C]
      [0, 2, 4], //  -> [A, B, C]
      [0, 1], //  -> [A, A]
      [0, 2], //  -> [A, B]
      [0, 4], //  -> [A, C]
      [2, 3], //  -> [B, B]
      [0], //  -> [A]
      [2], //  -> [B]
      [], //  -> []
    ].map(async locationIdxs => {
      const ids = locationIdxs.map(i => ({ id: createLocations[i].id }));
      const { data, errors } = await keystone.executeGraphQL({
        query: `mutation create($locations: [LocationWhereUniqueInput]) { createCompany(data: {
    locations: { connect: $locations }
  }) { id locations { name }}}`,
        variables: { locations: ids },
      });
      expect(errors).toBe(undefined);

      return data.createCompany;
    })
  );
};

const setupKeystone = adapterName =>
  setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          locations: { type: Relationship, ref: 'Location', many: true },
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
    describe(`Many-to-many relationships`, () => {
      describe('Read', () => {
        test(
          '_some',
          runner(setupKeystone, async ({ keystone }) => {
            await createReadData(keystone);
            await Promise.all(
              [
                ['A', 6],
                ['B', 5],
                ['C', 3],
                ['D', 0],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ allCompanies(where: { locations_some: { name: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
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
                ['A', 3],
                ['B', 4],
                ['C', 6],
                ['D', 9],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ allCompanies(where: { locations_none: { name: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
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
                ['A', 3],
                ['B', 3],
                ['C', 1],
                ['D', 1],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ allCompanies(where: { locations_every: { name: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
                expect(data.allCompanies.length).toEqual(count);
              })
            );
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

        test(
          '_some',
          runner(setupKeystone, async ({ keystone }) => {
            await createReadData(keystone);
            await Promise.all(
              [
                ['A', 6],
                ['B', 5],
                ['C', 3],
                ['D', 0],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ _allCompaniesMeta(where: { locations_some: { name: "${name}"}}) { count }}`,
                });
                expect(errors).toBe(undefined);
                expect(data._allCompaniesMeta.count).toEqual(count);
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
                ['A', 3],
                ['B', 4],
                ['C', 6],
                ['D', 9],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ _allCompaniesMeta(where: { locations_none: { name: "${name}"}}) { count }}`,
                });
                expect(errors).toBe(undefined);
                expect(data._allCompaniesMeta.count).toEqual(count);
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
                ['A', 3],
                ['B', 3],
                ['C', 1],
                ['D', 1],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ _allCompaniesMeta(where: { locations_every: { name: "${name}"}}) { count }}`,
                });
                expect(errors).toBe(undefined);
                expect(data._allCompaniesMeta.count).toEqual(count);
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
            const { data, errors } = await keystone.executeGraphQL({
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
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([
              Location.id.toString(),
            ]);
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
            expect(company.locations).not.toBe(expect.anything());

            const { errors } = await keystone.executeGraphQL({
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
      });
    });
  })
);
