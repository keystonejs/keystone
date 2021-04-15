import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import type { ProviderName } from '@keystone-next/test-utils-legacy';
import type { KeystoneContext } from '@keystone-next/types';

type IdType = any;

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async (context: KeystoneContext) => {
  type T = { createLocations: { id: IdType }[]; createCompanies: { id: IdType }[] };
  const data = (await context.graphql.run({
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
  })) as T;
  return { locations: data.createLocations, companies: data.createCompanies };
};

const createCompanyAndLocation = async (context: KeystoneContext) => {
  type T = { createCompany: { id: IdType; location: { id: IdType } } };
  const { createCompany } = (await context.graphql.run({
    query: `
      mutation {
        createCompany(data: {
          location: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id location { id } }
      }`,
  })) as T;
  const { Company, Location } = await getCompanyAndLocation(
    context,
    createCompany.id,
    createCompany.location.id
  );

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString());

  return { company: createCompany, location: createCompany.location };
};

const createComplexData = async (context: KeystoneContext) => {
  type T1 = {
    createCompanies: { id: IdType; name: string; location: { id: IdType; name: string } }[];
  };
  const data = (await context.graphql.run({
    query: `
      mutation {
        createCompanies(data: [
          { data: { name: "A" location: { create: { name: "A" } } } }
          { data: { name: "B" location: { create: { name: "D" } } } }
          { data: { name: "C" location: { create: { name: "B" } } } }
          { data: { name: "E" } }
        ]) { id name location { id name }}
      }`,
  })) as T1;
  expect(data.createCompanies[0].name).toEqual('A');
  expect(data.createCompanies[0].location.name).toEqual('A');
  expect(data.createCompanies[1].name).toEqual('B');
  expect(data.createCompanies[1].location.name).toEqual('D');
  expect(data.createCompanies[2].name).toEqual('C');
  expect(data.createCompanies[2].location.name).toEqual('B');
  expect(data.createCompanies[3].name).toEqual('E');
  expect(data.createCompanies[3].location).toBe(null);
  type T2 = {
    createCompany: { id: IdType; name: string; location: { id: IdType; name: string } };
    createLocation: { id: IdType; name: string };
  };

  const data2 = (await context.graphql.run({
    query: `mutation {
      createCompany(data: { name: "D" location: { connect: { id: "${data.createCompanies[2].location.id}" } } }) {
        id name location { id name }
      }
      createLocation(data: { name: "C" }) { id name }
    }`,
  })) as T2;
  expect(data2.createCompany.name).toEqual('D');
  expect(data2.createCompany.location.name).toEqual('B');
  expect(data2.createLocation.name).toEqual('C');

  type T3 = { allLocations: { id: IdType; name: string }[] };
  const { allLocations } = (await context.graphql.run({
    query: '{ allLocations { id name } }',
  })) as T3;
  return {
    companies: [...data.createCompanies, data2.createCompany],
    locations: allLocations,
  };
};

const getCompanyAndLocation = async (
  context: KeystoneContext,
  companyId: IdType,
  locationId: IdType
) => {
  type T = {
    data: { Company: { id: IdType; location: { id: IdType } }; Location: { id: IdType } };
  };
  const { data } = (await context.graphql.raw({
    query: `
  {
    Company(where: { id: "${companyId}"} ) { id location { id } }
    Location(where: { id: "${locationId}"} ) { id }
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
            location: relationship({ ref: 'Location' }),
          },
        }),
        Location: list({
          fields: {
            name: text(),
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
            await createComplexData(context);
            await Promise.all(
              [
                ['A', 1],
                ['B', 2],
                ['C', 0],
                ['D', 1],
                ['E', 0],
              ].map(async ([name, count]) => {
                const data = await context.graphql.run({
                  query: `{ allCompanies(where: { location: { name_contains: "${name}"}}) { id }}`,
                });
                expect(data.allCompanies.length).toEqual(count);
              })
            );
          })
        );
        test(
          'is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createComplexData(context);
            const data = await context.graphql.run({
              query: `{ allCompanies(where: { location_is_null: true }) { id }}`,
            });
            expect(data.allCompanies.length).toEqual(1);
          })
        );
        test(
          'is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createComplexData(context);
            const data = await context.graphql.run({
              query: `{ allCompanies(where: { location_is_null: false }) { id }}`,
            });
            expect(data.allCompanies.length).toEqual(4);
          })
        );
      });

      describe('Count', () => {
        test(
          'Count',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const data = await context.graphql.run({
              query: `
                {
                  _allCompaniesMeta { count }
                  _allLocationsMeta { count }
                }
            `,
            });
            expect(data._allCompaniesMeta.count).toEqual(3);
            expect(data._allLocationsMeta.count).toEqual(3);
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
                    location: { connect: { id: "${location.id}" } }
                  }) { id location { id } }
                }
            `,
            });
            expect(data.createCompany.location.id.toString()).toBe(location.id.toString());

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createCompany.id,
              location.id
            );
            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
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
                    location: { create: { name: "${locationName}" } }
                  }) { id location { id } }
                }
            `,
            });

            const { Company, Location } = await getCompanyAndLocation(
              context,
              data.createCompany.id,
              data.createCompany.location.id
            );

            // Everything should now be connected
            expect(Company.location.id.toString()).toBe(Location.id.toString());
          })
        );

        test(
          'With null',
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
      });

      describe('Update', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { location, company } = await createCompanyAndLocation(context);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(company.location).not.toBe(expect.anything());

            await context.graphql.run({
              query: `
                mutation {
                  updateCompany(
                    id: "${company.id}",
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
                    id: "${company.id}",
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
                    data: { location: { disconnectAll: true } }
                  ) { id location { id name } }
                }
            `,
            });
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.location).toBe(null);

            // Check the link has been broken
            const result = await getCompanyAndLocation(context, company.id, location.id);
            expect(result.Company.location).toBe(null);
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
                    data: { location: null }
                  ) { id location { id name } }
                }
            `,
            });

            // Check that the location is still there
            expect(data.updateCompany.id).toEqual(company.id);
            expect(data.updateCompany.location).not.toBe(null);
            expect(data.updateCompany.location.id).toEqual(location.id);
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
          })
        );

        ['A', 'B', 'C', 'D', 'E'].forEach(name => {
          test(
            `delete company ${name}`,
            runner(setupKeystone, async ({ context }) => {
              // Setup a complex set of data
              const { companies } = await createComplexData(context);

              // Delete company {name}
              const id = companies.find(company => company.name === name)?.id;
              const data = await context.graphql.run({
                query: `mutation { deleteCompany(id: "${id}") { id } }`,
              });
              expect(data.deleteCompany.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const data = await context.graphql.run({
                  query: '{ allCompanies(sortBy: name_ASC) { id name location { id name } } }',
                });

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
                const data = await context.graphql.run({
                  query: '{ allLocations(sortBy: name_ASC) { id name } }',
                });
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
            runner(setupKeystone, async ({ context }) => {
              // Setup a complex set of data
              const { locations } = await createComplexData(context);

              // Delete location {name}
              const id = locations.find(location => location.name === name)?.id;
              const data = await context.graphql.run({
                query: `mutation { deleteLocation(id: "${id}") { id } }`,
              });
              expect(data.deleteLocation.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const data = await context.graphql.run({
                  query: '{ allCompanies(sortBy: name_ASC) { id name location { id name } } }',
                });
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
                const data = await context.graphql.run({
                  query: '{ allLocations(sortBy: name_ASC) { id name } }',
                });
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
