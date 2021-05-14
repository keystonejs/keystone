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
      { name: sampleOne(alphanumGenerator) },
    ],
  });
  return { locations, companies };
};

const createCompanyAndLocation = async (context: KeystoneContext) => {
  type T = {
    createCompany: {
      id: IdType;
      name: string;
      location: { id: IdType; name: string; company: { id: IdType } };
    };
  };

  const { createCompany } = (await context.graphql.run({
    query: `
      mutation {
        createCompany(data: {
          name: "${sampleOne(alphanumGenerator)}"
          location: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id name location { id name company { id } } }
      }`,
  })) as T;
  const { Company, Location } = await getCompanyAndLocation(
    context,
    createCompany.id,
    createCompany.location.id
  );

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString());
  expect(Location.company.id.toString()).toBe(Company.id.toString());

  return { company: createCompany, location: createCompany.location };
};

const createLocationAndCompany = async (context: KeystoneContext) => {
  type T = {
    createLocation: {
      id: IdType;
      name: string;
      company: { id: IdType; name: string; location: { id: IdType } };
    };
  };

  const { createLocation } = (await context.graphql.run({
    query: `
      mutation {
        createLocation(data: {
          name: "${sampleOne(alphanumGenerator)}"
          company: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id name company { id name location { id } } }
      }`,
  })) as T;
  const { Company, Location } = await getCompanyAndLocation(
    context,
    createLocation.company.id,
    createLocation.id
  );

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString());
  expect(Location.company.id.toString()).toBe(Company.id.toString());

  return { location: createLocation, company: createLocation.company };
};

const getCompanyAndLocation = async (
  context: KeystoneContext,
  companyId: IdType,
  locationId: IdType
) => {
  type T = {
    data: {
      Company: { id: IdType; location: { id: IdType } };
      Location: { id: IdType; company: { id: IdType } };
    };
  };
  const { data } = (await context.graphql.raw({
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id location { id } }
    Location(where: { id: "${locationId}"} ) { id company { id } }
  }`,
  })) as T;
  return data;
};

const setupKeystone = (provider: ProviderName) =>
  setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        Company: list({
          fields: {
            name: text(),
            location: relationship({ ref: 'Location.company' }),
          },
        }),
        Location: list({
          fields: {
            name: text(),
            company: relationship({ ref: 'Company.location' }),
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe(`One-to-one relationships`, () => {
      describe('Read', () => {
        test(
          'Where A',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { location, company } = await createCompanyAndLocation(context);
            const data = await context.graphql.run({
              query: `{
                  allLocations(where: { company: { name: { equals: "${company.name}"} } }) { id }
                  allCompanies(where: { location: { name: { equals: "${location.name}"} } }) { id }
                }`,
            });
            expect(data.allLocations.length).toEqual(1);
            expect(data.allLocations[0].id).toEqual(location.id);
            expect(data.allCompanies.length).toEqual(1);
            expect(data.allCompanies[0].id).toEqual(company.id);
          })
        );
        test(
          'Where B',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { location, company } = await createLocationAndCompany(context);
            const locations = await context.lists.Location.findMany({
              where: { company: { name: { equals: company.name } } },
            });
            const companies = await context.lists.Company.findMany({
              where: { location: { name: { equals: location.name } } },
            });
            expect(locations.length).toEqual(1);
            expect(locations[0].id).toEqual(location.id);
            expect(companies.length).toEqual(1);
            expect(companies[0].id).toEqual(company.id);
          })
        );
        test(
          'Where A: is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createCompanyAndLocation(context);
            const locations = await context.lists.Location.findMany({
              where: { company_is_null: true },
            });
            const companies = await context.lists.Company.findMany({
              where: { location_is_null: true },
            });
            expect(locations.length).toEqual(4);
            expect(companies.length).toEqual(3);
          })
        );
        test(
          'Where B: is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createLocationAndCompany(context);
            const locations = await context.lists.Location.findMany({
              where: { company_is_null: true },
            });
            const companies = await context.lists.Company.findMany({
              where: { location_is_null: true },
            });
            expect(locations.length).toEqual(4);
            expect(companies.length).toEqual(3);
          })
        );
        test(
          'Where A: is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createCompanyAndLocation(context);
            const data = await context.graphql.run({
              query: `{
                  allLocations(where: { company_is_null: false }) { id }
                  allCompanies(where: { location_is_null: false }) { id }
                }`,
            });
            expect(data.allLocations.length).toEqual(1);
            expect(data.allCompanies.length).toEqual(1);
          })
        );
        test(
          'Where B: is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createLocationAndCompany(context);
            const data = await context.graphql.run({
              query: `{
                  allLocations(where: { company_is_null: false }) { id }
                  allCompanies(where: { location_is_null: false }) { id }
                }`,
            });
            expect(data.allLocations.length).toEqual(1);
            expect(data.allCompanies.length).toEqual(1);
          })
        );

        test(
          'Count',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const companiesCount = await context.lists.Company.count();
            const locationsCount = await context.lists.Location.count();
            expect(companiesCount).toEqual(3);
            expect(locationsCount).toEqual(4);
          })
        );

        test(
          'Where with count A',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { location, company } = await createCompanyAndLocation(context);
            const locationsCount = await context.lists.Location.count({
              where: { company: { name: { equals: company.name } } },
            });
            const companiesCount = await context.lists.Company.count({
              where: { location: { name: { equals: location.name } } },
            });
            expect(companiesCount).toEqual(1);
            expect(locationsCount).toEqual(1);
          })
        );
        test(
          'Where with count B',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { location, company } = await createLocationAndCompany(context);
            const locationsCount = await context.lists.Location.count({
              where: { company: { name: { equals: company.name } } },
            });
            const companiesCount = await context.lists.Company.count({
              where: { location: { name: { equals: location.name } } },
            });
            expect(companiesCount).toEqual(1);
            expect(locationsCount).toEqual(1);
          })
        );
        test(
          'Where null with count A',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createCompanyAndLocation(context);
            const locationsCount = await context.lists.Location.count({
              where: { company_is_null: true },
            });
            const companiesCount = await context.lists.Company.count({
              where: { location_is_null: true },
            });
            expect(companiesCount).toEqual(3);
            expect(locationsCount).toEqual(4);
          })
        );
        test(
          'Where null with count B',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createLocationAndCompany(context);
            const locationsCount = await context.lists.Location.count({
              where: { company_is_null: true },
            });
            const companiesCount = await context.lists.Company.count({
              where: { location_is_null: true },
            });
            expect(companiesCount).toEqual(3);
            expect(locationsCount).toEqual(4);
          })
        );
      });

      describe('Create', () => {
        test(
          'With connect A',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            const location = locations[0];
            const company = await context.lists.Company.createOne({
              data: { location: { connect: { id: location.id } } },
              query: 'id location { id }',
            });
            expect(company.location.id.toString()).toEqual(location.id);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With connect B',
          runner(setupKeystone, async ({ context }) => {
            const { companies } = await createInitialData(context);
            const company = companies[0];
            const location = await context.lists.Location.createOne({
              data: { company: { connect: { id: company.id } } },
              query: 'id company { id }',
            });
            expect(location.company.id.toString()).toEqual(company.id);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With create A',
          runner(setupKeystone, async ({ context }) => {
            const locationName = sampleOne(alphanumGenerator);
            const company = await context.lists.Company.createOne({
              data: { location: { create: { name: locationName } } },
              query: 'id location { id }',
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              company.location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With create B',
          runner(setupKeystone, async ({ context }) => {
            const companyName = sampleOne(alphanumGenerator);
            const location = await context.lists.Location.createOne({
              data: { company: { create: { name: companyName } } },
              query: 'id company { id }',
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              location.company.id,
              location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With nested connect A',
          runner(setupKeystone, async ({ context }) => {
            const { companies } = await createInitialData(context);
            const company = companies[0];
            const locationName = sampleOne(alphanumGenerator);

            const _company = await context.lists.Company.createOne({
              data: {
                location: {
                  create: { name: locationName, company: { connect: { id: company.id } } },
                },
              },
              query: 'id location { id company { id } }',
            });
            const { Company, Location } = await getCompanyAndLocation(
              context,
              _company.id,
              _company.location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            type T = {
              allCompanies: { id: IdType; location: { id: IdType; company: { id: IdType } } }[];
            };

            const { allCompanies } = (await context.graphql.run({
              query: `{ allCompanies { id location { id company { id }} } }`,
            })) as T;
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
          'With nested connect B',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            const location = locations[0];
            const companyName = sampleOne(alphanumGenerator);

            const data = await context.graphql.run({
              query: `
                mutation {
                  createLocation(data: {
                    company: { create: { name: "${companyName}" location: { connect: { id: "${location.id}" } } } }
                  }) { id company { id location { id } } }
                }`,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createLocation.company.id,
              data.createLocation.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            const allLocations = await context.lists.Location.findMany({
              query: 'id company { id location { id } }',
            });
            // The nested company should not have a location
            expect(
              allLocations.filter(({ id }) => id === Location.id)[0].company.location.id
            ).toEqual(Location.id);
            allLocations
              .filter(({ id }) => id !== Location.id)
              .forEach(location => {
                expect(location.company).toBe(null);
              });
          })
        );

        test(
          'With nested create',
          runner(setupKeystone, async ({ context }) => {
            const locationName = sampleOne(alphanumGenerator);
            const companyName = sampleOne(alphanumGenerator);

            const company = await context.lists.Company.createOne({
              data: {
                location: {
                  create: { name: locationName, company: { create: { name: companyName } } },
                },
              },
              query: 'id location { id company { id } }',
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              company.location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            // The nested company should not have a location
            type T = {
              allCompanies: { id: IdType; location: { id: IdType; company: { id: IdType } } }[];
            };
            const { allCompanies } = (await context.graphql.run({
              query: `{ allCompanies { id location { id company { id }} } }`,
            })) as T;
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
          'Dual create A',
          runner(setupKeystone, async ({ context }) => {
            // Create a Location
            const location = await context.lists.Location.createOne({
              data: { name: sampleOne(alphanumGenerator) },
            });

            // Create a Company pointing to Location
            const company1 = await context.lists.Company.createOne({
              data: {
                name: sampleOne(alphanumGenerator),
                location: { connect: { id: location.id } },
              },
              query: 'id location { id }',
            });

            // Create another Company pointing to Location
            const company2 = await context.lists.Company.createOne({
              data: {
                name: sampleOne(alphanumGenerator),
                location: { connect: { id: location.id } },
              },
              query: 'id location { id }',
            });

            // Make sure the original Company does not point to the location
            const result = await context.lists.Location.findMany({
              query: 'id name company { id }',
            });
            expect(result).toHaveLength(1);

            const result1 = await context.lists.Company.findOne({
              where: { id: company1.id },
              query: 'id location { id }',
            });
            expect(result1?.location).toBe(null);

            const result2 = await context.lists.Company.findOne({
              where: { id: company2.id },
              query: 'id location { id }',
            });
            expect(result2?.location).toEqual({ id: location.id });
          })
        );
        test(
          'Dual create B',
          runner(setupKeystone, async ({ context }) => {
            // Create a Company
            const company = await context.lists.Company.createOne({
              data: { name: sampleOne(alphanumGenerator) },
            });

            // Create a Location pointing to Company
            const location1 = await context.lists.Location.createOne({
              data: {
                name: sampleOne(alphanumGenerator),
                company: { connect: { id: company.id } },
              },
              query: 'id company { id }',
            });

            // Create another Location pointing to Company
            const location2 = await context.lists.Location.createOne({
              data: {
                name: sampleOne(alphanumGenerator),
                company: { connect: { id: company.id } },
              },
              query: 'id company { id }',
            });

            // Make sure the original Company does not point to the location
            const result = await context.lists.Company.findMany({ query: 'id location { id }' });
            expect(result).toHaveLength(1);

            const result1 = await context.lists.Location.findOne({
              where: { id: location1.id },
              query: 'id company { id }',
            });
            expect(result1?.company).toBe(null);

            const result2 = await context.lists.Location.findOne({
              where: { id: location2.id },
              query: 'id company { id }',
            });
            expect(result2?.company).toEqual({ id: company.id });
          })
        );

        test(
          'With null A',
          runner(setupKeystone, async ({ context }) => {
            const data = await context.graphql.run({
              query: `
                mutation {
                  createCompany(data: {
                    location: null
                  }) { id location { id } }
                }
            `,
            });

            // Location should be empty
            expect(data.createCompany.location).toBe(null);
          })
        );

        test(
          'With null B',
          runner(setupKeystone, async ({ context }) => {
            const data = await context.graphql.run({
              query: `
                mutation {
                  createLocation(data: {
                    company: null
                  }) { id company { id } }
                }
            `,
            });

            // Company should be empty
            expect(data.createLocation.company).toBe(null);
          })
        );
      });

      describe('Update', () => {
        test(
          'With connect A',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(company.location).not.toBe(expect.anything());
            expect(location.company).not.toBe(expect.anything());

            await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    where: { id: "${company.id}" },
                    data: { location: { connect: { id: "${location.id}" } } }
                  ) { id location { id } } }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With connect B',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(context);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(company.location).not.toBe(expect.anything());
            expect(location.company).not.toBe(expect.anything());

            await context.graphql.run({
              query: `
                mutation {
                  updateLocation(
                    where: { id: "${location.id}" },
                    data: { company: { connect: { id: "${company.id}" } } }
                  ) { id company { id } } }`,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );
        test(
          'With create A',
          runner(setupKeystone, async ({ context }) => {
            const { companies } = await createInitialData(context);
            let company = companies[0];
            const locationName = sampleOne(alphanumGenerator);
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    where: { id: "${company.id}" },
                    data: { location: { create: { name: "${locationName}" } } }
                  ) { id location { id name } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              data.updateCompany.location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With create B',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            let location = locations[0];
            const companyName = sampleOne(alphanumGenerator);
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateLocation(
                    where: { id: "${location.id}" },
                    data: { company: { create: { name: "${companyName}" } } }
                  ) { id company { id name } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.updateLocation.company.id,
              location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With recreate A',
          runner(setupKeystone, async ({ context }) => {
            // To begin with, nothing is linked
            const { companies } = await createInitialData(context);
            let company = companies[0];

            // Update company.location to be a new thing.
            const locationName = sampleOne(alphanumGenerator);
            const _company = await context.lists.Company.updateOne({
              id: company.id,
              data: { location: { create: { name: locationName } } },
              query: 'id location { id name }',
            });
            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              _company.location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            // Keep track of the original location!
            const originalLocationId = Location.id;
            await (async () => {
              const locationName = sampleOne(alphanumGenerator);
              const data = await context.graphql.run({
                query: `
                  mutation {
                    updateCompany(
                      where: { id: "${company.id}" },
                      data: { location: { create: { name: "${locationName}" } } }
                    ) { id location { id name } }
                  }
              `,
              });

              const { Company, Location } = await getCompanyAndLocation(
                context,
                company.id,
                data.updateCompany.location.id
              );

              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const data2 = await context.lists.Location.findOne({
                where: { id: originalLocationId },
                query: 'id company { id }',
              });
              expect(data2.company).toBe(null);
            })();
          })
        );

        test(
          'With recreate B',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            let location = locations[0];
            const companyName = sampleOne(alphanumGenerator);
            const _location = await context.lists.Location.updateOne({
              id: location.id,
              data: { company: { create: { name: companyName } } },
              query: 'id company { id name }',
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              _location.company.id,
              location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            const originalCompanyId = Company.id;
            await (async () => {
              const companyName = sampleOne(alphanumGenerator);
              const data = await context.graphql.run({
                query: `
                  mutation {
                    updateLocation(
                      where: { id: "${location.id}" },
                      data: { company: { create: { name: "${companyName}" } } }
                    ) { id company { id name } }
                  }
              `,
              });

              const { Company, Location } = await getCompanyAndLocation(
                context,
                data.updateLocation.company.id,
                location.id
              );

              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const data2 = await context.graphql.run({
                query: `{ Company(where: { id: "${originalCompanyId}" }) { id location { id } } }`,
              });
              expect(data2.Company.location).toBe(null);
            })();
          })
        );

        test(
          'With disconnect A',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    where: { id: "${company.id}" },
                    data: { location: { disconnect: { id: "${location.id}" } } }
                  ) { id location { id name } }
                }
            `,
            });
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.location).toBe(null);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location.company).toBe(null);
          })
        );

        test(
          'With disconnect B',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(context);

            // Run the query to disconnect the location from company
            const _location = await context.lists.Location.updateOne({
              id: location.id,
              data: { company: { disconnect: { id: company.id } } },
              query: 'id company { id name }',
            });

            expect(_location.id).toEqual(location.id);
            expect(_location.company).toBe(null);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location.company).toBe(null);
          })
        );
        test(
          'With disconnectAll A',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query to disconnect the location from company
            const _company = await context.lists.Company.updateOne({
              id: company.id,
              data: { location: { disconnectAll: true } },
              query: 'id location { id name }',
            });
            expect(_company.id).toEqual(company.id);
            expect(_company.location).toBe(null);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location.company).toBe(null);
          })
        );

        test(
          'With disconnectAll B',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(context);

            // Run the query to disconnect the location from company
            const _location = await context.lists.Location.updateOne({
              id: location.id,
              data: { company: { disconnectAll: true } },
              query: 'id company { id name }',
            });
            expect(_location.id).toEqual(location.id);
            expect(_location.company).toBe(null);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location.company).toBe(null);
          })
        );

        test(
          'With null A',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query with a null operation
            const _company = await context.lists.Company.updateOne({
              id: company.id,
              data: { location: null },
              query: 'id location { id name }',
            });

            // Check that the location is still there
            expect(_company.id).toEqual(company.id);
            expect(_company.location).not.toBe(null);
            expect(_company.location.id).toEqual(location.id);
          })
        );

        test(
          'With null B',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(context);

            // Run the query with a null operation
            const _location = await context.lists.Location.updateOne({
              id: location.id,
              data: { company: null },
              query: 'id company { id name }',
            });

            // Check that the company is still there
            expect(_location.id).toEqual(location.id);
            expect(_location.company).not.toBe(null);
            expect(_location.company.id).toEqual(company.id);
          })
        );
      });

      describe('Delete', () => {
        test(
          'delete A',
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

        test(
          'delete B',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(context);

            // Run the query to disconnect the location from company
            const _location = await context.lists.Location.deleteOne({ id: location.id });
            expect(_location?.id).toBe(location.id);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location).toBe(null);
          })
        );
      });
    });
  })
);
