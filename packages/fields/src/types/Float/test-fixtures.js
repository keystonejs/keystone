import {
  createItem,
  deleteItem,
  getItems,
  getItem,
  updateItem,
} from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import Float from '.';

export const name = 'Float';
export { Float as type };
export const exampleValue = 6.28;
export const exampleValue2 = 6.283;
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    name: {
      type: Text,
    },
    stars: {
      type: Float,
    },
  };
};

export const initItems = () => {
  return [
    { name: 'post1', stars: 0 },
    { name: 'post2', stars: 1.2 },
    { name: 'post3', stars: 2.3 },
    { name: 'post4', stars: 3 },
    { name: 'post5', stars: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name stars',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
        { name: 'post5', stars: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
        { name: 'post5', stars: null },
      ])
    )
  );

  test(
    'Filter: stars',
    withKeystone(({ keystone }) => match(keystone, { stars: 1.2 }, [{ name: 'post2', stars: 1.2 }]))
  );

  test(
    'Filter: stars_not',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_not: 1.2 }, [
        { name: 'post1', stars: 0 },
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
        { name: 'post5', stars: null },
      ])
    )
  );

  test(
    'Filter: stars_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_not: null }, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
      ])
    )
  );

  test(
    'Filter: stars_lt',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_lt: 2.3 }, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
      ])
    )
  );

  test(
    'Filter: stars_lte',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_lte: 2.3 }, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
      ])
    )
  );

  test(
    'Filter: stars_gt',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_gt: 2.3 }, [{ name: 'post4', stars: 3 }])
    )
  );

  test(
    'Filter: stars_gte',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_gte: 2.3 }, [
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
      ])
    )
  );

  test(
    'Filter: stars_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { stars_in: [] }, []))
  );

  test(
    'Filter: stars_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_not_in: [] }, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
        { name: 'post5', stars: null },
      ])
    )
  );

  test(
    'Filter: stars_in',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_in: [0, 1.2, 2.3] }, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
      ])
    )
  );

  test(
    'Filter: stars_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_not_in: [0, 1.2, 2.3] }, [
        { name: 'post4', stars: 3 },
        { name: 'post5', stars: null },
      ])
    )
  );

  test(
    'Filter: stars_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_in: [null] }, [{ name: 'post5', stars: null }])
    )
  );

  test(
    'Filter: stars_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { stars_not_in: [null] }, [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
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
        returnFields: 'id name stars',
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
          item: { name: 'Keysontejs loves GraphQL', stars: 4.5 },
          returnFields: 'stars',
        });
        expect(data).not.toBe(null);
        expect(data.stars).toBe(4.5);
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
          returnFields: 'stars',
        });
        expect(data).not.toBe(null);
        expect(data.stars).toBe(items[0].stars);
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
              data: { stars: 3.5 },
            },
            returnFields: 'stars',
          });
          expect(data).not.toBe(null);
          expect(data.stars).toBe(3.5);
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
              data: { stars: null },
            },
            returnFields: 'stars',
          });
          expect(data).not.toBe(null);
          expect(data.stars).toBe(null);
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
            returnFields: 'name stars',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('foobarbaz');
          expect(data.stars).toBe(items[0].stars);
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
          returnFields: 'name stars',
        });
        expect(data).not.toBe(null);
        expect(data.name).toBe(items[0].name);
        expect(data.stars).toBe(items[0].stars);

        const allItems = await getItems({
          keystone,
          listKey,
          returnFields: 'name stars',
        });
        expect(allItems).toEqual(expect.not.arrayContaining([data]));
      })
    )
  );
};
