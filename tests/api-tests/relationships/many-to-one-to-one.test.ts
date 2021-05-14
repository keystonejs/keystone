import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { KeystoneContext } from '@keystone-next/types';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

type IdType = any;

const createInitialData = async (context: KeystoneContext) => {
  const companies = (await context.lists.Company.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
  })) as { id: IdType }[];
  const locations = (await context.lists.Location.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
  })) as { id: IdType }[];
  const owners = await context.lists.Owner.createMany({
    data: companies.map(({ id }) => ({ name: `Owner_of_${id}`, companies: { connect: [{ id }] } })),
  });
  const custodians = await context.lists.Custodian.createMany({
    data: locations.map(({ id }) => ({
      name: `Custodian_of_${id}`,
      locations: { connect: [{ id }] },
    })),
  });
  return { locations, companies, owners, custodians };
};

const createCompanyAndLocation = async (context: KeystoneContext) => {
  const [cu1, cu2] = await context.lists.Custodian.createMany({
    data: [{ name: sampleOne(alphanumGenerator) }, { name: sampleOne(alphanumGenerator) }],
  });

  return context.lists.Owner.createOne({
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

const setupKeystone = (provider: ProviderName) =>
  setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
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
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.companies[0].location.custodians[0].name;
            const owners = await context.lists.Owner.findMany({
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
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.name;
            const custodians = await context.lists.Custodian.findMany({
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
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.name;
            const owners = await context.lists.Owner.findMany({
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
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.companies[0].location.custodians[0].name;

            const custodians = await context.lists.Custodian.findMany({
              where: {
                locations: {
                  some: {
                    company: {
                      owners: {
                        some: {
                          companies: {
                            some: {
                              location: { custodians: { some: { name: { equals: name1 } } } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              query: 'id locations { company { owners { name } } } ',
            });
            expect(custodians.length).toEqual(2);
          })
        );
      });
    });
  })
);
