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
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
  });
  const locations = await context.lists.Location.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
  });
  return { locations, companies };
};

const createCompanyAndLocation = async (context: KeystoneContext) => {
  type T = { createCompany: { id: IdType; locations: { id: IdType; company: { id: IdType } }[] } };
  const { createCompany } = (await context.graphql.run({
    query: `
      mutation {
        createCompany(data: {
          locations: { create: [{ name: "${sampleOne(alphanumGenerator)}" }] }
        }) { id locations { id company { id } } }
      }`,
  })) as T;
  const { Company, Location } = await getCompanyAndLocation(
    context,
    createCompany.id,
    createCompany.locations[0].id
  );

  // Sanity check the links are setup correctly
  expect(Company.locations.map(({ id }: { id: IdType }) => id.toString())).toEqual([Location.id]);
  expect(Location.company.id.toString()).toBe(Company.id.toString());

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
      Location: { id: IdType; company: { id: IdType } };
    };
  };
  const { data } = (await context.graphql.raw({
    query: `
      {
        Company(where: { id: "${companyId}"} ) { id locations { id } }
        Location(where: { id: "${locationId}"} ) { id company { id } }
      }`,
  })) as T;
  return data;
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C, D];
  const data = await context.graphql.run({
    query: `mutation create($locations: [LocationCreateInput!]!) { createLocations(data: $locations) { id name } }`,
    variables: {
      locations: ['A', 'A', 'B', 'B', 'C', 'C', 'D'].map(name => ({ name })),
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
      const ids = locationIdxs.map((i: number) => ({ id: createLocations[i].id }));
      await context.graphql.run({
        query: `mutation create($locations: [LocationWhereUniqueInput!]!, $name: String) { createCompany(data: {
          name: $name
    locations: { connect: $locations }
  }) { id locations { name }}}`,
        variables: { locations: ids, name },
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
            locations: relationship({ ref: 'Location.company', many: true }),
          },
        }),
        Location: list({
          fields: {
            name: text(),
            company: relationship({ ref: 'Company.locations' }),
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe(`One-to-many relationships`, () => {
      describe('Read', () => {
        test(
          'one',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 5],
                ['B', 5],
                ['C', 4],
                ['D', 0],
              ].map(async ([name, count]) => {
                const locations = await context.lists.Location.findMany({
                  where: { company: { name: { contains: name } } },
                });
                expect(locations.length).toEqual(count);
              })
            );
          })
        );
        test(
          'is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            const locations = await context.lists.Location.findMany({
              where: { company: { equals: null } },
            });
            expect(locations.length).toEqual(1);
          })
        );
        test(
          'is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            const data = await context.graphql.run({
              query: `{ allLocations(where: { company: { not: { equals: null } } }) { id }}`,
            });
            expect(data.allLocations.length).toEqual(6);
          })
        );
        test(
          '_some',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 2],
                ['B', 2],
                ['C', 2],
                ['D', 0],
              ].map(async ([name, count]) => {
                const companies = await context.lists.Company.findMany({
                  where: { locations: { some: { name: { equals: name } } } },
                });
                expect(companies.length).toEqual(count);
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
                ['A', 2],
                ['B', 2],
                ['C', 2],
                ['D', 4],
              ].map(async ([name, count]) => {
                const companies = await context.lists.Company.findMany({
                  where: { locations: { none: { name: { equals: name } } } },
                });
                expect(companies.length).toEqual(count);
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
                ['A', 1],
                ['B', 1],
                ['C', 2],
                ['D', 1],
              ].map(async ([name, count]) => {
                const companies = await context.lists.Company.findMany({
                  where: { locations: { every: { name: { equals: name } } } },
                });
                expect(companies.length).toEqual(count);
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
      });

      describe('Create', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            const location = locations[0];
            type T = { id: IdType; locations: { id: IdType }[] };
            const company = (await context.lists.Company.createOne({
              data: { locations: { connect: [{ id: location.id }] } },
              query: 'id locations { id }',
            })) as T;

            expect(company.locations.map(({ id }) => id.toString())).toEqual([location.id]);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              location.id
            );

            // Everything should now be connected
            expect(company.locations.map(({ id }) => id.toString())).toEqual([location.id]);
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const locationName = sampleOne(alphanumGenerator);
            const data = await context.graphql.run({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { create: [{ name: "${locationName}" }] }
                  }) { id locations { id } }
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
            expect(Location.company.id.toString()).toBe(Company.id.toString());
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
                    locations: { create: [{ name: "${locationName}" company: { connect: { id: "${company.id}" } } }] }
                  }) { id locations { id company { id } } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createCompany.id,
              data.createCompany.locations[0].id
            );

            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id]);
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            type T = {
              allCompanies: {
                id: IdType;
                locations: { id: IdType; company: { id: IdType } }[];
              }[];
            };
            const { allCompanies } = (await context.graphql.run({
              query: `{ allCompanies { id locations { id company { id } } } }`,
            })) as T;
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
          runner(setupKeystone, async ({ context }) => {
            const locationName = sampleOne(alphanumGenerator);
            const companyName = sampleOne(alphanumGenerator);

            const data = await context.graphql.run({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { create: [{ name: "${locationName}" company: { create: { name: "${companyName}" } } }] }
                  }) { id locations { id company { id } } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createCompany.id,
              data.createCompany.locations[0].id
            );
            // Everything should now be connected
            expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id]);
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            // The nested company should not have a location
            type T = {
              allCompanies: {
                id: IdType;
                locations: { id: IdType; company: { id: IdType } }[];
              }[];
            };
            const { allCompanies } = (await context.graphql.run({
              query: `{ allCompanies { id locations { id company { id } } } }`,
            })) as T;
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
          'With null',
          runner(setupKeystone, async ({ context }) => {
            const data = await context.graphql.run({
              query: `
                mutation {
                  createCompany(data: {
                    locations: null
                  }) { id locations { id } }
                }
            `,
            });

            // Locations should be empty
            expect(data.createCompany.locations).toHaveLength(0);
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
            expect(location.company).not.toBe(expect.anything());

            await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    where: { id: "${company.id}" },
                    data: { locations: { connect: [{ id: "${location.id}" }] } }
                  ) { id locations { id } } }
            `,
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
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const { companies } = await createInitialData(context);
            let company = companies[0];
            const locationName = sampleOne(alphanumGenerator);
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    where: { id: "${company.id}" } ,
                    data: { locations: { create: [{ name: "${locationName}" }] } }
                  ) { id locations { id name } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
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
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    where: { id: "${company.id}" },
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
            expect(result.Location.company).toBe(null);
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
                    where: { id: "${company.id}" },
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
            expect(result.Location.company).toBe(null);
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
                    where: { id: "${company.id}" },
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
            expect(result.Location.company).toBe(null);
          })
        );
      });
    });
  })
);
