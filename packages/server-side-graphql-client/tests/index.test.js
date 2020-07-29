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
} = require('../index');

const testData = [{ data: { name: 'test', age: 30 } }, { data: { name: 'test2', age: 40 } }];
const schemaName = 'testing';

const seedDb = ({ keystone }) =>
  createItems({
    keystone,
    listKey: 'Test',
    items: testData,
    context: keystone.createContext({ schemaName }),
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
        'createItem: Should create and get single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const item = await createItem({
            keystone,
            listKey: 'Test',
            item: testData[0].data,
            context: keystone.createContext({ schemaName }),
          });
          expect(typeof item.id).toBe('string');

          // Get single item from db
          const singleItem = await getItem({
            keystone,
            listKey: 'Test',
            returnFields: 'name, age',
            itemId: item.id,
            context: keystone.createContext({ schemaName }),
          });

          expect(singleItem).toEqual(testData[0].data);
        })
      );
      test(
        'createItems: Should create and get multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await createItems({
            keystone,
            listKey: 'Test',
            items: testData,
            context: keystone.createContext({ schemaName }),
          });
          // Get all the items back from db
          const allItems = await getItems({
            keystone,
            listKey: 'Test',
            returnFields: 'name, age',
            context: keystone.createContext({ schemaName }),
          });

          expect(allItems).toEqual(testData.map(x => x.data));
        })
      );
    });
    describe('udpate', () => {
      test(
        'updateItem: Should update single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const seedItems = await seedDb({ keystone });
          // Update a single item
          const item = await updateItem({
            keystone,
            listKey: 'Test',
            item: { id: seedItems[0].id, data: { name: 'updateTest' } },
            returnFields: 'name, age',
            context: keystone.createContext({ schemaName }),
          });
          expect(item).toEqual({ name: 'updateTest', age: 30 });
        })
      );

      test(
        'updateItems: Should update multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const seedItems = await seedDb({ keystone });
          // Update multiple items
          const items = await updateItems({
            keystone,
            listKey: 'Test',
            items: seedItems.map((item, i) => ({ id: item.id, data: { name: `update-${i}` } })),
            returnFields: 'name, age',
            context: keystone.createContext({ schemaName }),
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
        'deleteItem: Should delete single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const items = await seedDb({ keystone });
          // Delete a single item
          await deleteItem({
            keystone,
            listKey: 'Test',
            returnFields: 'name age',
            itemId: items[0].id,
            context: keystone.createContext({ schemaName }),
          });

          // Retrieve items
          const allItems = await getItems({
            keystone,
            listKey: 'Test',
            returnFields: 'name, age',
            context: keystone.createContext({ schemaName }),
          });

          expect(allItems).toEqual([{ name: 'test2', age: 40 }]);
        })
      );
      test(
        'deleteItems: Should delete multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const items = await seedDb({ keystone });
          // Delete multiple items
          const deletedItems = await deleteItems({
            keystone,
            listKey: 'Test',
            returnFields: 'name age',
            items: items.map(item => item.id),
            context: keystone.createContext({ schemaName }),
          });

          expect(deletedItems).toEqual(testData.map(d => d.data));

          // Get all the items back from db
          const allItems = await getItems({
            keystone,
            listKey: 'Test',
            returnFields: 'name, age',
            context: keystone.createContext({ schemaName }),
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
            listKey: 'Test',
            returnFields: 'name, age',
            context: keystone.createContext({ schemaName }),
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
            listKey: 'Test',
            returnFields: 'name',
            where: { name: 'test' },
            context: keystone.createContext({ schemaName }),
          });

          expect(allItems).toEqual([{ name: 'test' }]);
        })
      );
    });
  })
);
