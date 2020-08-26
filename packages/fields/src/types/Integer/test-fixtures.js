import {
  createItem,
  deleteItem,
  getItems,
  getItem,
  updateItem,
} from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import Integer from './';

export const name = 'Integer';
export { Integer as type };
export const exampleValue = 37;
export const exampleValue2 = 38;
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    name: { type: Text },
    count: { type: Integer },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', count: 0 },
    { name: 'person2', count: 1 },
    { name: 'person3', count: 2 },
    { name: 'person4', count: 3 },
    { name: 'person5', count: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name count',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count',
    withKeystone(({ keystone }) => match(keystone, { count: 1 }, [{ name: 'person2', count: 1 }]))
  );

  test(
    'Filter: count_not',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not: 1 }, [
        { name: 'person1', count: 0 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not: null }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );

  test(
    'Filter: count_lt',
    withKeystone(({ keystone }) =>
      match(keystone, { count_lt: 2 }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
      ])
    )
  );

  test(
    'Filter: count_lte',
    withKeystone(({ keystone }) =>
      match(keystone, { count_lte: 2 }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ])
    )
  );

  test(
    'Filter: count_gt',
    withKeystone(({ keystone }) =>
      match(keystone, { count_gt: 2 }, [{ name: 'person4', count: 3 }])
    )
  );

  test(
    'Filter: count_gte',
    withKeystone(({ keystone }) =>
      match(keystone, { count_gte: 2 }, [
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );

  test(
    'Filter: count_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { count_in: [] }, []))
  );

  test(
    'Filter: count_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not_in: [] }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_in',
    withKeystone(({ keystone }) =>
      match(keystone, { count_in: [0, 1, 2] }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ])
    )
  );

  test(
    'Filter: count_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not_in: [0, 1, 2] }, [
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { count_in: [null] }, [{ name: 'person5', count: null }])
    )
  );

  test(
    'Filter: count_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not_in: [null] }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );
};

export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey }) => {
      const items = await getItems({
        keystone,
        listKey,
        returnFields: 'id name count',
      });
      return wrappedFn({ keystone, listKey, items });
    };
  };

  test(
    'Create',
    withKeystone(
      withHelpers(async ({ keystone, listKey }) => {
        const data = await createItem({
          keystone,
          listKey,
          item: { name: 'Keystone', count: 4 },
          returnFields: 'count',
        });
        expect(data).not.toBe(null);
        expect(data.count).toBe(4);
      })
    )
  );

  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, listKey, items }) => {
        const data = await getItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'count',
        });
        expect(data).not.toBe(null);
        expect(data.count).toBe(items[0].count);
      })
    )
  );

  describe('Update', () => {
    test(
      'Updating the value',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { count: 6 },
            },
            returnFields: 'count',
          });
          expect(data).not.toBe(null);
          expect(data.count).toBe(6);
        })
      )
    );

    test(
      'Updating the value to null',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { count: null },
            },
            returnFields: 'count',
          });
          expect(data).not.toBe(null);
          expect(data.count).toBe(null);
        })
      )
    );

    test(
      'Updating without this field',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { name: 'foobarbaz' },
            },
            returnFields: 'name count',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('foobarbaz');
          expect(data.count).toBe(items[0].count);
        })
      )
    );
  });
  test(
    'Delete',
    withKeystone(
      withHelpers(async ({ keystone, items, listKey }) => {
        const data = await deleteItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'name count',
        });
        expect(data).not.toBe(null);
        expect(data.name).toBe(items[0].name);
        expect(data.count).toBe(items[0].count);

        const allItems = await getItems({
          keystone,
          listKey,
          returnFields: 'name count',
        });
        expect(allItems).toEqual(expect.not.arrayContaining([data]));
      })
    )
  );
};
