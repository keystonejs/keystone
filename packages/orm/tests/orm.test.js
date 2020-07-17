const { Text, Integer } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

const {
  createItems,
  createItem,
  getItem,
  getAllItems,
  updateItem,
  updateItems,
} = require('../lib/orm');

const testData = [
  {
    data: {
      name: 'test',
      age: 30,
    },
  },
  { data: { name: 'test2', age: 40 } },
];

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Test', {
        fields: {
          name: { type: Text },
          age: { type: Integer },
        },
      });
    },
  });
}

const schemaName = 'testing';

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('createItems', () => {
      test(
        'Should create and get single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const { createTest } = await createItem({
            keystone,
            listName: 'Test',
            item: testData[0].data,
            schemaName,
          });

          // Get single item from db
          const item = await getItem({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            item: createTest.id,
            schemaName,
          });

          expect(item).toEqual({ Test: testData[0].data });
        })
      );
      test(
        'Should create and get multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await createItems({ keystone, listName: 'Test', items: testData, schemaName });

          // Get all the items back from db
          const allItems = await getAllItems({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            schemaName,
          });

          expect(allItems).toEqual(testData.map(x => x.data));
        })
      );
    });
    describe('udpate items', () => {
      test(
        'Should update single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db with single item
          const { createTest } = await createItem({
            keystone,
            listName: 'Test',
            item: testData[0].data,
            schemaName,
          });

          // Update a single item
          await updateItem({
            keystone,
            listName: 'Test',
            item: { id: createTest.id, data: { name: 'updateTest' } },
            schemaName,
          });

          // Get updated item back from db using id: `createTest.id`
          const item = await getItem({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            item: createTest.id,
            schemaName,
          });

          expect(item).toEqual({ Test: { name: 'updateTest', age: 30 } });
        })
      );
    });
  })
);
