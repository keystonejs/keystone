import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import type { KeystoneContext } from '@keystone-next/keystone/types';
import { apiTestConfig } from '../../utils';

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
  const company = await context.lists.Company.createOne({
    data: { location: { create: { name: sampleOne(alphanumGenerator) } } },
    query: 'id location { id }',
  });
  const { Company, Location } = await getCompanyAndLocation(
    context,
    company.id,
    company.location.id
  );

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString());

  return { company, location: company.location };
};

const createComplexData = async (context: KeystoneContext) => {
  const companies = await context.lists.Company.createMany({
    data: [
      { name: 'A', location: { create: { name: 'A' } } },
      { name: 'B', location: { create: { name: 'D' } } },
      { name: 'C', location: { create: { name: 'B' } } },
      { name: 'E' },
    ],
    query: 'id name location { id name }',
  });
  expect(companies[0].name).toEqual('A');
  expect(companies[0].location.name).toEqual('A');
  expect(companies[1].name).toEqual('B');
  expect(companies[1].location.name).toEqual('D');
  expect(companies[2].name).toEqual('C');
  expect(companies[2].location.name).toEqual('B');
  expect(companies[3].name).toEqual('E');
  expect(companies[3].location).toBe(null);

  const _company = await context.lists.Company.createOne({
    data: { name: 'D', location: { connect: { id: companies[2].location.id } } },
    query: 'id name location { id name }',
  });
  const _location = await context.lists.Location.createOne({
    data: { name: 'C' },
    query: 'id name',
  });
  expect(_company.name).toEqual('D');
  expect(_company.location.name).toEqual('B');
  expect(_location.name).toEqual('C');

  type T3 = { id: IdType; name: string }[];
  const locations = (await context.lists.Location.findMany({ query: 'id name' })) as T3;
  return { companies: [...companies, _company], locations };
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
    Company: company(where: { id: "${companyId}"} ) { id location { id } }
    Location: location(where: { id: "${locationId}"} ) { id }
  }`,
  })) as T;
  return data;
};

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Company: list({
        fields: {
          name: text({ isOrderable: true }),
          location: relationship({ ref: 'Location', isFilterable: true }),
        },
      }),
      Location: list({
        fields: {
          name: text({ isFilterable: true, isOrderable: true }),
        },
      }),
    },
  }),
});

describe(`One-to-many relationships`, () => {
  describe('Read', () => {
    test(
      'one',
      runner(async ({ context }) => {
        await createComplexData(context);
        await Promise.all(
          [
            ['A', 1],
            ['B', 2],
            ['C', 0],
            ['D', 1],
            ['E', 0],
          ].map(async ([name, count]) => {
            const companies = await context.lists.Company.findMany({
              where: { location: { name: { contains: name } } },
            });
            expect(companies.length).toEqual(count);
          })
        );
      })
    );
    test(
      'is null',
      runner(async ({ context }) => {
        await createComplexData(context);
        const companies = await context.lists.Company.findMany({
          where: { location: null },
        });
        expect(companies.length).toEqual(1);
      })
    );
    test(
      'is not null',
      runner(async ({ context }) => {
        await createComplexData(context);
        const companies = await context.lists.Company.findMany({
          where: { NOT: { location: null } },
        });
        expect(companies.length).toEqual(4);
      })
    );
  });

  describe('Count', () => {
    test(
      'Count',
      runner(async ({ context }) => {
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
      runner(async ({ context }) => {
        const { locations } = await createInitialData(context);
        const location = locations[0];
        const company = await context.lists.Company.createOne({
          data: { location: { connect: { id: location.id } } },
          query: 'id location { id }',
        });
        expect(company.location.id.toString()).toBe(location.id.toString());

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id);
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString());
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
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
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        const company = await context.lists.Company.createOne({
          data: { location: null },
          query: 'id location { id }',
        });

        // Location should be empty
        expect(company.location).toBe(null);
      })
    );
  });

  describe('Update', () => {
    test(
      'With connect',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Sanity check the links don't yet exist
        // `...not.toBe(expect.anything())` allows null and undefined values
        expect(company.location).not.toBe(expect.anything());

        await context.lists.Company.updateOne({
          where: { id: company.id },
          data: { location: { connect: { id: location.id } } },
        });

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id);
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString());
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
        const { companies } = await createInitialData(context);
        let company = companies[0];
        const locationName = sampleOne(alphanumGenerator);
        const _company = await context.lists.Company.updateOne({
          where: { id: company.id },
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
      })
    );

    test(
      'With disconnect: true',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query to disconnect the location from company
        const _company = await context.lists.Company.updateOne({
          where: { id: company.id },
          data: { location: { disconnect: true } },
          query: 'id location { id name }',
        });
        expect(_company.id).toEqual(company.id);
        expect(_company.location).toBe(null);

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id);
        expect(result.Company.location).toBe(null);
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query with a null operation
        const _company = await context.lists.Company.updateOne({
          where: { id: company.id },
          data: { location: null },
          query: 'id location { id name }',
        });

        // Check that the location is still there
        expect(_company.id).toEqual(company.id);
        expect(_company.location).not.toBe(null);
        expect(_company.location.id).toEqual(location.id);
      })
    );
  });

  describe('Delete', () => {
    test(
      'delete',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query to disconnect the location from company
        const _company = await context.lists.Company.deleteOne({ where: { id: company.id } });
        expect(_company?.id).toBe(company.id);

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id);
        expect(result.Company).toBe(null);
      })
    );

    ['A', 'B', 'C', 'D', 'E'].forEach(name => {
      test(
        `delete company ${name}`,
        runner(async ({ context }) => {
          // Setup a complex set of data
          const { companies } = await createComplexData(context);

          // Delete company {name}
          const id = companies.find(company => company.name === name)?.id;
          const _company = await context.lists.Company.deleteOne({ where: { id } });
          expect(_company?.id).toBe(id);

          // Check all the companies look how we expect
          await (async () => {
            const _companies = await context.lists.Company.findMany({
              orderBy: { name: 'asc' },
              query: 'id name location { id name }',
            });
            const expected = [
              ['A', 'A'],
              ['B', 'D'],
              ['C', 'B'],
              ['D', 'B'],
              ['E', null],
            ].filter(([x]) => x !== name);

            expect(_companies[0].name).toEqual(expected[0][0]);
            expect(_companies[0].location.name).toEqual(expected[0][1]);
            expect(_companies[1].name).toEqual(expected[1][0]);
            expect(_companies[1].location.name).toEqual(expected[1][1]);
            expect(_companies[2].name).toEqual(expected[2][0]);
            expect(_companies[2].location.name).toEqual(expected[2][1]);
            expect(_companies[3].name).toEqual(expected[3][0]);
            if (expected[3][1] === null) {
              expect(_companies[3].location).toBe(null);
            } else {
              expect(_companies[2].location.name).toEqual(expected[3][1]);
            }
          })();

          // Check all the locations look how we expect
          await (async () => {
            const _locations = await context.lists.Location.findMany({
              orderBy: { name: 'asc' },
              query: 'id name',
            });
            expect(_locations[0].name).toEqual('A');
            expect(_locations[1].name).toEqual('B');
            expect(_locations[2].name).toEqual('C');
            expect(_locations[3].name).toEqual('D');
          })();
        })
      );
    });

    ['A', 'B', 'C', 'D'].forEach(name => {
      test(
        `delete location ${name}`,
        runner(async ({ context }) => {
          // Setup a complex set of data
          const { locations } = await createComplexData(context);

          // Delete location {name}
          const id = locations.find(location => location.name === name)?.id;
          const deleted = await context.lists.Location.deleteOne({ where: { id } });
          expect(deleted).not.toBe(null);
          expect(deleted!.id).toBe(id);

          // Check all the companies look how we expect
          const companies = await context.lists.Company.findMany({
            orderBy: { name: 'asc' },
            query: 'id name location { id name }',
          });
          expect(companies[0].name).toEqual('A');
          if (name === 'A') {
            expect(companies[0].location).toBe(null);
          } else {
            expect(companies[0].location.name).toEqual('A');
          }
          expect(companies[1].name).toEqual('B');
          if (name === 'D') {
            expect(companies[1].location).toBe(null);
          } else {
            expect(companies[1].location.name).toEqual('D');
          }
          expect(companies[2].name).toEqual('C');
          if (name === 'B') {
            expect(companies[2].location).toBe(null);
          } else {
            expect(companies[2].location.name).toEqual('B');
          }
          expect(companies[3].name).toEqual('D');
          if (name === 'B') {
            expect(companies[3].location).toBe(null);
          } else {
            expect(companies[3].location.name).toEqual('B');
          }
          expect(companies[4].name).toEqual('E');
          expect(companies[4].location).toBe(null);

          // Check all the locations look how we expect
          const _locations = await context.lists.Location.findMany({
            orderBy: { name: 'asc' },
            query: 'id name',
          });
          const expected = ['A', 'B', 'C', 'D'].filter(x => x !== name);
          expect(_locations[0].name).toEqual(expected[0]);
          expect(_locations[1].name).toEqual(expected[1]);
          expect(_locations[2].name).toEqual(expected[2]);
        })
      );
    });
  });
});
