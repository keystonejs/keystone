import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { createItem, getItems, getItem } from '@keystone-next/server-side-graphql-client-legacy';
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
      createCompany: {
        id: IdType;
        name: string;
        location: { id: IdType; name: string; company: { id: IdType } };
      };
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
          name: "${sampleOne(alphanumGenerator)}"
          location: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id name location { id name company { id } } }
      }`,
  });
  expect(errors).toBe(undefined);
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
    data: {
      createLocation: {
        id: IdType;
        name: string;
        company: { id: IdType; name: string; location: { id: IdType } };
      };
    };
    errors: unknown;
  };
  const {
    data: { createLocation },
    errors,
  }: T = await context.executeGraphQL({
    query: `
      mutation {
        createLocation(data: {
          name: "${sampleOne(alphanumGenerator)}"
          company: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id name company { id name location { id } } }
      }`,
  });
  expect(errors).toBe(undefined);
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
  const { data }: T = await context.executeGraphQL({
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id location { id } }
    Location(where: { id: "${locationId}"} ) { id company { id } }
  }`,
  });
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
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allLocations(where: { company: { name: "${company.name}"} }) { id }
                  allCompanies(where: { location: { name: "${location.name}"} }) { id }
                }`,
            });
            expect(errors).toBe(undefined);
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
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allLocations(where: { company: { name: "${company.name}"} }) { id }
                  allCompanies(where: { location: { name: "${location.name}"} }) { id }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.allLocations.length).toEqual(1);
            expect(data.allLocations[0].id).toEqual(location.id);
            expect(data.allCompanies.length).toEqual(1);
            expect(data.allCompanies[0].id).toEqual(company.id);
          })
        );
        test(
          'Where A: is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createCompanyAndLocation(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allLocations(where: { company_is_null: true }) { id }
                  allCompanies(where: { location_is_null: true }) { id }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.allLocations.length).toEqual(4);
            expect(data.allCompanies.length).toEqual(3);
          })
        );
        test(
          'Where B: is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createLocationAndCompany(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allLocations(where: { company_is_null: true }) { id }
                  allCompanies(where: { location_is_null: true }) { id }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.allLocations.length).toEqual(4);
            expect(data.allCompanies.length).toEqual(3);
          })
        );
        test(
          'Where A: is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createCompanyAndLocation(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allLocations(where: { company_is_null: false }) { id }
                  allCompanies(where: { location_is_null: false }) { id }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.allLocations.length).toEqual(1);
            expect(data.allCompanies.length).toEqual(1);
          })
        );
        test(
          'Where B: is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createLocationAndCompany(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allLocations(where: { company_is_null: false }) { id }
                  allCompanies(where: { location_is_null: false }) { id }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.allLocations.length).toEqual(1);
            expect(data.allCompanies.length).toEqual(1);
          })
        );

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
            expect(data._allLocationsMeta.count).toEqual(4);
          })
        );

        test(
          'Where with count A',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { location, company } = await createCompanyAndLocation(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  _allLocationsMeta(where: { company: { name: "${company.name}"} }) { count }
                  _allCompaniesMeta(where: { location: { name: "${location.name}"} }) { count }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data._allCompaniesMeta.count).toEqual(1);
            expect(data._allLocationsMeta.count).toEqual(1);
          })
        );
        test(
          'Where with count B',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { location, company } = await createLocationAndCompany(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  _allLocationsMeta(where: { company: { name: "${company.name}"} }) { count }
                  _allCompaniesMeta(where: { location: { name: "${location.name}"} }) { count }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data._allCompaniesMeta.count).toEqual(1);
            expect(data._allLocationsMeta.count).toEqual(1);
          })
        );
        test(
          'Where null with count A',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createCompanyAndLocation(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  _allLocationsMeta(where: { company_is_null: true }) { count }
                  _allCompaniesMeta(where: { location_is_null: true }) { count }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data._allCompaniesMeta.count).toEqual(3);
            expect(data._allLocationsMeta.count).toEqual(4);
          })
        );
        test(
          'Where null with count B',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createLocationAndCompany(context);
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  _allLocationsMeta(where: { company_is_null: true }) { count }
                  _allCompaniesMeta(where: { location_is_null: true }) { count }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data._allCompaniesMeta.count).toEqual(3);
            expect(data._allLocationsMeta.count).toEqual(4);
          })
        );
      });

      describe('Create', () => {
        test(
          'With connect A',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            const location = locations[0];
            const { data, errors } = await context.executeGraphQL({
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
              context,
              data.createCompany.id,
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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createLocation(data: {
                    company: { connect: { id: "${company.id}" } }
                  }) { id company { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);
            expect(data.createLocation.company.id.toString()).toEqual(company.id);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              company.id,
              data.createLocation.id
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
            const { data, errors } = await context.executeGraphQL({
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
              context,
              data.createCompany.id,
              data.createCompany.location.id
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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createLocation(data: {
                    company: { create: { name: "${companyName}" } }
                  }) { id company { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createLocation.company.id,
              data.createLocation.id
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

            const { data, errors } = await context.executeGraphQL({
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
              context,
              data.createCompany.id,
              data.createCompany.location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            type T = {
              data: {
                allCompanies: { id: IdType; location: { id: IdType; company: { id: IdType } } }[];
              };
              errors: unknown;
            };
            const {
              data: { allCompanies },
              errors: errors2,
            }: T = await context.executeGraphQL({
              query: `{ allCompanies { id location { id company { id }} } }`,
            });
            expect(errors2).toBe(undefined);
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

            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createLocation(data: {
                    company: { create: { name: "${companyName}" location: { connect: { id: "${location.id}" } } } }
                  }) { id company { id location { id } } }
                }`,
            });
            expect(errors).toBe(undefined);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createLocation.company.id,
              data.createLocation.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            type T = {
              data: {
                allLocations: { id: IdType; company: { id: IdType; location: { id: IdType } } }[];
              };
              errors: unknown;
            };
            const {
              data: { allLocations },
              errors: errors2,
            }: T = await context.executeGraphQL({
              query: `{ allLocations { id company { id location { id }} } }`,
            });
            expect(errors2).toBe(undefined);
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

            const { data, errors } = await context.executeGraphQL({
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
              context,
              data.createCompany.id,
              data.createCompany.location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            // The nested company should not have a location
            type T = {
              data: {
                allCompanies: { id: IdType; location: { id: IdType; company: { id: IdType } } }[];
              };
              errors: unknown;
            };
            const {
              data: { allCompanies },
              errors: errors2,
            }: T = await context.executeGraphQL({
              query: `{ allCompanies { id location { id company { id }} } }`,
            });
            expect(errors2).toBe(undefined);
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
            const location = await createItem({
              context,
              listKey: 'Location',
              item: { name: sampleOne(alphanumGenerator) },
            });

            // Create a Company pointing to Location
            const company1 = await createItem({
              context,
              listKey: 'Company',
              item: {
                name: sampleOne(alphanumGenerator),
                location: { connect: { id: location.id } },
              },
              returnFields: 'id location { id }',
            });

            // Create another Company pointing to Location
            const company2 = await createItem({
              context,
              listKey: 'Company',
              item: {
                name: sampleOne(alphanumGenerator),
                location: { connect: { id: location.id } },
              },
              returnFields: 'id location { id }',
            });

            // Make sure the original Company does not point to the location
            const result = await getItems({
              context,
              listKey: 'Location',
              returnFields: 'id name company { id }',
            });
            expect(result).toHaveLength(1);

            const result1 = await getItem({
              context,
              listKey: 'Company',
              itemId: company1.id,
              returnFields: 'id location { id }',
            });
            expect(result1?.location).toBe(null);

            const result2 = await getItem({
              context,
              listKey: 'Company',
              itemId: company2.id,
              returnFields: 'id location { id }',
            });
            expect(result2?.location).toEqual({ id: location.id });
          })
        );
        test(
          'Dual create B',
          runner(setupKeystone, async ({ context }) => {
            // Create a Company
            const company = await createItem({
              context,
              listKey: 'Company',
              item: { name: sampleOne(alphanumGenerator) },
            });

            // Create a Location pointing to Company
            const location1 = await createItem({
              context,
              listKey: 'Location',
              item: {
                name: sampleOne(alphanumGenerator),
                company: { connect: { id: company.id } },
              },
              returnFields: 'id company { id }',
            });

            // Create another Location pointing to Company
            const location2 = await createItem({
              context,
              listKey: 'Location',
              item: {
                name: sampleOne(alphanumGenerator),
                company: { connect: { id: company.id } },
              },
              returnFields: 'id company { id }',
            });

            // Make sure the original Company does not point to the location
            const result = await getItems({
              context,
              listKey: 'Company',
              returnFields: 'id location { id }',
            });
            expect(result).toHaveLength(1);

            const result1 = await getItem({
              context,
              listKey: 'Location',
              itemId: location1.id,
              returnFields: 'id company { id }',
            });
            expect(result1?.company).toBe(null);

            const result2 = await getItem({
              context,
              listKey: 'Location',
              itemId: location2.id,
              returnFields: 'id company { id }',
            });
            expect(result2?.company).toEqual({ id: company.id });
          })
        );

        test(
          'With null A',
          runner(setupKeystone, async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createCompany(data: {
                    location: null
                  }) { id location { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);

            // Location should be empty
            expect(data.createCompany.location).toBe(null);
          })
        );

        test(
          'With null B',
          runner(setupKeystone, async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createLocation(data: {
                    company: null
                  }) { id company { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);

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

            const { errors } = await context.executeGraphQL({
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

            const { errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateLocation(
                    id: "${location.id}",
                    data: { company: { connect: { id: "${company.id}" } } }
                  ) { id company { id } } }`,
            });
            expect(errors).toBe(undefined);

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
            const { data, errors } = await context.executeGraphQL({
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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateLocation(
                    id: "${location.id}",
                    data: { company: { create: { name: "${companyName}" } } }
                  ) { id company { id name } }
                }
            `,
            });
            expect(errors).toBe(undefined);

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
            const { data, errors } = await context.executeGraphQL({
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
              context,
              company.id,
              data.updateCompany.location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            // Keep track of the original location!
            const originalLocationId = Location.id;
            await (async () => {
              const locationName = sampleOne(alphanumGenerator);
              const { data, errors } = await context.executeGraphQL({
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
                context,
                company.id,
                data.updateCompany.location.id
              );

              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const result = await context.executeGraphQL({
                query: `{ Location(where: { id: "${originalLocationId}" }) { id company { id } } }`,
              });
              expect(result.errors).toBe(undefined);
              expect(result.data.Location.company).toBe(null);
            })();
          })
        );

        test(
          'With recreate B',
          runner(setupKeystone, async ({ context }) => {
            const { locations } = await createInitialData(context);
            let location = locations[0];
            const companyName = sampleOne(alphanumGenerator);
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateLocation(
                    id: "${location.id}",
                    data: { company: { create: { name: "${companyName}" } } }
                  ) { id company { id name } }
                }
            `,
            });
            expect(errors).toBe(undefined);

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.updateLocation.company.id,
              location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            const originalCompanyId = Company.id;
            await (async () => {
              const companyName = sampleOne(alphanumGenerator);
              const { data, errors } = await context.executeGraphQL({
                query: `
                  mutation {
                    updateLocation(
                      id: "${location.id}",
                      data: { company: { create: { name: "${companyName}" } } }
                    ) { id company { id name } }
                  }
              `,
              });
              expect(errors).toBe(undefined);

              const { Company, Location } = await getCompanyAndLocation(
                context,
                data.updateLocation.company.id,
                location.id
              );

              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const result = await context.executeGraphQL({
                query: `{ Company(where: { id: "${originalCompanyId}" }) { id location { id } } }`,
              });
              expect(result.errors).toBe(undefined);
              expect(result.data.Company.location).toBe(null);
            })();
          })
        );

        test(
          'With disconnect A',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Run the query to disconnect the location from company
            const { data, errors } = await context.executeGraphQL({
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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateLocation(
                    id: "${location.id}",
                    data: { company: { disconnect: { id: "${company.id}" } } }
                  ) { id company { id name } }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.updateLocation.id).toEqual(location.id);
            expect(data.updateLocation.company).toBe(null);

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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { location: { disconnectAll: true } }
                  ) { id location { id name } }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.location).toBe(null);

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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateLocation(
                    id: "${location.id}",
                    data: { company: { disconnectAll: true } }
                  ) { id company { id name } }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.updateLocation.id).toEqual(location.id);
            expect(data.updateLocation.company).toBe(null);

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
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
                    data: { location: null }
                  ) { id location { id name } }
                }`,
            });
            expect(errors).toBe(undefined);

            // Check that the location is still there
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.location).not.toBe(null);
            expect(data.updateCompany.location.id).toEqual(location.id);
          })
        );

        test(
          'With null B',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(context);

            // Run the query with a null operation
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateLocation(
                    id: "${location.id}",
                    data: { company: null }
                  ) { id company { id name } }
                }`,
            });
            expect(errors).toBe(undefined);

            // Check that the company is still there
            expect(data.updateLocation.id).toEqual(location.id);
            expect(data.updateLocation.company).not.toBe(null);
            expect(data.updateLocation.company.id).toEqual(company.id);
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
            const { data, errors } = await context.executeGraphQL({
              query: `mutation { deleteCompany(id: "${company.id}") { id } } `,
            });
            expect(errors).toBe(undefined);
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
            const { data, errors } = await context.executeGraphQL({
              query: `mutation { deleteLocation(id: "${location.id}") { id } } `,
            });
            expect(errors).toBe(undefined);
            expect(data.deleteLocation.id).toBe(location.id);

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
