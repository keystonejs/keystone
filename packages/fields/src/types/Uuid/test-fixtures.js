import {
  createItem,
  deleteItem,
  getItems,
  getItem,
  updateItem,
} from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import Uuid from './';

const fieldType = 'Uuid';
export { fieldType as name };

export { Uuid as type };
export const exampleValue = '7b36c9fe-274d-45f1-9f5d-8d4595959734';
export const exampleValue2 = 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    order: { type: Text },
    otherId: { type: Uuid },
  };
};

export const initItems = () => {
  return [
    { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
    { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
    { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
    { order: 'd', otherId: null },
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone/issues/391

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'order otherId',
        sortBy: 'order_ASC',
      })
    ).toEqual(expected);

  test(
    `No argument`,
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { order: 'd', otherId: null },
      ])
    )
  );
  test(
    `Empty argument`,
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { order: 'd', otherId: null },
      ])
    )
  );

  test(
    `Filter: {key}`,
    withKeystone(({ keystone }) =>
      match(keystone, { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' }, [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
      ])
    )
  );
  test(
    `Filter: {key} (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, { otherId: 'C0D37CBC-2F01-432C-89E0-405D54FD4CDC' }, [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
      ])
    )
  );

  test(
    `Filter: {key}_not`,
    withKeystone(({ keystone }) =>
      match(keystone, { otherId_not: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' }, [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'd', otherId: null },
      ])
    )
  );
  test(
    `Filter: {key}_not (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, { otherId_not: '8452DE22-4DFD-4E2A-A6AC-C20CEEF0ADE4' }, [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'd', otherId: null },
      ])
    )
  );

  test(
    `Filter: {key}_in (empty list)`,
    withKeystone(({ keystone }) => match(keystone, { otherId_in: [] }, []))
  );
  test(
    `Filter: {key}_in`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          otherId_in: [
            '01d20b3c-c0fe-4198-beb6-1a013c041805',
            'c0d37cbc-2f01-432c-89e0-405d54fd4cdc',
          ],
        },
        [
          { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
          { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        ]
      )
    )
  );
  test(
    `Filter: {key}_in (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          otherId_in: [
            '01D20B3C-C0FE-4198-BEB6-1A013C041805',
            'C0D37CBC-2F01-432C-89E0-405D54FD4CDC',
          ],
        },
        [
          { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
          { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        ]
      )
    )
  );

  test(
    `Filter: {key}_not_in (empty list)`,
    withKeystone(({ keystone }) =>
      match(keystone, { otherId_not_in: [] }, [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { order: 'd', otherId: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_in`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          otherId_not_in: [
            '01d20b3c-c0fe-4198-beb6-1a013c041805',
            'c0d37cbc-2f01-432c-89e0-405d54fd4cdc',
          ],
        },
        [
          { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
          { order: 'd', otherId: null },
        ]
      )
    )
  );
  test(
    `Filter: {key}_not_in (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          otherId_not_in: [
            '01D20B3C-C0FE-4198-BEB6-1A013C041805',
            'C0D37CBC-2F01-432C-89E0-405D54FD4CDC',
          ],
        },
        [
          { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
          { order: 'd', otherId: null },
        ]
      )
    )
  );
};

export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey }) => {
      const items = await getItems({
        keystone,
        listKey,
        returnFields: 'id otherId ',
        sortBy: 'order_ASC',
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
          item: { otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade5', order: 'h' },
          returnFields: 'otherId',
        });
        expect(data).not.toBe(null);
        expect(data.otherId).toBe('8452de22-4dfd-4e2a-a6ac-c20ceef0ade5');
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
          returnFields: 'otherId',
        });
        expect(data).not.toBe(null);
        expect(data.otherId).toBe(items[0].otherId);
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
              data: { otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0adf5' },
            },
            returnFields: 'otherId',
          });
          expect(data).not.toBe(null);
          expect(data.otherId).toBe('8452de22-4dfd-4e2a-a6ac-c20ceef0adf5');
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
              data: { otherId: null },
            },
            returnFields: 'otherId',
          });
          expect(data).not.toBe(null);
          expect(data.otherId).toBe(null);
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
              data: { order: 'i' },
            },
            returnFields: 'otherId order',
          });
          expect(data).not.toBe(null);
          expect(data.order).toBe('i');
          expect(data.otherId).toBe(items[0].otherId);
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
          returnFields: 'otherId',
        });
        expect(data).not.toBe(null);
        expect(data.otherId).toBe(items[0].otherId);

        const allItems = await getItems({
          keystone,
          listKey,
          returnFields: 'otherId',
        });
        expect(allItems).toEqual(expect.not.arrayContaining([data]));
      })
    )
  );
};
