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
    data: { locations: { create: [{ name: sampleOne(alphanumGenerator) }] } },
    query: 'id locations { id company { id } }',
  });
  const { Company, Location } = await getCompanyAndLocation(
    context,
    company.id,
    company.locations[0].id
  );

  // Sanity check the links are setup correctly
  expect(Company.locations.map(({ id }: { id: IdType }) => id.toString())).toEqual([Location.id]);
  expect(Location.company.id.toString()).toBe(Company.id.toString());

  return { company, location: company.locations[0] };
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
        Company: company(where: { id: "${companyId}"} ) { id locations { id } }
        Location: location(where: { id: "${locationId}"} ) { id company { id } }
      }`,
  })) as T;
  return data;
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C, D];
  const locations = await context.lists.Location.createMany({
    data: ['A', 'A', 'B', 'B', 'C', 'C', 'D'].map(name => ({ name })),
    query: 'id name',
  });
  await Promise.all(
    Object.entries({
      ABC: [0, 2, 4], //  -> [A, B, C]
      AB: [1, 3], //  -> [A, B]
      C: [5], //  -> [C]
      '': [], //  -> []
    }).map(async ([name, locationIdxs]) => {
      const ids = locationIdxs.map((i: number) => ({ id: locations[i].id }));
      await context.lists.Company.createOne({ data: { name, locations: { connect: ids } } });
    })
  );
};

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Company: list({
        fields: {
          name: text({ isFilterable: true, isOrderable: true }),
          locations: relationship({ ref: 'Location.company', many: true, isFilterable: true }),
        },
      }),
      Location: list({
        fields: {
          name: text({ isFilterable: true }),
          company: relationship({ ref: 'Company.locations', isFilterable: true }),
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
      'is null',
      runner(async ({ context }) => {
        await createReadData(context);
        const locations = await context.lists.Location.findMany({
          where: { company: null },
        });
        expect(locations.length).toEqual(1);
      })
    );
    test(
      'is not null',
      runner(async ({ context }) => {
        await createReadData(context);
        const locations = await context.lists.Location.findMany({
          where: { NOT: { company: null } },
        });
        expect(locations.length).toEqual(6);
      })
    );
    test(
      'some',
      runner(async ({ context }) => {
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
      'none',
      runner(async ({ context }) => {
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
      'every',
      runner(async ({ context }) => {
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
        type T = { id: IdType; locations: { id: IdType }[] };
        const company = (await context.lists.Company.createOne({
          data: { locations: { connect: [{ id: location.id }] } },
          query: 'id locations { id }',
        })) as T;

        expect(company.locations.map(({ id }) => id.toString())).toEqual([location.id]);

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id);

        // Everything should now be connected
        expect(company.locations.map(({ id }) => id.toString())).toEqual([location.id]);
        expect(Location.company.id.toString()).toBe(Company.id.toString());
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
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
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id.toString()]);
        expect(Location.company.id.toString()).toBe(Company.id.toString());
      })
    );

    test(
      'With nested connect',
      runner(async ({ context }) => {
        const { companies } = await createInitialData(context);
        const company = companies[0];

        const locationName = sampleOne(alphanumGenerator);

        const _company = await context.lists.Company.createOne({
          data: {
            locations: {
              create: [{ name: locationName, company: { connect: { id: company.id } } }],
            },
          },
          query: 'id locations { id company { id } }',
        });

        const { Company, Location } = await getCompanyAndLocation(
          context,
          _company.id,
          _company.locations[0].id
        );

        // Everything should now be connected
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id]);
        expect(Location.company.id.toString()).toBe(Company.id.toString());

        const allCompanies = await context.lists.Company.findMany({
          query: 'id locations { id company { id } }',
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
      runner(async ({ context }) => {
        const locationName = sampleOne(alphanumGenerator);
        const companyName = sampleOne(alphanumGenerator);

        const company = await context.lists.Company.createOne({
          data: {
            locations: {
              create: [{ name: locationName, company: { create: { name: companyName } } }],
            },
          },
          query: 'id locations { id company { id } }',
        });

        const { Company, Location } = await getCompanyAndLocation(
          context,
          company.id,
          company.locations[0].id
        );
        // Everything should now be connected
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id]);
        expect(Location.company.id.toString()).toBe(Company.id.toString());

        // The nested company should not have a location
        const companies = await context.lists.Company.findMany({
          query: 'id locations { id company { id } }',
        });
        expect(companies.filter(({ id }) => id === Company.id)[0].locations[0].company.id).toEqual(
          Company.id
        );
        companies
          .filter(({ id }) => id !== Company.id)
          .forEach(company => {
            expect(company.locations).toEqual([]);
          });
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
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
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Sanity check the links don't yet exist
        // `...not.toBe(expect.anything())` allows null and undefined values
        expect(company.locations).not.toBe(expect.anything());
        expect(location.company).not.toBe(expect.anything());

        await context.lists.Company.updateOne({
          where: { id: company.id },
          data: { locations: { connect: [{ id: location.id }] } },
        });

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id);
        // Everything should now be connected
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id.toString()]);
        expect(Location.company.id.toString()).toBe(Company.id.toString());
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
          data: { locations: { create: [{ name: locationName }] } },
          query: 'id locations { id name }',
        });

        const { Company, Location } = await getCompanyAndLocation(
          context,
          company.id,
          _company.locations[0].id
        );

        // Everything should now be connected
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id.toString()]);
        expect(Location.company.id.toString()).toBe(Company.id.toString());
      })
    );

    test(
      'With disconnect',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query to disconnect the location from company
        const _company = await context.lists.Company.updateOne({
          where: { id: company.id },
          data: { locations: { disconnect: [{ id: location.id }] } },
          query: 'id locations { id name }',
        });
        expect(_company.id).toEqual(company.id);
        expect(_company.locations).toEqual([]);

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id);
        expect(result.Company.locations).toEqual([]);
        expect(result.Location.company).toBe(null);
      })
    );

    test(
      'With set: []',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query to disconnect the location from company
        const _company = await context.lists.Company.updateOne({
          where: { id: company.id },
          data: { locations: { set: [] } },
          query: 'id locations { id name }',
        });
        expect(_company.id).toEqual(company.id);
        expect(_company.locations).toEqual([]);

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id);
        expect(result.Company.locations).toEqual([]);
        expect(result.Location.company).toBe(null);
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
          data: { locations: null },
          query: 'id locations { id name }',
        });

        // Check that the locations are still there
        expect(_company.id).toEqual(company.id);
        expect(_company.locations).toHaveLength(1);
        expect(_company.locations[0].id).toEqual(location.id);
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
        expect(result.Location.company).toBe(null);
      })
    );
  });
});
