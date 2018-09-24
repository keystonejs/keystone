const { gen, sampleOne } = require('testcheck');

const { Text, Relationship } = require('@voussoir/fields');
const { resolveAllKeys, mapKeys } = require('@voussoir/utils');
const cuid = require('cuid');

const { setupServer, graphqlRequest } = require('../../../util');

const alphanumGenerator = gen.alphaNumString.notEmpty();

jest.setTimeout(6000000);

let server;

beforeAll(() => {
  server = setupServer({
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          location: { type: Relationship, ref: 'Location.company' },
        },
      });

      keystone.createList('Location', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company.location' },
        },
      });
    },
  });

  server.keystone.connect();
});

function create(list, item) {
  return server.keystone.getListByKey(list).adapter.create(item);
}

function findById(list, item) {
  return server.keystone.getListByKey(list).adapter.findById(item);
}

function update(list, id, data) {
  return server.keystone.getListByKey(list).adapter.update(id, data, { new: true });
}

afterAll(async () => {
  // clean the db
  await resolveAllKeys(mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase()));
  // then shut down
  await resolveAllKeys(
    mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase().then(() => adapter.close()))
  );
});

beforeEach(() =>
  // clean the db
  resolveAllKeys(mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase())));

describe('update one to one relationship back reference', () => {
  describe('nested connect', () => {
    test('during create mutation', async () => {
      let location = await create('Location', {});
      const queryResult = await graphqlRequest({
        server,
        query: `
          mutation {
            createCompany(data: {
              location: { connect: { id: "${location.id}" } }
            }) {
              id
              location {
                id
              }
            }
          }
      `,
      });

      expect(queryResult.body).not.toHaveProperty('errors');

      const companyId = queryResult.body.data.createCompany.id;

      location = await findById('Location', location.id);
      const company = await findById('Company', companyId);

      // Everything should now be connected
      expect(company.location.toString()).toBe(location.id.toString());
      expect(location.company.toString()).toBe(companyId.toString());
    });

    test('during update mutation', async () => {
      // Manually setup a connected Company <-> Location
      let location = await create('Location', {});
      let company = await create('Company', {});

      // Sanity check the links don't yet exist
      expect(company.location).toBe(undefined);
      expect(location.company).toBe(undefined);

      const queryResult = await graphqlRequest({
        server,
        query: `
          mutation {
            updateCompany(
              id: "${company.id}",
              data: {
                location: { connect: { id: "${location.id}" } }
              }
            ) {
              id
              location {
                id
              }
            }
          }
      `,
      });

      expect(queryResult.body).not.toHaveProperty('errors');

      location = await findById('Location', location.id);
      company = await findById('Company', company.id);

      // Everything should now be connected
      expect(company.location.toString()).toBe(location.id.toString());
      expect(location.company.toString()).toBe(company.id.toString());
    });
  });

  describe('nested create', () => {
    test('during create mutation', async () => {
      const locationName = sampleOne(alphanumGenerator);
      const queryResult = await graphqlRequest({
        server,
        query: `
          mutation {
            createCompany(data: {
              location: { create: { name: "${locationName}" } }
            }) {
              id
              location {
                id
              }
            }
          }
      `,
      });

      expect(queryResult.body).not.toHaveProperty('errors');

      const companyId = queryResult.body.data.createCompany.id;
      const locationId = queryResult.body.data.createCompany.location.id;

      const location = await findById('Location', locationId);
      const company = await findById('Company', companyId);

      // Everything should now be connected
      expect(company.location.toString()).toBe(locationId.toString());
      expect(location.company.toString()).toBe(companyId.toString());
    });

    test('during update mutation', async () => {
      const locationName = sampleOne(alphanumGenerator);
      let company = await create('Company', {});
      const queryResult = await graphqlRequest({
        server,
        query: `
          mutation {
            updateCompany(
              id: "${company.id}",
              data: {
                location: { create: { name: "${locationName}" } }
              }
            ) {
              id
              location {
                id
                name
              }
            }
          }
      `,
      });

      expect(queryResult.body).not.toHaveProperty('errors');

      const locationId = queryResult.body.data.updateCompany.location.id;

      const location = await findById('Location', locationId);
      company = await findById('Company', company.id);

      // Everything should now be connected
      expect(company.location.toString()).toBe(locationId.toString());
      expect(location.company.toString()).toBe(company.id.toString());
    });
  });

  test('nested disconnect during update mutation', async () => {
    // Manually setup a connected Company <-> Location
    let location = await create('Location', {});
    let company = await create('Company', { location: location.id });
    await update('Location', location.id, { company: company.id });

    location = await findById('Location', location.id);
    company = await findById('Company', company.id);

    // Sanity check the links are setup correctly
    expect(company.location.toString()).toBe(location.id.toString());
    expect(location.company.toString()).toBe(company.id.toString());

    // Run the query to disconnect the location from company
    const queryResult = await graphqlRequest({
      server,
      query: `
        mutation {
          updateCompany(
            id: "${company.id}",
            data: {
              location: { disconnect: { id: "${location.id}" } }
            }
          ) {
            id
            location {
              id
              name
            }
          }
        }
    `,
    });

    expect(queryResult.body).not.toHaveProperty('errors');

    // Check the link has been broken
    location = await findById('Location', location.id);
    company = await findById('Company', company.id);

    expect(company.location).toBe(null);
    expect(location.company).toBe(null);
  });

  test('nested disconnectAll during update mutation', async () => {
    // Manually setup a connected Company <-> Location
    let location = await create('Location', {});
    let company = await create('Company', { location: location.id });
    await update('Location', location.id, { company: company.id });

    location = await findById('Location', location.id);
    company = await findById('Company', company.id);

    // Sanity check the links are setup correctly
    expect(company.location.toString()).toBe(location.id.toString());
    expect(location.company.toString()).toBe(company.id.toString());

    // Run the query to disconnect the location from company
    const queryResult = await graphqlRequest({
      server,
      query: `
        mutation {
          updateCompany(
            id: "${company.id}",
            data: {
              location: { disconnectAll: true }
            }
          ) {
            id
            location {
              id
              name
            }
          }
        }
    `,
    });

    expect(queryResult.body).not.toHaveProperty('errors');

    // Check the link has been broken
    location = await findById('Location', location.id);
    company = await findById('Company', company.id);

    expect(company.location).toBe(null);
    expect(location.company).toBe(null);
  });
});

test('one to one relationship back reference on deletes', async () => {
  // Manually setup a connected Company <-> Location
  let location = await create('Location', {});
  let company = await create('Company', { location: location.id });
  await update('Location', location.id, { company: company.id });

  location = await findById('Location', location.id);
  company = await findById('Company', company.id);

  // Sanity check the links are setup correctly
  expect(company.location.toString()).toBe(location.id.toString());
  expect(location.company.toString()).toBe(company.id.toString());

  // Run the query to disconnect the location from company
  const queryResult = await graphqlRequest({
    server,
    query: `
      mutation {
        deleteCompany(id: "${company.id}") {
          id
        }
      }
  `,
  });

  expect(queryResult.body).not.toHaveProperty('errors');

  // Check the link has been broken
  location = await findById('Location', location.id);
  company = await findById('Company', company.id);

  expect(company).toBe(null);
  expect(location.company).toBe(null);
});
