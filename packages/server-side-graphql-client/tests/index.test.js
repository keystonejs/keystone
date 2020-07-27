const { Text, Integer } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

const {
  createItems,
  createItem,
  deleteItem,
  deleteItems,
  getItemById,
  getItems,
  updateItem,
  updateItems,
} = require('../lib/server-side-graphql-client');

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
    describe('create', () => {
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
          const item = await getItemById({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            itemId: createTest.id,
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
          const allItems = await getItems({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            schemaName,
          });

          expect(allItems).toEqual(testData.map(x => x.data));
        })
      );
    });
    describe('udpate', () => {
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
          const item = await getItemById({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            itemId: createTest.id,
            schemaName,
          });

          expect(item).toEqual({ Test: { name: 'updateTest', age: 30 } });
        })
      );

      test(
        'Should update multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const { createTests: items } = await createItems({
            keystone,
            listName: 'Test',
            items: testData,
            schemaName,
          });

          // Update multiple items
          await updateItems({
            keystone,
            listName: 'Test',
            items: items.map((item, i) => ({ id: item.id, data: { name: `update-${i}` } })),
            schemaName,
          });

          const allItems = await getItems({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            schemaName,
          });

          expect(allItems).toEqual([
            { name: 'update-0', age: 30 },
            { name: 'update-1', age: 40 },
          ]);
        })
      );
    });
    describe('delete', () => {
      test(
        'Should delete single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const { createTests } = await createItems({
            keystone,
            listName: 'Test',
            items: testData,
            schemaName,
          });

          // Delete a single item
          await deleteItem({
            keystone,
            listName: 'Test',
            returnFields: 'name age',
            itemId: createTests[0].id,
            schemaName,
          });

          // Retrieve items
          const allItems = await getItems({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            schemaName,
          });

          expect(allItems).toEqual([{ name: 'test2', age: 40 }]);
        })
      );
      test(
        'Should delete multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const { createTests } = await createItems({
            keystone,
            listName: 'Test',
            items: testData,
            schemaName,
          });

          // Delete multiple items
          await deleteItems({
            keystone,
            listName: 'Test',
            returnFields: 'name age',
            items: createTests.map(item => item.id),
            schemaName,
          });

          // Get all the items back from db
          const allItems = await getItems({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            schemaName,
          });

          expect(allItems).toEqual([]);
        })
      );
    });
    describe('getItems', () => {
      test(
        'Should get all items when no where caluse',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await createItems({
            keystone,
            listName: 'Test',
            items: testData,
            schemaName,
          });

          const allItems = await getItems({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            schemaName,
          });

          expect(allItems).toEqual(testData.map(x => x.data));
        })
      );
      test(
        'Should get specific items with where clause',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await createItems({
            keystone,
            listName: 'Test',
            items: testData,
            schemaName,
          });

          const allItems = await getItems({
            keystone,
            listName: 'Test',
            schemaName,
            returnFields: 'name',
            where: { name: 'test' },
          });

          expect(allItems).toEqual([{ name: 'test' }]);
        })
      );
    });
  })
);
