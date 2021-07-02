import { text, integer } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { KeystoneContext } from '@keystone-next/types';
import {
  createItems,
  createItem,
  deleteItem,
  deleteItems,
  getItem,
  getItems,
  updateItem,
  updateItems,
} from '@keystone-next/keystone/src/lib/context/server-side-graphql-client';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig } from './utils';

const testData = Array(50)
  .fill(0)
  .map((_, i) => ({ data: { name: `test${String(i).padStart(2, '0')}`, age: 10 * i } }));

const listKey = 'Test';
const returnFields = 'name age';

type IdType = any;

const seedDb = ({ context }: { context: KeystoneContext }): Promise<{ id: IdType }[]> =>
  createItems({ context, listKey, items: testData }) as Promise<{ id: IdType }[]>;

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({ Test: list({ fields: { name: text(), age: integer() } }) }),
  }),
});

describe('create', () => {
  test(
    'createItem: Should create and get single item',
    runner(async ({ context }) => {
      // Seed the db
      const item = await createItem({ context, listKey, item: testData[0].data });
      expect(typeof item.id).toBe('string');

      // Get single item from db
      const singleItem = await getItem({
        context,
        listKey,
        returnFields,
        where: { id: item.id },
      });

      expect(singleItem).toEqual(testData[0].data);
    })
  );
  test(
    'createItems: Should create and get multiple items',
    runner(async ({ context }) => {
      // Seed the db
      await createItems({ context, listKey, items: testData });
      // Get all the items back from db
      const allItems = (await getItems({ context, listKey, returnFields })) as {
        age: number;
      }[];

      expect(allItems.sort((x, y) => (x.age > y.age ? 1 : -1))).toEqual(testData.map(x => x.data));
    })
  );
});
describe('udpate', () => {
  test(
    'updateItem: Should update single item',
    runner(async ({ context }) => {
      // Seed the db
      const seedItems = await seedDb({ context });
      // Update a single item
      const item = await updateItem({
        context,
        listKey,
        item: { id: seedItems[0].id, data: { name: 'updateTest' } },
        returnFields,
      });
      expect(item).toEqual({ name: 'updateTest', age: 0 });
    })
  );

  test(
    'updateItems: Should update multiple items',
    runner(async ({ context }) => {
      // Seed the db
      const seedItems = await seedDb({ context });
      // Update multiple items
      const items = (await updateItems({
        context,
        listKey,
        items: seedItems.map((item, i) => ({ id: item.id, data: { name: `update-${i}` } })),
        returnFields,
      })) as { name: string; age: number }[];
      expect(items.sort((a, b) => (a.age > b.age ? 1 : -1))).toEqual(
        seedItems.map((item, i) => ({ name: `update-${i}`, age: 10 * i }))
      );
    })
  );
});
describe('delete', () => {
  test(
    'deleteItem: Should delete single item',
    runner(async ({ context }) => {
      // Seed the db
      const items = await seedDb({ context });
      // Delete a single item
      await deleteItem({ context, listKey, returnFields, itemId: items[0].id });

      // Retrieve items
      const allItems = (await getItems({ context, listKey, returnFields })) as {
        age: number;
      }[];

      expect(allItems.sort((x, y) => (x.age > y.age ? 1 : -1))).toEqual(
        testData.map(d => d.data).filter(x => x.name !== 'test00')
      );
    })
  );
  test(
    'deleteItems: Should delete multiple items',
    runner(async ({ context }) => {
      // Seed the db
      const items = await seedDb({ context });
      // Delete multiple items
      const deletedItems = (await deleteItems({
        context,
        listKey,
        returnFields,
        items: items.map(item => item.id),
      })) as { age: number }[];

      expect(deletedItems.sort((x, y) => (x.age > y.age ? 1 : -1))).toEqual(
        testData.map(d => d.data)
      );

      // Get all the items back from db
      const allItems = await getItems({ context, listKey, returnFields });

      expect(allItems).toEqual([]);
    })
  );
});
describe('getItems', () => {
  test(
    'Should get all items when no where clause',
    runner(async ({ context }) => {
      // Seed the db
      await seedDb({ context });
      const allItems = (await getItems({ context, listKey, returnFields })) as {
        age: number;
      }[];

      expect(allItems.sort((x, y) => (x.age > y.age ? 1 : -1))).toEqual(testData.map(x => x.data));
    })
  );
  test(
    'Should get specific items with where clause',
    runner(async ({ context }) => {
      // Seed the db
      await seedDb({ context });
      const allItems = await getItems({
        context,
        listKey,
        returnFields,
        where: { name: 'test15' },
      });

      expect(allItems).toEqual([{ name: 'test15', age: 150 }]);
    })
  );
  test(
    'orderBy: Should get all ordered items',
    runner(async ({ context }) => {
      // Seed the db
      await seedDb({ context });

      const getItemsBySortOrder = (orderBy: Record<string, 'asc' | 'desc'>) =>
        getItems({ context, listKey, returnFields, orderBy: [orderBy] });

      const allItemsAscAge = await getItemsBySortOrder({ age: 'asc' });
      const allItemsDescAge = await getItemsBySortOrder({ age: 'desc' });
      expect(allItemsAscAge[0]).toEqual(testData.map(x => x.data)[0]);
      expect(allItemsDescAge[0]).toEqual(testData.map(x => x.data).slice(-1)[0]);
    })
  );
  test(
    'first: Should get first specfied number of items',
    runner(async ({ context }) => {
      await seedDb({ context });

      const getFirstItems = (first?: number, pageSize?: number) =>
        getItems({
          context,
          listKey,
          returnFields,
          pageSize,
          first,
          orderBy: [{ age: 'asc' }],
        });
      expect(await getFirstItems(9, 5)).toEqual(testData.slice(0, 9).map(d => d.data));
      expect(await getFirstItems(5, 9)).toEqual(testData.slice(0, 5).map(d => d.data));
      expect(await getFirstItems(5, 5)).toEqual(testData.slice(0, 5).map(d => d.data));
      expect(await getFirstItems()).toEqual(testData.map(d => d.data));
      expect(await getFirstItems(undefined, 5)).toEqual(testData.map(d => d.data));

      const firstTwoItems = await getFirstItems(2);
      expect(firstTwoItems).toEqual([
        { name: 'test00', age: 0 },
        { name: 'test01', age: 10 },
      ]);
    })
  );
  test(
    'skip: Should skip the specfied number of items, and return the rest',
    runner(async ({ context }) => {
      await seedDb({ context });
      const skip = 3;
      const restItems = await getItems({ context, listKey, returnFields, skip });
      expect(restItems.length).toEqual(testData.length - skip);
    })
  );
  test(
    'combination of sort and pagination',
    runner(async ({ context }) => {
      await seedDb({ context });
      const first = 4;
      const getOrderItems = (orderBy: Record<string, 'asc' | 'desc'>) =>
        getItems({ context, listKey, returnFields, skip: 3, first, orderBy: [orderBy] });
      const itemsDESC = await getOrderItems({ age: 'desc' });
      expect(itemsDESC.length).toEqual(first);
      expect(itemsDESC[0]).toEqual({ name: 'test46', age: 460 });

      const itemsASC = await getOrderItems({ age: 'asc' });
      expect(itemsASC.length).toEqual(4);
      expect(itemsASC[0]).toEqual({ name: 'test03', age: 30 });
    })
  );
});
describe('context', () => {
  test(
    'Should make keystone optional when context is present',
    runner(async ({ context }) => {
      // Seed the db
      const item = await createItem({ context, listKey: 'Test', item: testData[0].data });
      expect(typeof item.id).toBe('string');

      // Get single item from db
      const singleItem = await getItem({
        context,
        listKey,
        returnFields,
        where: { id: item.id },
      });

      expect(singleItem).toEqual(testData[0].data);
    })
  );
});
