import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  AdapterName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';
import { createItems, updateItems } from '@keystone-next/server-side-graphql-client-legacy';
import { KeystoneContext } from '@keystone-next/types';

type IdType = any;

const createInitialData = async (context: KeystoneContext) => {
  const roles = (await createItems({
    context,
    listKey: 'Role',
    items: [{ data: { name: 'RoleA' } }, { data: { name: 'RoleB' } }, { data: { name: 'RoleC' } }],
    returnFields: 'id name',
  })) as { id: IdType; name: string }[];
  const companies = (await createItems({
    context,
    listKey: 'Company',
    items: [
      { data: { name: 'CompanyA' } },
      { data: { name: 'CompanyB' } },
      { data: { name: 'CompanyC' } },
    ],
    returnFields: 'id name',
  })) as { id: IdType; name: string }[];
  const employees = (await createItems({
    context,
    listKey: 'Employee',
    items: [
      {
        data: {
          name: 'EmployeeA',
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyA')!.id } },
          role: { connect: { id: roles.find(({ name }) => name === 'RoleA')!.id } },
        },
      },
      {
        data: {
          name: 'EmployeeB',
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyB')!.id } },
          role: { connect: { id: roles.find(({ name }) => name === 'RoleB')!.id } },
        },
      },
      {
        data: {
          name: 'EmployeeC',
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyC')!.id } },
          role: { connect: { id: roles.find(({ name }) => name === 'RoleC')!.id } },
        },
      },
    ],
    returnFields: 'id name',
  })) as { id: IdType; name: string }[];
  await createItems({
    context,
    listKey: 'Location',
    items: [
      {
        data: {
          name: 'LocationA',
          employees: {
            connect: employees
              .filter(e => ['EmployeeA', 'EmployeeB'].includes(e.name))
              .map(e => ({ id: e.id })),
          },
        },
      },
      {
        data: {
          name: 'LocationB',
          employees: {
            connect: employees
              .filter(e => ['EmployeeB', 'EmployeeC'].includes(e.name))
              .map(e => ({ id: e.id })),
          },
        },
      },
      {
        data: {
          name: 'LocationC',
          employees: {
            connect: employees
              .filter(e => ['EmployeeC', 'EmployeeA'].includes(e.name))
              .map(e => ({ id: e.id })),
          },
        },
      },
    ],
    returnFields: 'id name',
  });
  await updateItems({
    context,
    listKey: 'Role',
    items: [
      {
        id: roles.find(({ name }) => name === 'RoleA')!.id,
        data: {
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyA')!.id } },
          employees: { connect: [{ id: employees.find(({ name }) => name === 'EmployeeA')!.id }] },
        },
      },
      {
        id: roles.find(({ name }) => name === 'RoleB')!.id,
        data: {
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyB')!.id } },
          employees: { connect: [{ id: employees.find(({ name }) => name === 'EmployeeB')!.id }] },
        },
      },
      {
        id: roles.find(({ name }) => name === 'RoleC')!.id,
        data: {
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyC')!.id } },
          employees: { connect: [{ id: employees.find(({ name }) => name === 'EmployeeC')!.id }] },
        },
      },
    ],
  });
};

const setupKeystone = (adapterName: AdapterName) =>
  setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        Employee: list({
          fields: {
            name: text(),
            company: relationship({ ref: 'Company.employees', many: false }),
            role: relationship({ ref: 'Role', many: false }),
          },
        }),
        Company: list({
          fields: {
            name: text(),
            employees: relationship({ ref: 'Employee.company', many: true }),
          },
        }),
        Role: list({
          fields: {
            name: text(),
            company: relationship({ ref: 'Company', many: false }),
            employees: relationship({ ref: 'Employee', many: true }),
          },
        }),
        Location: list({
          fields: {
            name: text(),
            employees: relationship({ ref: 'Employee', many: true }),
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    test(
      'Query',
      runner(setupKeystone, async ({ context }) => {
        await createInitialData(context);
        const data = await context.graphql.run({
          query: `{
                  allEmployees(where: {
                    company: { employees_some: { role: { name: "RoleA" } } }
                  }) { id name }
                }`,
        });
        expect(data.allEmployees).toHaveLength(1);
        expect(data.allEmployees[0].name).toEqual('EmployeeA');
      })
    );
  })
);
