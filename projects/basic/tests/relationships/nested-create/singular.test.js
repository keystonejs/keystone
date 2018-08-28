const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const { resolveAllKeys, mapKeys } = require('@keystonejs/utils');
const cuid = require('cuid');

const { setupServer, graphqlRequest } = require('../../util');

let server;

beforeAll(() => {
  server = setupServer({
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Group', {
        fields: {
          name: { type: Text },
        },
      });

      keystone.createList('Event', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'Group' },
        },
      });

      keystone.createList('GroupNoRead', {
        fields: {
          name: { type: Text },
        },
        access: {
          read: () => false,
        },
      });

      keystone.createList('EventToGroupNoRead', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoRead' },
        },
      });

      keystone.createList('GroupNoCreate', {
        fields: {
          name: { type: Text },
        },
        access: {
          create: () => false,
        },
      });

      keystone.createList('EventToGroupNoCreate', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoCreate' },
        },
      });
    },
  });

  server.keystone.connect();
});

function create(list, item) {
  return server.keystone.getListByKey(list).adapter.create(item);
}

function findOne(list, item) {
  return server.keystone.getListByKey(list).adapter.findOne(item);
}

function findById(list, item) {
  return server.keystone.getListByKey(list).adapter.findById(item);
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

describe('no access control', () => {
  test('link nested from within create mutation', async () => {
    const groupName = sampleOne(gen.alphaNumString.notEmpty());

    // Create an item to link against
    const createGroup = await create('Group', { name: groupName });

    // Create an item that does the linking
    const { body } = await graphqlRequest({
      server,
      query: `
        mutation {
          createEvent(data: {
            title: "A thing",
            group: { id: "${createGroup.id}" }
          }) {
            id
          }
        }
    `,
    });

    expect(body.data).toMatchObject({
      createEvent: { id: expect.any(String) },
    });
    expect(body).not.toHaveProperty('errors');
  });

  test('create nested from within create mutation', async () => {
    const groupName = sampleOne(gen.alphaNumString.notEmpty());

    // Create an item that does the nested create
    const createEvent = await graphqlRequest({
      server,
      query: `
        mutation {
          createEvent(data: {
            title: "A thing",
            group: { create: { name: "${groupName}" } }
          }) {
            id
            group {
              id
              name
            }
          }
        }
    `,
    });

    expect(createEvent.body).not.toHaveProperty('errors');
    expect(createEvent.body.data).toMatchObject({
      createEvent: {
        id: expect.any(String),
        group: {
          id: expect.any(String),
          name: groupName,
        },
      },
    });

    const {
      body: {
        data: { Group },
      },
    } = await graphqlRequest({
      server,
      query: `
        query {
          Group(where: { id: "${createEvent.body.data.createEvent.group.id}" }) {
            id
            name
          }
        }
    `,
    });

    expect(Group).toMatchObject({
      id: createEvent.body.data.createEvent.group.id,
      name: groupName,
    });
  });

  test('link nested from within update mutation', async () => {
    const groupName = sampleOne(gen.alphaNumString.notEmpty());

    // Create an item to link against
    const createGroup = await create('Group', { name: groupName });

    // Create an item to update
    const {
      body: {
        data: { createEvent },
      },
    } = await graphqlRequest({
      server,
      query: 'mutation { createEvent(data: { title: "A thing", }) { id } }',
    });

    // Update the item and link the relationship field
    const { body } = await graphqlRequest({
      server,
      query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}"
            data: {
              title: "A thing",
              group: { id: "${createGroup.id}" }
            }
          ) {
            id
            group {
              id
              name
            }
          }
        }
    `,
    });

    expect(body.data).toMatchObject({
      updateEvent: {
        id: expect.any(String),
        group: {
          id: expect.any(String),
          name: groupName,
        },
      },
    });
    expect(body).not.toHaveProperty('errors');
  });

  test('create nested from within update mutation', async () => {
    const groupName = sampleOne(gen.alphaNumString.notEmpty());

    // Create an item to update
    const createEvent = await create('Event', { title: 'A thing' });

    // Update an item that does the nested create
    const updateEvent = await graphqlRequest({
      server,
      query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}"
            data: {
              title: "A thing",
              group: { create: { name: "${groupName}" } }
            }
          ) {
            id
            group {
              id
              name
            }
          }
        }
    `,
    });

    expect(updateEvent.body).not.toHaveProperty('errors');
    expect(updateEvent.body.data).toMatchObject({
      updateEvent: {
        id: expect.any(String),
        group: {
          id: expect.any(String),
          name: groupName,
        },
      },
    });

    const {
      body: {
        data: { Group },
      },
    } = await graphqlRequest({
      server,
      query: `
        query {
          Group(where: { id: "${updateEvent.body.data.updateEvent.group.id}" }) {
            id
            name
          }
        }
    `,
    });

    expect(Group).toMatchObject({
      id: updateEvent.body.data.updateEvent.group.id,
      name: groupName,
    });
  });
});

describe('errors on incomplete data', () => {
  test('when neither id or create data passed', async () => {
    // Create an item that does the linking
    const createEvent = await graphqlRequest({
      server,
      query: `
        mutation {
          createEvent(data: { group: {} }) {
            id
          }
        }
    `,
    });

    expect(createEvent.body).toHaveProperty('data.createEvent', null);
    expect(createEvent.body.errors).toMatchObject([
      {
        name: 'NestedError',
        data: {
          errors: [
            {
              path: ['createEvent', 'group'],
              name: 'ParameterError',
            },
          ],
        },
      },
    ]);
  });

  test('when both id and create data passed', async () => {
    // Create an item that does the linking
    const createEvent = await graphqlRequest({
      server,
      query: `
        mutation {
          createEvent(data: { group: { id: "abc123", create: { name: "foo" } } }) {
            id
          }
        }
    `,
    });

    expect(createEvent.body).toHaveProperty('data.createEvent', null);
    expect(createEvent.body.errors).toMatchObject([
      {
        name: 'NestedError',
        data: {
          errors: [
            {
              path: ['createEvent', 'group'],
              name: 'ParameterError',
            },
          ],
        },
      },
    ]);
  });
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test('does not throw error when linking nested within create mutation', async () => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to link against
      const createGroupNoRead = await create('GroupNoRead', {
        name: groupName,
      });

      // Create an item that does the linking
      const { body } = await graphqlRequest({
        server,
        query: `
          mutation {
            createEventToGroupNoRead(data: {
              title: "A thing",
              group: { id: "${createGroupNoRead.id}" }
            }) {
              id
            }
          }
      `,
      });

      expect(body.data).toMatchObject({
        createEventToGroupNoRead: { id: expect.any(String) },
      });
      expect(body).not.toHaveProperty('errors');

      // See that it actually stored the group ID on the Event record
      const event = await findOne('EventToGroupNoRead', { title: 'A thing' });
      expect(event).toBeTruthy();
      expect(event.group.toString()).toEqual(createGroupNoRead.id);
    });

    test('does not throw error when creating nested within create mutation', async () => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item that does the nested create
      const createEventToGroupNoRead = await graphqlRequest({
        server,
        query: `
          mutation {
            createEventToGroupNoRead(data: {
              title: "A thing",
              group: { create: { name: "${groupName}" } }
            }) {
              id
            }
          }
      `,
      });

      expect(createEventToGroupNoRead.body).not.toHaveProperty('errors');
      expect(createEventToGroupNoRead.body.data).toMatchObject({
        createEventToGroupNoRead: { id: expect.any(String) },
      });

      // See that it actually stored the group ID on the Event record
      const event = await findOne('EventToGroupNoRead', { title: 'A thing' });
      expect(event).toBeTruthy();
      expect(event.group).toBeTruthy();

      const group = await findById('GroupNoRead', event.group);
      expect(group).toBeTruthy();
      expect(group.name).toBe(groupName);
    });

    test('does not throw error when linking nested within update mutation', async () => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to link against
      const createGroupNoRead = await create('GroupNoRead', {
        name: groupName,
      });

      expect(createGroupNoRead.id).toBeTruthy();

      // Create an item to update
      const {
        body: {
          data: { createEventToGroupNoRead },
        },
      } = await graphqlRequest({
        server,
        query: 'mutation { createEventToGroupNoRead(data: { title: "A thing", }) { id } }',
      });

      expect(createEventToGroupNoRead.id).toBeTruthy();

      // Update the item and link the relationship field
      const { body } = await graphqlRequest({
        server,
        query: `
          mutation {
            updateEventToGroupNoRead(
              id: "${createEventToGroupNoRead.id}"
              data: {
                title: "A thing",
                group: { id: "${createGroupNoRead.id}" }
              }
            ) {
              id
            }
          }
      `,
      });

      expect(body.data).toMatchObject({
        updateEventToGroupNoRead: {
          id: expect.any(String),
        },
      });
      expect(body).not.toHaveProperty('errors');

      // See that it actually stored the group ID on the Event record
      const event = await findOne('EventToGroupNoRead', { title: 'A thing' });
      expect(event).toBeTruthy();
      expect(event.group.toString()).toEqual(createGroupNoRead.id);
    });

    test('does not throw error when creating nested within update mutation', async () => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to update
      const createEventToGroupNoRead = await create('EventToGroupNoRead', {
        title: 'A thing',
      });

      // Update an item that does the nested create
      const updateEventToGroupNoRead = await graphqlRequest({
        server,
        query: `
          mutation {
            updateEventToGroupNoRead(
              id: "${createEventToGroupNoRead.id}"
              data: {
                title: "A thing",
                group: { create: { name: "${groupName}" } }
              }
            ) {
              id
            }
          }
      `,
      });

      expect(updateEventToGroupNoRead.body).not.toHaveProperty('errors');
      expect(updateEventToGroupNoRead.body.data).toMatchObject({
        updateEventToGroupNoRead: { id: expect.any(String) },
      });

      // See that it actually stored the group ID on the Event record
      const event = await findOne('EventToGroupNoRead', { title: 'A thing' });
      expect(event).toBeTruthy();
      expect(event.group).toBeTruthy();

      const group = await findById('GroupNoRead', event.group);
      expect(group).toBeTruthy();
      expect(group.name).toBe(groupName);
    });
  });

  describe('create: false on related list', () => {
    test('does not throw error when linking nested within create mutation', async () => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to link against
      // We can't use the graphQL query here (it's `create: () => false`)
      const { id } = await create('GroupNoCreate', { name: groupName });

      // Create an item that does the linking
      const { body } = await graphqlRequest({
        server,
        query: `
          mutation {
            createEventToGroupNoCreate(data: {
              title: "A thing",
              group: { id: "${id}" }
            }) {
              id
              group {
                id
              }
            }
          }
      `,
      });

      expect(body.data).toMatchObject({
        createEventToGroupNoCreate: { id: expect.any(String), group: { id } },
      });
      expect(body).not.toHaveProperty('errors');
    });

    test('throws error when creating nested within create mutation', async () => {
      const alphaNumGenerator = gen.alphaNumString.notEmpty();
      const eventName = sampleOne(alphaNumGenerator);
      const groupName = sampleOne(alphaNumGenerator);

      // Create an item that does the nested create
      const createEventToGroupNoCreate = await graphqlRequest({
        server,
        query: `
          mutation {
            createEventToGroupNoCreate(data: {
              title: "${eventName}",
              group: { create: { name: "${groupName}" } }
            }) {
              id
            }
          }
      `,
      });

      // Assert it throws an access denied error
      expect(createEventToGroupNoCreate.body).toHaveProperty(
        'data.createEventToGroupNoCreate',
        null
      );
      expect(createEventToGroupNoCreate.body.errors).toMatchObject([
        {
          name: 'NestedError',
          data: {
            errors: [
              {
                path: ['createEventToGroupNoCreate', 'group', 'create'],
              },
            ],
          },
        },
      ]);

      // Confirm it didn't insert either of the records anyway
      const {
        body: {
          data: { allGroupNoCreates },
        },
      } = await graphqlRequest({
        server,
        query: `
          query {
            allGroupNoCreates(where: { name: "${groupName}" }) {
              id
              name
            }
          }
      `,
      });

      expect(allGroupNoCreates).toMatchObject([]);

      // Confirm it didn't insert either of the records anyway
      const {
        body: {
          data: { allEventToGroupNoCreates },
        },
      } = await graphqlRequest({
        server,
        query: `
          query {
            allEventToGroupNoCreates(where: { title: "${eventName}" }) {
              id
              title
            }
          }
      `,
      });

      expect(allEventToGroupNoCreates).toMatchObject([]);
    });

    test('does not throw error when linking nested within update mutation', async () => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to link against
      // We can't use the graphQL query here (it's `create: () => false`)
      const createGroupNoCreate = await create('GroupNoCreate', {
        name: groupName,
      });

      // Create an item to update
      const createEventToGroupNoCreate = await create('EventToGroupNoCreate', {
        title: 'A Thing',
      });

      // Update the item and link the relationship field
      const { body } = await graphqlRequest({
        server,
        query: `
          mutation {
            updateEventToGroupNoCreate(
              id: "${createEventToGroupNoCreate.id}"
              data: {
                title: "A thing",
                group: { id: "${createGroupNoCreate.id}" }
              }
            ) {
              id
              group {
                id
                name
              }
            }
          }
      `,
      });

      expect(body.data).toMatchObject({
        updateEventToGroupNoCreate: {
          id: expect.any(String),
          group: {
            id: expect.any(String),
            name: groupName,
          },
        },
      });
      expect(body).not.toHaveProperty('errors');

      // See that it actually stored the group ID on the Event record
      const event = await findOne('EventToGroupNoCreate', { title: 'A thing' });
      expect(event).toBeTruthy();
      expect(event.group).toBeTruthy();

      const group = await findById('GroupNoCreate', event.group);
      expect(group).toBeTruthy();
      expect(group.name).toBe(groupName);
    });

    test('throws error when creating nested within update mutation', async () => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to update
      const createEventToGroupNoCreate = await create('EventToGroupNoCreate', {
        title: 'A thing',
      });

      // Update an item that does the nested create
      const updateEventToGroupNoCreate = await graphqlRequest({
        server,
        query: `
          mutation {
            updateEventToGroupNoCreate(
              id: "${createEventToGroupNoCreate.id}"
              data: {
                title: "A thing",
                group: { create: { name: "${groupName}" } }
              }
            ) {
              id
            }
          }
      `,
      });

      // Assert it throws an access denied error
      expect(updateEventToGroupNoCreate.body).toHaveProperty(
        'data.updateEventToGroupNoCreate',
        null
      );
      expect(updateEventToGroupNoCreate.body.errors).toMatchObject([
        {
          name: 'NestedError',
          data: {
            errors: [
              {
                path: ['updateEventToGroupNoCreate', 'group', 'create'],
              },
            ],
          },
        },
      ]);

      // Confirm it didn't insert the record anyway
      const {
        body: {
          data: { allGroupNoCreates },
        },
      } = await graphqlRequest({
        server,
        query: `
          query {
            allGroupNoCreates(where: { name: "${groupName}" }) {
              id
              name
            }
          }
      `,
      });

      expect(allGroupNoCreates).toMatchObject([]);
    });
  });
});
