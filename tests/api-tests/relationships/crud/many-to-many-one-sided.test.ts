import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import type { KeystoneContext } from '@keystone-next/types';
import { apiTestConfig } from '../../utils';

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
  const company = await context.lists.Company.createOne({
    data: { locations: { create: [{ name: sampleOne(alphanumGenerator) }] } },
    query: 'id locations { id }',
  });
  const { Company, Location } = await getCompanyAndLocation(
    context,
    company.id,
    company.locations[0].id
  );

  // Sanity check the links are setup correctly
  expect(Company.locations.map(({ id }) => id.toString())).toStrictEqual([Location.id.toString()]);

  return { company, location: company.locations[0] };
};

const getCompanyAndLocation = async (
  context: KeystoneContext,
  companyId: IdType,
  locationId: IdType
) => {
  type T = {
    data: { Company: { id: IdType; locations: { id: IdType }[] }; Location: { id: IdType } };
  };
  const { data } = (await context.graphql.raw({
    query: `
      {
        Company(where: { id: "${companyId}"} ) { id locations { id } }
        Location(where: { id: "${locationId}"} ) { id }
      }`,
  })) as T;
  return data;
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C];
  const data = ['A', 'A', 'B', 'B', 'C', 'C'].map(name => ({ data: { name } }));
  const locations = await context.lists.Location.createMany({ data, query: 'id name' });
  await Promise.all(
    [
      [0, 1, 2, 3, 4, 5], //  -> [A, A, B, B, C, C]
      [0, 2, 4], //  -> [A, B, C]
      [0, 1], //  -> [A, A]
      [0, 2], //  -> [A, B]
      [0, 4], //  -> [A, C]a
      [2, 3], //  -> [B, B]
      [0], //  -> [A]
      [2], //  -> [B]
      [], //  -> []
    ].map(async locationIdxs => {
      await context.lists.Company.createOne({
        data: { locations: { connect: locationIdxs.map(i => ({ id: locations[i].id })) } },
        query: 'id locations { name }',
      });
    })
  );
};

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      Company: list({
        fields: { name: text(), locations: relationship({ ref: 'Location', many: true }) },
      }),
      Location: list({ fields: { name: text() } }),
    }),
  }),
});

describe(`Many-to-many relationships`, () => {
  describe('Read', () => {
    test(
      '_some',
      runner(async ({ context }) => {
        await createReadData(context);
        await Promise.all(
          [
            ['A', 6],
            ['B', 5],
            ['C', 3],
            ['D', 0],
          ].map(async ([name, count]) => {
            const companies = await context.lists.Company.findMany({
              where: { locations_some: { name } },
            });
            expect(companies.length).toEqual(count);
          })
        );
      })
    );
    test(
      '_none',
      runner(async ({ context }) => {
        await createReadData(context);
        await Promise.all(
          [
            ['A', 3],
            ['B', 4],
            ['C', 6],
            ['D', 9],
          ].map(async ([name, count]) => {
            const companies = await context.lists.Company.findMany({
              where: { locations_none: { name } },
            });
            expect(companies.length).toEqual(count);
          })
        );
      })
    );
    test(
      '_every',
      runner(async ({ context }) => {
        await createReadData(context);
        await Promise.all(
          [
            ['A', 3],
            ['B', 3],
            ['C', 1],
            ['D', 1],
          ].map(async ([name, count]) => {
            const companies = await context.lists.Company.findMany({
              where: { locations_every: { name } },
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

    test(
      '_some',
      runner(async ({ context }) => {
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
      runner(async ({ context }) => {
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
      runner(async ({ context }) => {
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
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id.toString()]);
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

        await context.lists.Company.updateOne({
          id: company.id,
          data: { locations: { connect: [{ id: location.id }] } },
          query: 'id locations { id }',
        });

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id);
        // Everything should now be connected
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id.toString()]);
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
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
        expect(Company.locations.map(({ id }) => id.toString())).toEqual([Location.id.toString()]);
      })
    );

    test(
      'With disconnect',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query to disconnect the location from company
        const _company = await context.lists.Company.updateOne({
          id: company.id,
          data: { locations: { disconnect: [{ id: location.id }] } },
          query: 'id locations { id name }',
        });
        expect(_company.id).toEqual(company.id);
        expect(_company.locations).toEqual([]);

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id);
        expect(result.Company.locations).toEqual([]);
      })
    );

    test(
      'With disconnectAll',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query to disconnect the location from company
        const _company = await context.lists.Company.updateOne({
          id: company.id,
          data: { locations: { disconnectAll: true } },
          query: 'id locations { id name }',
        });
        expect(_company.id).toEqual(company.id);
        expect(_company.locations).toEqual([]);

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id);
        expect(result.Company.locations).toEqual([]);
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context);

        // Run the query with a null operation
        const _company = await context.lists.Company.updateOne({
          id: company.id,
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
        const _company = await context.lists.Company.deleteOne({ id: company.id });
        expect(_company?.id).toBe(company.id);

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id);
        expect(result.Company).toBe(null);
      })
    );
  });
});
