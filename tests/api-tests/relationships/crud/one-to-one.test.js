const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { createItem, getItems, getItem } = require('@keystonejs/server-side-graphql-client');

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
          name: "${sampleOne(alphanumGenerator)}"
          location: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id name location { id name } }
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
  expect(Location.company.id.toString()).toBe(Company.id.toString());

  return { company: createCompany, location: createCompany.location };
};

const createLocationAndCompany = async keystone => {
  const {
    data: { createLocation },
    errors,
  } = await keystone.executeGraphQL({
    query: `
      mutation {
        createLocation(data: {
          name: "${sampleOne(alphanumGenerator)}"
          company: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id name company { id name } }
      }`,
  });
  expect(errors).toBe(undefined);
  const { Company, Location } = await getCompanyAndLocation(
    keystone,
    createLocation.company.id,
    createLocation.id
  );

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString());
  expect(Location.company.id.toString()).toBe(Company.id.toString());

  return { location: createLocation, company: createLocation.company };
};

const getCompanyAndLocation = async (keystone, companyId, locationId) => {
  const { data } = await keystone.executeGraphQL({
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id location { id } }
    Location(where: { id: "${locationId}"} ) { id company { id } }
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
          location: { type: Relationship, ref: 'Location.company' },
        },
      });
      keystone.createList('Location', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company.location' },
        },
      });
    },
  });

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe(`One-to-one relationships`, () => {
      describe('Read', () => {
        test(
          'Where A',
          runner(setupKeystone, async ({ keystone }) => {
            await createInitialData(keystone);
            const { location, company } = await createCompanyAndLocation(keystone);
            const { data, errors } = await keystone.executeGraphQL({
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
          runner(setupKeystone, async ({ keystone }) => {
            await createInitialData(keystone);
            const { location, company } = await createLocationAndCompany(keystone);
            const { data, errors } = await keystone.executeGraphQL({
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
        if (adapterName !== 'mongoose') {
          test(
            'Where A: is_null: true',
            runner(setupKeystone, async ({ keystone }) => {
              await createInitialData(keystone);
              await createCompanyAndLocation(keystone);
              const { data, errors } = await keystone.executeGraphQL({
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
            runner(setupKeystone, async ({ keystone }) => {
              await createInitialData(keystone);
              await createLocationAndCompany(keystone);
              const { data, errors } = await keystone.executeGraphQL({
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
            runner(setupKeystone, async ({ keystone }) => {
              await createInitialData(keystone);
              await createCompanyAndLocation(keystone);
              const { data, errors } = await keystone.executeGraphQL({
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
            runner(setupKeystone, async ({ keystone }) => {
              await createInitialData(keystone);
              await createLocationAndCompany(keystone);
              const { data, errors } = await keystone.executeGraphQL({
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
        }

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
            expect(data._allLocationsMeta.count).toEqual(4);
          })
        );

        test(
          'Where with count A',
          runner(setupKeystone, async ({ keystone }) => {
            await createInitialData(keystone);
            const { location, company } = await createCompanyAndLocation(keystone);
            const { data, errors } = await keystone.executeGraphQL({
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
          runner(setupKeystone, async ({ keystone }) => {
            await createInitialData(keystone);
            const { location, company } = await createLocationAndCompany(keystone);
            const { data, errors } = await keystone.executeGraphQL({
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
        if (adapterName !== 'mongoose') {
          test(
            'Where null with count A',
            runner(setupKeystone, async ({ keystone }) => {
              await createInitialData(keystone);
              await createCompanyAndLocation(keystone);
              const { data, errors } = await keystone.executeGraphQL({
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
            runner(setupKeystone, async ({ keystone }) => {
              await createInitialData(keystone);
              await createLocationAndCompany(keystone);
              const { data, errors } = await keystone.executeGraphQL({
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
        }
      });

      describe('Create', () => {
        test(
          'With connect A',
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
          'With connect B',
          runner(setupKeystone, async ({ keystone }) => {
            const { companies } = await createInitialData(keystone);
            const company = companies[0];
            const { data, errors } = await keystone.executeGraphQL({
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
              keystone,
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
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With create B',
          runner(setupKeystone, async ({ keystone }) => {
            const companyName = sampleOne(alphanumGenerator);
            const { data, errors } = await keystone.executeGraphQL({
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
              keystone,
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
          runner(setupKeystone, async ({ keystone }) => {
            const { companies } = await createInitialData(keystone);
            const company = companies[0];
            const locationName = sampleOne(alphanumGenerator);

            const { data, errors } = await keystone.executeGraphQL({
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
              errors: errors2,
            } = await keystone.executeGraphQL({
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
          runner(setupKeystone, async ({ keystone }) => {
            const { locations } = await createInitialData(keystone);
            const location = locations[0];
            const companyName = sampleOne(alphanumGenerator);

            const { data, errors } = await keystone.executeGraphQL({
              query: `
                mutation {
                  createLocation(data: {
                    company: { create: { name: "${companyName}" location: { connect: { id: "${location.id}" } } } }
                  }) { id company { id location { id } } }
                }`,
            });
            expect(errors).toBe(undefined);

            const { Company, Location } = await getCompanyAndLocation(
              keystone,
              data.createLocation.company.id,
              data.createLocation.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            const {
              data: { allLocations },
              errors: errors2,
            } = await keystone.executeGraphQL({
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
          runner(setupKeystone, async ({ keystone }) => {
            const locationName = sampleOne(alphanumGenerator);
            const companyName = sampleOne(alphanumGenerator);

            const { data, errors } = await keystone.executeGraphQL({
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
              errors: errors2,
            } = await keystone.executeGraphQL({
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
          runner(setupKeystone, async ({ keystone }) => {
            // Create a Location
            const location = await createItem({
              keystone,
              listKey: 'Location',
              item: { name: sampleOne(alphanumGenerator) },
            });

            // Create a Company pointing to Location
            const company1 = await createItem({
              keystone,
              listKey: 'Company',
              item: {
                name: sampleOne(alphanumGenerator),
                location: { connect: { id: location.id } },
              },
              returnFields: 'id location { id }',
            });

            // Create another Company pointing to Location
            const company2 = await createItem({
              keystone,
              listKey: 'Company',
              item: {
                name: sampleOne(alphanumGenerator),
                location: { connect: { id: location.id } },
              },
              returnFields: 'id location { id }',
            });

            // Make sure the original Company does not point to the location
            const result = await getItems({
              keystone,
              listKey: 'Location',
              returnFields: 'id name company { id }',
            });
            expect(result).toHaveLength(1);

            const result1 = await getItem({
              keystone,
              listKey: 'Company',
              itemId: company1.id,
              returnFields: 'id location { id }',
            });
            expect(result1.location).toBe(null);

            const result2 = await getItem({
              keystone,
              listKey: 'Company',
              itemId: company2.id,
              returnFields: 'id location { id }',
            });
            expect(result2.location).toEqual({ id: location.id });
          })
        );
        test(
          'Dual create B',
          runner(setupKeystone, async ({ keystone }) => {
            // Create a Company
            const company = await createItem({
              keystone,
              listKey: 'Company',
              item: { name: sampleOne(alphanumGenerator) },
            });

            // Create a Location pointing to Company
            const location1 = await createItem({
              keystone,
              listKey: 'Location',
              item: {
                name: sampleOne(alphanumGenerator),
                company: { connect: { id: company.id } },
              },
              returnFields: 'id company { id }',
            });

            // Create another Location pointing to Company
            const location2 = await createItem({
              keystone,
              listKey: 'Location',
              item: {
                name: sampleOne(alphanumGenerator),
                company: { connect: { id: company.id } },
              },
              returnFields: 'id company { id }',
            });

            // Make sure the original Company does not point to the location
            const result = await getItems({
              keystone,
              listKey: 'Company',
              returnFields: 'id location { id }',
            });
            expect(result).toHaveLength(1);

            const result1 = await getItem({
              keystone,
              listKey: 'Location',
              itemId: location1.id,
              returnFields: 'id company { id }',
            });
            expect(result1.company).toBe(null);

            const result2 = await getItem({
              keystone,
              listKey: 'Location',
              itemId: location2.id,
              returnFields: 'id company { id }',
            });
            expect(result2.company).toEqual({ id: company.id });
          })
        );
      });

      describe('Update', () => {
        test(
          'With connect A',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(keystone);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(company.location).not.toBe(expect.anything());
            expect(location.company).not.toBe(expect.anything());

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
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With connect B',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(keystone);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(company.location).not.toBe(expect.anything());
            expect(location.company).not.toBe(expect.anything());

            const { errors } = await keystone.executeGraphQL({
              query: `
                mutation {
                  updateLocation(
                    id: "${location.id}",
                    data: { company: { connect: { id: "${company.id}" } } }
                  ) { id company { id } } }`,
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
          'With create A',
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
            expect(Location.company.id.toString()).toBe(Company.id.toString());
          })
        );

        test(
          'With create B',
          runner(setupKeystone, async ({ keystone }) => {
            const { locations } = await createInitialData(keystone);
            let location = locations[0];
            const companyName = sampleOne(alphanumGenerator);
            const { data, errors } = await keystone.executeGraphQL({
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
              keystone,
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
          runner(setupKeystone, async ({ keystone }) => {
            // To begin with, nothing is linked
            const { companies } = await createInitialData(keystone);
            let company = companies[0];

            // Update company.location to be a new thing.
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
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            // Keep track of the original location!
            const originalLocationId = Location.id;
            await (async () => {
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
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const result = await keystone.executeGraphQL({
                query: `{ Location(where: { id: "${originalLocationId}" }) { id company { id } } }`,
              });
              expect(result.errors).toBe(undefined);
              expect(result.data.Location.company).toBe(null);
            })();
          })
        );

        test(
          'With recreate B',
          runner(setupKeystone, async ({ keystone }) => {
            const { locations } = await createInitialData(keystone);
            let location = locations[0];
            const companyName = sampleOne(alphanumGenerator);
            const { data, errors } = await keystone.executeGraphQL({
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
              keystone,
              data.updateLocation.company.id,
              location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
            expect(Location.company.id.toString()).toBe(Company.id.toString());

            const originalCompanyId = Company.id;
            await (async () => {
              const companyName = sampleOne(alphanumGenerator);
              const { data, errors } = await keystone.executeGraphQL({
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
                keystone,
                data.updateLocation.company.id,
                location.id
              );

              // Everything should now be connected
              expect(Company.location.id.toString()).toBe(Location.id.toString());
              expect(Location.company.id.toString()).toBe(Company.id.toString());

              const result = await keystone.executeGraphQL({
                query: `{ Company(where: { id: "${originalCompanyId}" }) { id location { id } } }`,
              });
              expect(result.errors).toBe(undefined);
              expect(result.data.Company.location).toBe(null);
            })();
          })
        );

        test(
          'With disconnect A',
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
            expect(result.Location.company).toBe(null);
          })
        );

        test(
          'With disconnect B',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(keystone);

            // Run the query to disconnect the location from company
            const { data, errors } = await keystone.executeGraphQL({
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
            const result = await getCompanyAndLocation(keystone, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location.company).toBe(null);
          })
        );
        test(
          'With disconnectAll A',
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
                }`,
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
          'With disconnectAll B',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(keystone);

            // Run the query to disconnect the location from company
            const { data, errors } = await keystone.executeGraphQL({
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
            const result = await getCompanyAndLocation(keystone, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location.company).toBe(null);
          })
        );
      });

      describe('Delete', () => {
        test(
          'delete A',
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
            expect(result.Location.company).toBe(null);
          })
        );

        test(
          'delete B',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createLocationAndCompany(keystone);

            // Run the query to disconnect the location from company
            const { data, errors } = await keystone.executeGraphQL({
              query: `mutation { deleteLocation(id: "${location.id}") { id } } `,
            });
            expect(errors).toBe(undefined);
            expect(data.deleteLocation.id).toBe(location.id);

            // Check the link has been broken
            const result = await getCompanyAndLocation(keystone, company.id, location.id);
            expect(result.Company.location).toBe(null);
            expect(result.Location).toBe(null);
          })
        );
      });
    });
  })
);
