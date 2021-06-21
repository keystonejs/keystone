import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { KeystoneContext } from '@keystone-next/types';
import { apiTestConfig } from '../utils';

type IdType = any;

const createInitialData = async (context: KeystoneContext) => {
  const roles = (await context.lists.Role.createMany({
    data: [{ data: { name: 'RoleA' } }, { data: { name: 'RoleB' } }, { data: { name: 'RoleC' } }],
    query: 'id name',
  })) as { id: IdType; name: string }[];
  const companies = (await context.lists.Company.createMany({
    data: [
      { data: { name: 'CompanyA' } },
      { data: { name: 'CompanyB' } },
      { data: { name: 'CompanyC' } },
    ],
    query: 'id name',
  })) as { id: IdType; name: string }[];
  const employees = (await context.lists.Employee.createMany({
    data: [
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
    query: 'id name',
  })) as { id: IdType; name: string }[];
  await context.lists.Location.createMany({
    data: [
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
    query: 'id name',
  });
  await context.lists.Role.updateMany({
    data: [
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

const runner = setupTestRunner({
  config: apiTestConfig({
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

test(
  'Query',
  runner(async ({ context }) => {
    await createInitialData(context);
    const employees = await context.lists.Employee.findMany({
      where: { company: { employees_some: { role: { name: 'RoleA' } } } },
      query: 'id name',
    });
    expect(employees).toHaveLength(1);
    expect(employees[0].name).toEqual('EmployeeA');
  })
);
