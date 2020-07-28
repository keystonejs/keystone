const { Text, Integer } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

const {
  createItems,
  createItem,
  deleteItem,
  deleteItems,
  getItem,
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
const schemaName = 'testing';

const seedDb = ({ keystone }) =>
  createItems({
    keystone,
    listName: 'Test',
    items: testData,
    schemaName,
  });

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

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('create', () => {
      test(
        'Should create and get single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const item = await createItem({
            keystone,
            listName: 'Test',
            item: testData[0].data,
            schemaName,
          });
          expect(typeof item.id).toBe('string');

          // Get single item from db
          const singleItem = await getItem({
            keystone,
            listName: 'Test',
            returnFields: 'name, age',
            itemId: item.id,
            schemaName,
          });

          expect(singleItem).toEqual(testData[0].data);
        })
      );
      test(
        'Should create and get multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await seedDb({ keystone });

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
          // Seed the db
          const seedItems = await seedDb({ keystone });
          // Update a single item
          const item = await updateItem({
            keystone,
            listName: 'Test',
            item: { id: seedItems[0].id, data: { name: 'updateTest' } },
            returnFields: 'name, age',
            schemaName,
          });
          expect(item).toEqual({ name: 'updateTest', age: 30 });
        })
      );

      test(
        'Should update multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const seedItems = await seedDb({ keystone });

          // Update multiple items
          const items = await updateItems({
            keystone,
            listName: 'Test',
            items: seedItems.map((item, i) => ({ id: item.id, data: { name: `update-${i}` } })),
            returnFields: 'name, age',
            schemaName,
          });

          expect(items).toEqual([
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
          const items = await seedDb({ keystone });

          // Delete a single item
          await deleteItem({
            keystone,
            listName: 'Test',
            returnFields: 'name age',
            itemId: items[0].id,
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
          const items = await seedDb({ keystone });
          // Delete multiple items
          const deletedItems = await deleteItems({
            keystone,
            listName: 'Test',
            returnFields: 'name age',
            items: items.map(item => item.id),
            schemaName,
          });

          expect(deletedItems).toEqual(testData.map(d => d.data));

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
        'Should get all items when no where clause',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await seedDb({ keystone });

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
          await seedDb({ keystone });

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
