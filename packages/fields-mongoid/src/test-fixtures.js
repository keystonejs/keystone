import { createItem, getItem, getItems, updateItem } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';

import { MongoId } from './index';

export const name = 'MongoId';
export { MongoId as type };
export const exampleValue = '123456781234567812345678';
export const exampleValue2 = '123456781234567812345679';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    name: { type: Text },
    oldId: { type: MongoId },
  };
};

export const initItems = () => {
  return [
    { name: 'a', oldId: '123456781234567812345678' },
    { name: 'b', oldId: '123456781234567812345687' },
    { name: 'c', oldId: '6162636465666768696a6b6c' },
    { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
    { name: 'e', oldId: null },
    { name: 'f' },
  ];
};
export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name oldId',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );
  test(
    `Filter: oldId`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId: '123456781234567812345678' }, [
        { oldId: '123456781234567812345678', name: 'a' },
      ])
    )
  );

  test(
    `Filter: oldId_not`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_not: '123456781234567812345678' }, [
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );

  test(
    `Filter: oldId_in (empty list)`,
    withKeystone(({ keystone }) => match(keystone, { oldId_in: [] }, []))
  );

  test(
    `Filter: oldId_in`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_in: ['123456781234567812345687', '123456781234567812345678'] }, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
      ])
    )
  );

  test(
    `Filter: oldId_in null`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_in: [null] }, [
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );

  test(
    `Filter: oldId_not_in null`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_not_in: [null] }, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
      ])
    )
  );

  test(
    `Filter: oldId_not_in`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_not_in: ['123456781234567812345687', '123456781234567812345678'] }, [
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );
};

export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey, adapterName }) => {
      const items = await getItems({
        keystone,
        listKey,
        returnFields: 'id oldId',
      });
      return wrappedFn({ keystone, listKey, items, adapterName });
    };
  };

  describe('Create', () => {
    test(
      'Creating the value',
      withKeystone(
        withHelpers(async ({ keystone, listKey }) => {
          const data = await createItem({
            keystone,
            listKey,
            item: { name: 'test entry', oldId: '313233343536373839617364' },
            returnFields: 'oldId',
          });
          expect(data).not.toBe(null);
          expect(data.oldId).toBe('313233343536373839617364');
        })
      )
    );
    test(
      'Throw error when "id" is invalid',
      withKeystone(
        withHelpers(async ({ keystone, listKey, adapterName }) => {
          try {
            await createItem({
              keystone,
              listKey,
              item: { name: 'test entry', oldId: '123' },
              returnFields: 'oldId',
            });
            expect(true).toEqual(false);
          } catch (error) {
            expect(error).not.toBe(undefined);
            if (adapterName === 'knex') {
              expect(error.message).toMatch(/Invalid MongoID value given for 'oldId'/);
            } else if (adapterName === 'mongoose') {
              expect(error.message).toMatch(
                /Cast to ObjectId failed for value \"123\" at path "oldId"/
              );
            }
          }
        })
      )
    );
  });
  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, listKey, items }) => {
        const data = await getItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'oldId',
        });
        expect(data).not.toBe(null);
        expect(data.oldId).toBe(items[0].oldId);
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
              data: { oldId: '313233343536617771646672' },
            },
            returnFields: 'oldId',
          });
          expect(data).not.toBe(null);
          expect(data.oldId).toBe('313233343536617771646672');
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
              data: { oldId: null },
            },
            returnFields: 'oldId',
          });
          expect(data).not.toBe(null);
          expect(data.oldId).toBe(null);
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
            returnFields: 'name oldId',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('foobarbaz');
          expect(data.oldId).toBe(items[0].oldId);
        })
      )
    );
  });
};
