const { gen, sampleOne } = require('testcheck');

const { Text, Relationship } = require('@voussoir/fields');
const { resolveAllKeys, mapKeys } = require('@voussoir/utils');
const cuid = require('cuid');

const { setupServer, graphqlRequest } = require('../../util');

const alphanumGenerator = gen.alphaNumString.notEmpty();

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
  test('removes item from list', async () => {
    const groupName = `foo${sampleOne(alphanumGenerator)}`;

    const createGroup = await create('Group', { name: groupName });

    // Create an item to update
    const createEvent = await create('Event', {
      title: 'A thing',
      group: createGroup.id,
    });

    // Avoid false-positives by checking the database directly
    expect(createEvent).toHaveProperty('group');
    expect(createEvent.group.toString()).toBe(createGroup.id);

    // Update the item and link the relationship field
    const updateEvent = await graphqlRequest({
      server,
      query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}"
            data: {
              group: { disconnectAll: true }
            }
          ) {
            id
            group {
              id
            }
          }
        }
    `,
    });

    expect(updateEvent.body.data).toMatchObject({
      updateEvent: {
        id: expect.any(String),
        group: null,
      },
    });
    expect(updateEvent.body).not.toHaveProperty('errors');

    // Avoid false-positives by checking the database directly
    const eventData = await findById('Event', createEvent.id);

    expect(eventData).toHaveProperty('group', null);
  });

  test('silently succeeds if used during create', async () => {
    // Create an item that does the linking
    const {
      body: { data },
    } = await graphqlRequest({
      server,
      query: `
        mutation {
          createEvent(data: {
            group: {
              disconnectAll: true
            }
          }) {
            id
            group {
              id
            }
          }
        }
    `,
    });

    expect(data.createEvent).toMatchObject({
      id: expect.any(String),
      group: null,
    });
    expect(data.createEvent).not.toHaveProperty('errors');
  });

  test('silently succeeds if no item to disconnect during update', async () => {
    // Create an item to link against
    const createEvent = await create('Event', {});

    // Create an item that does the linking
    const {
      body: { data },
    } = await graphqlRequest({
      server,
      query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}",
            data: {
              group: {
                disconnectAll: true
              }
            }
          ) {
            id
            group {
             id
           }
          }
        }
    `,
    });

    expect(data.updateEvent).toMatchObject({
      id: expect.any(String),
      group: null,
    });
    expect(data.updateEvent).not.toHaveProperty('errors');
  });
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test('has no effect when using disconnectAll', async () => {
      const groupContent = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createGroup = await create('GroupNoRead', { content: groupContent });

      // Create an item to update
      const createEvent = await create('EventToGroupNoRead', {
        group: createGroup.id,
      });

      // Avoid false-positives by checking the database directly
      expect(createEvent).toHaveProperty('group');
      expect(createEvent.group.toString()).toBe(createGroup.id);

      // Update the item and link the relationship field
      const { body } = await graphqlRequest({
        server,
        query: `
          mutation {
            updateEventToGroupNoRead(
              id: "${createEvent.id}"
              data: {
                group: { disconnectAll: true }
              }
            ) {
              id
            }
          }
      `,
      });

      expect(body).not.toHaveProperty('data.updateEventToGroupNoRead.errors');

      // Avoid false-positives by checking the database directly
      const eventData = await findById('EventToGroupNoRead', createEvent.id);

      expect(eventData).toHaveProperty('group');
      expect(eventData.group).toBe(null);
    });

    test.failing('silently ignores an item that otherwise would match the filter', () => {
      // TODO: Fill this in when we support more filtering on Unique items than
      // just ID.
      expect(false).toBe(true);
    });
  });
});
