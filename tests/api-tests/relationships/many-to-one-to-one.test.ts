import { AdapterName, testConfig } from '@keystone-next/test-utils-legacy';
import { KeystoneContext } from '@keystone-next/types';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import { createItem, createItems } from '@keystone-next/server-side-graphql-client-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

type IdType = any;

const createInitialData = async (context: KeystoneContext) => {
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
          { data: { name: "${sampleOne(alphanumGenerator)}" } }
        ]) { id }
      }`,
  })) as { createCompanies: { id: IdType }[]; createLocations: { id: IdType }[] };
  const owners = await createItems({
    context,
    listKey: 'Owner',
    items: data.createCompanies.map(({ id }) => ({
      data: { name: `Owner_of_${id}`, companies: { connect: [{ id }] } },
    })),
  });
  const custodians = await createItems({
    context,
    listKey: 'Custodian',
    items: data.createLocations.map(({ id }) => ({
      data: { name: `Custodian_of_${id}`, locations: { connect: [{ id }] } },
    })),
  });
  return { locations: data.createLocations, companies: data.createCompanies, owners, custodians };
};

const createCompanyAndLocation = async (context: KeystoneContext) => {
  const [cu1, cu2] = await createItems({
    context,
    listKey: 'Custodian',
    items: [
      { data: { name: sampleOne(alphanumGenerator) } },
      { data: { name: sampleOne(alphanumGenerator) } },
    ],
  });

  return createItem({
    context,
    listKey: 'Owner',
    item: {
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
    returnFields: 'id name companies { id name location { id name custodians { id name } } }',
  });
};

const setupKeystone = (adapterName: AdapterName) =>
  setupFromConfig({
    adapterName,
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

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe(`One-to-one relationships`, () => {
      describe('Read', () => {
        test(
          'Where A',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.companies[0].location.custodians[0].name;
            const data = await context.graphql.run({
              query: `{
                  allOwners(where: { companies_some: { location: { custodians_some: { name: "${name1}" } } } }) { id companies { location { custodians { name } } } }
                }`,
            });
            expect(data.allOwners.length).toEqual(1);
            expect(data.allOwners[0].id).toEqual(owner.id);
          })
        );
        test(
          'Where B',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.name;
            const data = await context.graphql.run({
              query: `{
                  allCustodians(where: { locations_some: { company: { owners_some: { name: "${name1}" } } } }) { id locations { company { owners { name } } } }
                }`,
            });
            expect(data.allCustodians.length).toEqual(2);
          })
        );
        test(
          'Where C',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.name;
            const data = await context.graphql.run({
              query: `{
                  allOwners(where: { companies_some: { location: { custodians_some: { locations_some: { company: { owners_some: { name: "${name1}" } } } } } } }) { id companies { location { custodians { name } } } }
                }`,
            });
            expect(data.allOwners.length).toEqual(1);
            expect(data.allOwners[0].id).toEqual(owner.id);
          })
        );
        test(
          'Where D',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.companies[0].location.custodians[0].name;

            const data = await context.graphql.run({
              query: `{
                  allCustodians(where: { locations_some: { company: { owners_some: { companies_some: { location: { custodians_some: { name: "${name1}" } } } } } } }) { id locations { company { owners { name } } } }
                }`,
            });
            expect(data.allCustodians.length).toEqual(2);
          })
        );
      });
    });
  })
);
