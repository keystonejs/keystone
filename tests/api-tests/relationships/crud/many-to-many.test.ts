import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import type { ProviderName } from '@keystone-next/test-utils-legacy';
import type { KeystoneContext } from '@keystone-next/types';

type IdType = any;

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async (context: KeystoneContext) => {
  type T = {
    data: { createLocations: { id: IdType }[]; createCompanies: { id: IdType }[] };
    errors: unknown;
  };
  const { data, errors }: T = await context.executeGraphQL({
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

const createCompanyAndLocation = async (context: KeystoneContext) => {
  type T = {
    data: {
      createCompany: { id: IdType; locations: { id: IdType; companies: { id: IdType }[] }[] };
    };
    errors: unknown;
  };
  const {
    data: { createCompany },
    errors,
  }: T = await context.executeGraphQL({
    query: `
      mutation {
        createCompany(data: {
          locations: { create: [{ name: "${sampleOne(alphanumGenerator)}" }] }
        }) { id locations { id companies { id }} }
      }`,
  });
  expect(errors).toBe(undefined);
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
  const { data }: T = await context.executeGraphQL({
    query: `
      {
        Company(where: { id: "${companyId}"} ) { id locations { id } }
        Location(where: { id: "${locationId}"} ) { id companies { id } }
      }`,
  });
  return data;
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C];
  const { data, errors } = await context.executeGraphQL({
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
      const { errors } = await context.executeGraphQL({
        query: `mutation create($locations: [LocationWhereUniqueInput]) { createCompany(data: {
    locations: { connect: $locations }
  }) { id locations { name }}}`,
        variables: { locations: ids },
      });
      expect(errors).toBe(undefined);
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
                const { data, errors } = await context.executeGraphQL({
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
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 4],
                ['C', 6],
                ['D', 9],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
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
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 3],
                ['C', 1],
                ['D', 1],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
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
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { data, errors } = await context.executeGraphQL({
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
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 6],
                ['B', 5],
                ['C', 3],
                ['D', 0],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
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
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 4],
                ['C', 6],
                ['D', 9],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
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
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 3],
                ['B', 3],
                ['C', 1],
                ['D', 1],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
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
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            const location = locations[0];
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { connect: [{ id: "${location.id}" }] }
                  }) { id locations { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);
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
            const { data, errors } = await context.executeGraphQL({
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
              context,
              data.createCompany.id,
              data.createCompany.locations[0].id
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

            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { create: [{ name: "${locationName}" companies: { connect: [{ id: "${company.id}" }] } }] }
                  }) { id locations { id companies { id } } }
                }
            `,
            });
            expect(errors).toBe(undefined);

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
              data: {
                allCompanies: {
                  id: IdType;
                  locations: { id: IdType; companies: { id: IdType }[] }[];
                }[];
              };
              errors: unknown;
            };
            const {
              data: { allCompanies },
              errors: errors2,
            }: T = await context.executeGraphQL({
              query: `{ allCompanies { id locations { id companies { id } } } }`,
            });
            expect(errors2).toBe(undefined);
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

            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createCompany(data: {
                    locations: { create: [{ name: "${locationName}" companies: { create: [{ name: "${companyName}" }] } }] }
                  }) { id locations { id companies { id } } }
                }
            `,
            });
            expect(errors).toBe(undefined);

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
              data: {
                allCompanies: {
                  id: IdType;
                  locations: { id: IdType; companies: { id: IdType }[] }[];
                }[];
              };
              errors: unknown;
            };
            const {
              data: { allCompanies },
              errors: errors2,
            }: T = await context.executeGraphQL({
              query: `{ allCompanies { id locations { id companies { id } } } }`,
            });
            expect(errors2).toBe(undefined);
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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createCompany(data: {
                    locations: null
                  }) { id locations { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);

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
            expect(location.companies).not.toBe(expect.anything());

            const { errors } = await context.executeGraphQL({
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
            const { data, errors } = await context.executeGraphQL({
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
              context,
              company.id,
              data.updateCompany.locations[0].id
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
            const { data, errors } = await context.executeGraphQL({
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
            const { data, errors } = await context.executeGraphQL({
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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { locations: null }
                  ) { id locations { id name } }
                }
            `,
            });
            expect(errors).toBe(undefined);

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
            const { data, errors } = await context.executeGraphQL({
              query: `mutation { deleteCompany(id: "${company.id}") { id } } `,
            });
            expect(errors).toBe(undefined);
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
