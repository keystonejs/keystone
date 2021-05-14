import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import type { ProviderName } from '@keystone-next/test-utils-legacy';
import type { KeystoneContext } from '@keystone-next/types';

type IdType = any;

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async (context: KeystoneContext) => {
  const companies = await context.lists.Company.createMany({
    data: [
      { data: { name: sampleOne(alphanumGenerator) } },
      { data: { name: sampleOne(alphanumGenerator) } },
      { data: { name: sampleOne(alphanumGenerator) } },
    ],
  });
  const locations = await context.lists.Location.createMany({
    data: [
      { data: { name: sampleOne(alphanumGenerator) } },
      { data: { name: sampleOne(alphanumGenerator) } },
      { data: { name: sampleOne(alphanumGenerator) } },
    ],
  });
  return { locations, companies };
};

const createCompanyAndLocation = async (context: KeystoneContext) => {
  type T = {
    createCompany: { id: IdType; locations: { id: IdType; companies: { id: IdType }[] }[] };
  };
  const { createCompany } = (await context.graphql.run({
    query: `
      mutation {
        createCompany(data: {
          locations: { create: [{ name: "${sampleOne(alphanumGenerator)}" }] }
        }) { id locations { id companies { id }} }
      }`,
  })) as T;
  const { Company, Location } = await getCompanyAndLocation(
    context,
    createCompany.id,
    createCompany.locations[0].id
  );

  // Sanity check the links are setup correctly
  expect(Company.locations[0].id.toString()).toBe(Location.id.toString());
  expect(Location.companies[0].id.toString()).toBe(Company.id.toString());

  return { company: createCompany, location: createCompany.locations[0] };
};

const getCompanyAndLocation = async (
  context: KeystoneContext,
  companyId: IdType,
  locationId: IdType
) => {
  type T = {
    data: {
      Company: { id: IdType; locations: { id: IdType }[] };
      Location: { id: IdType; companies: { id: IdType }[] };
    };
  };
  const { data } = (await context.graphql.raw({
    query: `
      {
        Company(where: { id: "${companyId}"} ) { id locations { id } }
        Location(where: { id: "${locationId}"} ) { id companies { id } }
      }`,
  })) as T;
  return data;
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C];
  const data = await context.graphql.run({
    query: `mutation create($locations: [LocationsCreateInput]) { createLocations(data: $locations) { id name } }`,
    variables: {
      locations: ['A', 'A', 'B', 'B', 'C', 'C'].map(name => ({ data: { name } })),
    },
  });
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
      await context.graphql.run({
        query: `mutation create($locations: [LocationWhereUniqueInput]) { createCompany(data: {
    locations: { connect: $locations }
  }) { id locations { name }}}`,
        variables: { locations: ids },
      });
    })
  );
};

const setupKeystone = (provider: ProviderName) =>
  setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        Company: list({
          fields: {
            name: text(),
            locations: relationship({ ref: 'Location.companies', many: true }),
          },
        }),
        Location: list({
          fields: {
            name: text(),
            companies: relationship({ ref: 'Company.locations', many: true }),
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe(`Many-to-many relationships`, () => {
      describe('Read', () => {
        test(
          '_some',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 6],
                ['B', 5],
                ['C', 3],
                ['D', 0],
              ].map(async ([name, count]) => {
                const data = await context.graphql.run({
                  query: `{ allCompanies(where: { locations_some: { name: "${name}"}}) { id }}`,
                });
                expect(data.allCompanies.length).toEqual(count);
              })
            );
          })
        );
        test(
          '_none',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 4],
                ['C', 6],
                ['D', 9],
              ].map(async ([name, count]) => {
                const data = await context.graphql.run({
                  query: `{ allCompanies(where: { locations_none: { name: "${name}"}}) { id }}`,
                });
                expect(data.allCompanies.length).toEqual(count);
              })
            );
          })
        );
        test(
          '_every',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 3],
                ['C', 1],
                ['D', 1],
              ].map(async ([name, count]) => {
                const data = await context.graphql.run({
                  query: `{ allCompanies(where: { locations_every: { name: "${name}"}}) { id }}`,
                });
                expect(data.allCompanies.length).toEqual(count);
              })
            );
          })
        );
      });

      describe('Count', () => {
        test(
          'Count',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const companiesCount = await context.lists.Company.count();
            const locationsCount = await context.lists.Location.count();
            expect(companiesCount).toEqual(3);
            expect(locationsCount).toEqual(3);
          })
        );
        test(
          '_some',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 6],
                ['B', 5],
                ['C', 3],
                ['D', 0],
              ].map(async ([name, count]) => {
                const _count = await context.lists.Company.count({
                  where: { locations_some: { name } },
                });
                expect(_count).toEqual(count);
              })
            );
          })
        );
        test(
          '_none',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 4],
                ['C', 6],
                ['D', 9],
              ].map(async ([name, count]) => {
                const _count = await context.lists.Company.count({
                  where: { locations_none: { name } },
                });
                expect(_count).toEqual(count);
              })
            );
          })
        );
        test(
          '_every',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 3],
                ['C', 1],
                ['D', 1],
              ].map(async ([name, count]) => {
                const _count = await context.lists.Company.count({
                  where: { locations_every: { name } },
                });
                expect(_count).toEqual(count);
              })
            );
          })
        );
      });

      describe('Create', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            const location = locations[0];
            const data = await context.graphql.run({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { connect: [{ id: "${location.id}" }] }
                  }) { id locations { id } }
                }
            `,
            });
            expect(data.createCompany.locations[0].id.toString()).toEqual(location.id);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createCompany.id,
              location.id
            );

            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([
              Location.id.toString(),
            ]);
            expect(Location.companies.map(({ id }) => id.toString())).toEqual([
              Company.id.toString(),
            ]);
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const locationName = sampleOne(alphanumGenerator);
            const company = await context.lists.Company.createOne({
              data: { locations: { create: [{ name: locationName }] } },
              query: 'id locations { id }',
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              company.locations[0].id
            );

            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([
              Location.id.toString(),
            ]);
            expect(Location.companies.map(({ id }) => id.toString())).toEqual([
              Company.id.toString(),
            ]);
          })
        );

        test(
          'With nested connect',
          runner(setupKeystone, async ({ context }) => {
            const { companies } = await createInitialData(context);
            const company = companies[0];
            const locationName = sampleOne(alphanumGenerator);

            const data = await context.graphql.run({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { create: [{ name: "${locationName}" companies: { connect: [{ id: "${company.id}" }] } }] }
                  }) { id locations { id companies { id } } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createCompany.id,
              data.createCompany.locations[0].id
            );
            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([
              Location.id.toString(),
            ]);
            expect(Location.companies.length).toEqual(2);

            type T = {
              allCompanies: {
                id: IdType;
                locations: { id: IdType; companies: { id: IdType }[] }[];
              }[];
            };

            const { allCompanies } = (await context.graphql.run({
              query: `{ allCompanies { id locations { id companies { id } } } }`,
            })) as T;
            // Both companies should have a location, and the location should have two companies
            const linkedCompanies = allCompanies.filter(
              ({ id }) => id === company.id || id === Company.id
            );
            linkedCompanies.forEach(({ locations }) => {
              expect(locations.map(({ id }) => id)).toEqual([Location.id.toString()]);
            });
            expect(linkedCompanies[0].locations[0].companies.map(({ id }) => id).sort()).toEqual(
              [linkedCompanies[0].id, linkedCompanies[1].id].sort()
            );
          })
        );

        test(
          'With nested create',
          runner(setupKeystone, async ({ context }) => {
            const locationName = sampleOne(alphanumGenerator);
            const companyName = sampleOne(alphanumGenerator);

            const data = await context.graphql.run({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { create: [{ name: "${locationName}" companies: { create: [{ name: "${companyName}" }] } }] }
                  }) { id locations { id companies { id } } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createCompany.id,
              data.createCompany.locations[0].id
            );

            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([
              Location.id.toString(),
            ]);
            expect(Location.companies.length).toEqual(2);

            // Both companies should have a location, and the location should have two companies
            type T = {
              allCompanies: {
                id: IdType;
                locations: { id: IdType; companies: { id: IdType }[] }[];
              }[];
            };
            const { allCompanies } = (await context.graphql.run({
              query: `{ allCompanies { id locations { id companies { id } } } }`,
            })) as T;
            allCompanies.forEach(({ locations }) => {
              expect(locations.map(({ id }) => id)).toEqual([Location.id.toString()]);
            });
            expect(allCompanies[0].locations[0].companies.map(({ id }) => id).sort()).toEqual(
              [allCompanies[0].id, allCompanies[1].id].sort()
            );
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
            const company = await context.lists.Company.createOne({
              data: { locations: null },
              query: 'id locations { id }',
            });

            // Locations should be empty
            expect(company.locations).toHaveLength(0);
          })
        );
      });

      describe('Update', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(company.locations).not.toBe(expect.anything());
            expect(location.companies).not.toBe(expect.anything());

            await context.lists.Company.updateOne({
              id: company.id,
              data: { locations: { connect: [{ id: location.id }] } },
              query: 'id locations { id }',
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              location.id
            );
            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([
              Location.id.toString(),
            ]);
            expect(Location.companies.map(({ id }) => id.toString())).toEqual([
              Company.id.toString(),
            ]);
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const { companies } = await createInitialData(context);
            let company = companies[0];
            const locationName = sampleOne(alphanumGenerator);
            const _company = await context.lists.Company.updateOne({
              id: company.id,
              data: { locations: { create: [{ name: locationName }] } },
              query: 'id locations { id name }',
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              _company.locations[0].id
            );

            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([
              Location.id.toString(),
            ]);
            expect(Location.companies.map(({ id }) => id.toString())).toEqual([
              Company.id.toString(),
            ]);
          })
        );

        test(
          'With disconnect',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { locations: { disconnect: [{ id: "${location.id}" }] } }
                  ) { id locations { id name } }
                }
            `,
            });
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.locations).toEqual([]);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.locations).toEqual([]);
            expect(result.Location.companies).toEqual([]);
          })
        );

        test(
          'With disconnectAll',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { locations: { disconnectAll: true } }
                  ) { id locations { id name } }
                }
            `,
            });
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.locations).toEqual([]);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.locations).toEqual([]);
            expect(result.Location.companies).toEqual([]);
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query with a null operation
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { locations: null }
                  ) { id locations { id name } }
                }
            `,
            });

            // Check that the locations are still there
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.locations).toHaveLength(1);
            expect(data.updateCompany.locations[0].id).toEqual(location.id);
          })
        );
      });

      describe('Delete', () => {
        test(
          'delete',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `mutation { deleteCompany(id: "${company.id}") { id } } `,
            });
            expect(data.deleteCompany.id).toBe(company.id);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company).toBe(null);
            expect(result.Location.companies).toEqual([]);
          })
        );
      });
    });
  })
);
