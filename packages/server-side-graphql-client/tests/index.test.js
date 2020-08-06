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

const seedDb = ({ keystone, items = testData }) =>
  createItems({ keystone, listKey: 'Test', items });

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
          const item = await createItem({ keystone, listKey: 'Test', item: testData[0].data });
          expect(typeof item.id).toBe('string');

          // Get single item from db
          const singleItem = await getItem({
            keystone,
            listKey: 'Test',
            returnFields: 'name, age',
            itemId: item.id,
          });

          expect(singleItem).toEqual(testData[0].data);
        })
      );
      test(
        'createItems: Should create and get multiple items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await createItems({ keystone, listKey: 'Test', items: testData });
          // Get all the items back from db
          const allItems = await getItems({ keystone, listKey: 'Test', returnFields: 'name, age' });

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
          });

          // Retrieve items
          const allItems = await getItems({ keystone, listKey: 'Test', returnFields: 'name, age' });

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
          });

          expect(deletedItems).toEqual(testData.map(d => d.data));

          // Get all the items back from db
          const allItems = await getItems({ keystone, listKey: 'Test', returnFields: 'name, age' });

          expect(allItems).toEqual([]);
        })
      );
    });
    describe('getItems', () => {
      const userItems = Array.from({ length: 10 }, (_, i) => ({
        data: {
          name: `User-${i + 1}`,
          age: i + 1,
        },
      }));
      test(
        'Should get all items when no where clause',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await seedDb({ keystone });
          const allItems = await getItems({ keystone, listKey: 'Test', returnFields: 'name, age' });

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
          });

          expect(allItems).toEqual([{ name: 'test' }]);
        })
      );
      test(
        'sortBy: Should get all sorted items',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          await seedDb({ keystone });

          const getItemsBySortOrder = sortBy =>
            getItems({
              keystone,
              listKey: 'Test',
              returnFields: 'name, age',
              sortBy,
            });

          const allItemsAscAge = await getItemsBySortOrder('age_ASC');
          const allItemsDescAge = await getItemsBySortOrder('age_DESC');
          expect(allItemsAscAge[0]).toEqual(testData.map(x => x.data)[0]);
          expect(allItemsDescAge[0]).toEqual(testData.map(x => x.data)[1]);
        })
      );
      test(
        'first: Should get first specfied number of items',
        runner(setupKeystone, async ({ keystone }) => {
          await seedDb({ keystone, items: userItems });

          const getFirstItems = (first, pageSize) =>
            getItems({
              keystone,
              listKey: 'Test',
              returnFields: 'name, age',
              pageSize,
              first,
            });
          expect((await getFirstItems(9, 5)).length).toEqual(9);
          expect((await getFirstItems(5, 9)).length).toEqual(5);
          expect((await getFirstItems(5, 5)).length).toEqual(5);
          expect((await getFirstItems()).length).toEqual(10);

          const firstTwoItems = await getFirstItems(2);
          expect(firstTwoItems).toEqual([
            { name: 'User-1', age: 1 },
            { name: 'User-2', age: 2 },
          ]);
        })
      );
      test(
        'skip: Should skip the specfied number of items, and return the rest',
        runner(setupKeystone, async ({ keystone }) => {
          await seedDb({ keystone, items: userItems });
          const skip = 3;
          const restItems = await getItems({
            keystone,
            listKey: 'Test',
            returnFields: 'name, age',
            skip,
          });
          expect(restItems.length).toEqual(userItems.length - skip);
        })
      );
      test(
        'combination of sort and pagination',
        runner(setupKeystone, async ({ keystone }) => {
          await seedDb({ keystone, items: userItems });
          const first = 4;
          const getSortItems = sortBy =>
            getItems({
              keystone,
              listKey: 'Test',
              returnFields: 'name, age',
              skip: 3,
              first,
              sortBy,
            });
          const itemsDESC = await getSortItems('age_DESC');
          expect(itemsDESC.length).toEqual(first);
          expect(itemsDESC[0]).toEqual({ name: 'User-7', age: 7 });

          const itemsASC = await getSortItems('age_ASC');
          expect(itemsASC.length).toEqual(4);
          expect(itemsASC[0]).toEqual({ name: 'User-4', age: 4 });
        })
      );
    });
  })
);
