import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import Checkbox from './';

export const name = 'Checkbox';
export { Checkbox as type };
export const exampleValue = true;
export const supportsUnique = false;

export const getTestFields = () => {
  return {
    name: { type: Text },
    enabled: { type: Checkbox },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', enabled: true },
    { name: 'person2', enabled: false },
    { name: 'person3', enabled: null },
    { name: 'person4', enabled: true },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name enabled',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Filter: enabled true',
    withKeystone(({ keystone }) =>
      match(keystone, { enabled: true }, [
        { name: 'person1', enabled: true },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Filter: enabled false',
    withKeystone(({ keystone }) =>
      match(keystone, { enabled: false }, [{ name: 'person2', enabled: false }])
    )
  );

  test(
    'Filter: enabled_not true',
    withKeystone(({ keystone }) =>
      match(keystone, { enabled_not: true }, [
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
      ])
    )
  );

  test(
    'Filter: enabled_not false',
    withKeystone(({ keystone }) =>
      match(keystone, { enabled_not: false }, [
        { name: 'person1', enabled: true },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
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
        returnFields: 'id name enabled',
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
          item: { name: 'person5', enabled: false },
          returnFields: 'enabled',
        });
        expect(data).not.toBe(null);
        expect(data.enabled).toBe(false);
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
          returnFields: 'enabled',
        });
        expect(data).not.toBe(null);
        expect(data.enabled).toBe(items[0].enabled);
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
              data: { enabled: true },
            },
            returnFields: 'enabled',
          });
          expect(data).not.toBe(null);
          expect(data.enabled).toBe(true);
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
              data: { enabled: null },
            },
            returnFields: 'enabled',
          });
          expect(data).not.toBe(null);
          expect(data.enabled).toBe(null);
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
              data: { name: 'Plum' },
            },
            returnFields: 'name enabled',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('Plum');
          expect(data.enabled).toBe(items[0].enabled);
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
          returnFields: 'name enabled',
        });
        expect(data).not.toBe(null);
        expect(data.name).toBe(items[0].name);
        expect(data.enabled).toBe(items[0].enabled);

        const allItems = await getItems({
          keystone,
          listKey,
          returnFields: 'name enabled',
        });
        expect(allItems).toEqual(expect.not.arrayContaining([data]));
      })
    )
  );
};
