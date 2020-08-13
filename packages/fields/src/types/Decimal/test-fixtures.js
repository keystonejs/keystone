import { createItem, getItems, getItem, updateItem } from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import Decimal from './';

export const name = 'Decimal';
export { Decimal as type };
export const exampleValue = '"6.28"';
export const exampleValue2 = '"6.283"';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    name: { type: Text },
    price: { type: Decimal, knexOptions: { scale: 2 } },
  };
};

export const initItems = () => {
  return [
    { name: 'price1', price: '50.00' },
    { name: 'price2', price: '0.01' },
    { name: 'price3', price: '2000.00' },
    { name: 'price4', price: '40000.00' },
    { name: 'price5', price: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name price',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price',
    withKeystone(({ keystone }) =>
      match(keystone, { price: '50.00' }, [{ name: 'price1', price: '50.00' }])
    )
  );

  test(
    'Filter: price_not',
    withKeystone(({ keystone }) =>
      match(keystone, { price_not: '50.00' }, [
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_lt',
    withKeystone(({ keystone }) =>
      match(keystone, { price_lt: '50.00' }, [{ name: 'price2', price: '0.01' }])
    )
  );

  test(
    'Filter: price_lte',
    withKeystone(({ keystone }) =>
      match(keystone, { price_lte: '2000.00' }, [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
      ])
    )
  );

  test(
    'Filter: price_gt',
    withKeystone(({ keystone }) =>
      match(keystone, { price_gt: '2000.00' }, [{ name: 'price4', price: '40000.00' }])
    )
  );

  test(
    'Filter: price_gte',
    withKeystone(({ keystone }) =>
      match(keystone, { price_gte: '2000.00' }, [
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
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
        returnFields: 'id price',
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
          item: { name: 'test entry', price: '17.56' },
          returnFields: 'price',
        });
        expect(data).not.toBe(null);
        expect(data.price).toBe('17.56');
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
          returnFields: 'price',
        });
        expect(data).not.toBe(null);
        expect(data.price).toBe(items[0].price);
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
              data: { price: '879.46' },
            },
            returnFields: 'price',
          });
          expect(data).not.toBe(null);
          expect(data.price).toBe('879.46');
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
              data: { price: null },
            },
            returnFields: 'price',
          });
          expect(data).not.toBe(null);
          expect(data.price).toBe(null);
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
            returnFields: 'name price',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('foobarbaz');
          expect(data.price).toBe(items[0].price);
        })
      )
    );
  });
};
