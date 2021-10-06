import { KeystoneContext } from '@keystone-next/keystone/types';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

type IdType = any;

const createInitialData = async (context: KeystoneContext) => {
  const companies = (await context.query.Company.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
  })) as { id: IdType }[];
  const locations = (await context.query.Location.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
  })) as { id: IdType }[];
  const owners = await context.query.Owner.createMany({
    data: companies.map(({ id }) => ({ name: `Owner_of_${id}`, companies: { connect: [{ id }] } })),
  });
  const custodians = await context.query.Custodian.createMany({
    data: locations.map(({ id }) => ({
      name: `Custodian_of_${id}`,
      locations: { connect: [{ id }] },
    })),
  });
  return { locations, companies, owners, custodians };
};

const createCompanyAndLocation = async (context: KeystoneContext) => {
  const [cu1, cu2] = await context.query.Custodian.createMany({
    data: [{ name: sampleOne(alphanumGenerator) }, { name: sampleOne(alphanumGenerator) }],
  });

  return context.query.Owner.createOne({
    data: {
      name: sampleOne(alphanumGenerator),
      companies: {
        create: [
          {
            name: sampleOne(alphanumGenerator),
            location: {
              create: {
                name: sampleOne(alphanumGenerator),
                custodians: { connect: [{ id: cu1.id }] },
              },
            },
          },
          {
            name: sampleOne(alphanumGenerator),
            location: {
              create: {
                name: sampleOne(alphanumGenerator),
                custodians: { connect: [{ id: cu1.id }] },
              },
            },
          },
          {
            name: sampleOne(alphanumGenerator),
            location: {
              create: {
                name: sampleOne(alphanumGenerator),
                custodians: { connect: [{ id: cu2.id }] },
              },
            },
          },
        ],
      },
    },
    query: 'id name companies { id name location { id name custodians { id name } } }',
  });
};

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Owner: list({
        fields: {
          name: text(),
          companies: relationship({ ref: 'Company.owners', many: true }),
        },
      }),
      Company: list({
        fields: {
          name: text(),
          location: relationship({ ref: 'Location.company' }),
          owners: relationship({ ref: 'Owner.companies', many: true }),
        },
      }),
      Location: list({
        fields: {
          name: text(),
          company: relationship({ ref: 'Company.location' }),
          custodians: relationship({ ref: 'Custodian.locations', many: true }),
        },
      }),
      Custodian: list({
        fields: {
          name: text(),
          locations: relationship({ ref: 'Location.custodians', many: true }),
        },
      }),
    },
  }),
});

describe(`One-to-one relationships`, () => {
  describe('Read', () => {
    test(
      'Where A',
      runner(async ({ context }) => {
        await createInitialData(context);
        const owner = await createCompanyAndLocation(context);
        const name1 = owner.companies[0].location.custodians[0].name;
        const owners = await context.query.Owner.findMany({
          where: {
            companies: {
              some: { location: { custodians: { some: { name: { equals: name1 } } } } },
            },
          },
          query: 'id companies { location { custodians { name } } }',
        });
        expect(owners.length).toEqual(1);
        expect(owners[0].id).toEqual(owner.id);
      })
    );
    test(
      'Where B',
      runner(async ({ context }) => {
        await createInitialData(context);
        const owner = await createCompanyAndLocation(context);
        const name1 = owner.name;
        const custodians = await context.query.Custodian.findMany({
          where: {
            locations: { some: { company: { owners: { some: { name: { equals: name1 } } } } } },
          },
          query: 'id locations { company { owners { name } } }',
        });
        expect(custodians.length).toEqual(2);
      })
    );
    test(
      'Where C',
      runner(async ({ context }) => {
        await createInitialData(context);
        const owner = await createCompanyAndLocation(context);
        const name1 = owner.name;
        const owners = await context.query.Owner.findMany({
          where: {
            companies: {
              some: {
                location: {
                  custodians: {
                    some: {
                      locations: {
                        some: { company: { owners: { some: { name: { equals: name1 } } } } },
                      },
                    },
                  },
                },
              },
            },
          },
          query: 'id companies { location { custodians { name } } }',
        });
        expect(owners.length).toEqual(1);
        expect(owners[0].id).toEqual(owner.id);
      })
    );
    test(
      'Where D',
      runner(async ({ context }) => {
        await createInitialData(context);
        const owner = await createCompanyAndLocation(context);
        const name1 = owner.companies[0].location.custodians[0].name;

        const custodians = await context.query.Custodian.findMany({
          where: {
            locations: {
              some: {
                company: {
                  owners: {
                    some: {
                      companies: {
                        some: { location: { custodians: { some: { name: { equals: name1 } } } } },
                      },
                    },
                  },
                },
              },
            },
          },
          query: 'id locations { company { owners { name } } }',
        });
        expect(custodians.length).toEqual(2);
      })
    );
  });
});
