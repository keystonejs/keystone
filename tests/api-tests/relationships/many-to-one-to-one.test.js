const { gen, sampleOne } = require('testcheck');
const { text, relationship } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { multiAdapterRunners, setupFromConfig } = require('@keystone-next/test-utils-legacy');
const { createItem, createItems } = require('@keystone-next/server-side-graphql-client-legacy');

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async context => {
  const { data, errors } = await context.executeGraphQL({
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

const createCompanyAndLocation = async context => {
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

const setupKeystone = adapterName =>
  setupFromConfig({
    adapterName,
    config: createSchema({
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
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allOwners(where: { companies_some: { location: { custodians_some: { name: "${name1}" } } } }) { id companies { location { custodians { name } } } }
                }`,
            });
            expect(errors).toBe(undefined);
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
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allCustodians(where: { locations_some: { company: { owners_some: { name: "${name1}" } } } }) { id locations { company { owners { name } } } }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.allCustodians.length).toEqual(2);
          })
        );
        test(
          'Where C',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const owner = await createCompanyAndLocation(context);
            const name1 = owner.name;
            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allOwners(where: { companies_some: { location: { custodians_some: { locations_some: { company: { owners_some: { name: "${name1}" } } } } } } }) { id companies { location { custodians { name } } } }
                }`,
            });
            expect(errors).toBe(undefined);
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

            const { data, errors } = await context.executeGraphQL({
              query: `{
                  allCustodians(where: { locations_some: { company: { owners_some: { companies_some: { location: { custodians_some: { name: "${name1}" } } } } } } }) { id locations { company { owners { name } } } }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.allCustodians.length).toEqual(2);
          })
        );
      });
    });
  })
);
