import { matchFilter, graphqlRequest } from '@keystonejs/test-utils';
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
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'name price',
      expected,
      sortKey: 'name',
    });

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
      match(keystone, 'where: { }', [
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
      match(keystone, 'where: { price: "50.00" }', [{ name: 'price1', price: '50.00' }])
    )
  );

  test(
    'Filter: price_not',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { price_not: "50.00" }', [
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
      match(keystone, 'where: { price_lt: "50.00" }', [{ name: 'price2', price: '0.01' }])
    )
  );

  test(
    'Filter: price_lte',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { price_lte: "2000.00" }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
      ])
    )
  );

  test(
    'Filter: price_gt',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { price_gt: "2000.00" }', [{ name: 'price4', price: '40000.00' }])
    )
  );

  test(
    'Filter: price_gte',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { price_gte: "2000.00" }', [
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
      ])
    )
  );
};

export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey, ...rest }) => {
      const list = keystone.getListByKey(listKey);
      const { listQueryName } = list.gqlNames;
      const {
        data: { [listQueryName]: items },
        errors,
      } = await graphqlRequest({
        keystone,
        query: `query {
          ${listQueryName} {
            id
            price
          }
        }`,
      });
      expect(errors).toBe(undefined);
      return wrappedFn({ keystone, listKey, ...rest, list, items, ...list.gqlNames });
    };
  };

  test(
    'Create',
    withKeystone(
      withHelpers(async ({ keystone, createMutationName }) => {
        const { data, errors } = await graphqlRequest({
          keystone,
          query: `mutation {
          ${createMutationName}(data: { name: "test entry" price: "17.56" }) {
            price
          }
        }`,
        });
        expect(errors).toBe(undefined);
        expect(data[createMutationName]).not.toBe(null);
        expect(data[createMutationName].price).toBe('17.56');
      })
    )
  );

  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, items, itemQueryName }) => {
        const { data, errors } = await graphqlRequest({
          keystone,
          query: `query {
          ${itemQueryName}(where: { id: "${items[0].id}"}) {
            price
          }
        }`,
        });
        expect(errors).toBe(undefined);
        expect(data[itemQueryName]).not.toBe(null);
        expect(data[itemQueryName].price).toBe(items[0].price);
      })
    )
  );

  describe('Update', () => {
    test(
      'Updating the value',
      withKeystone(
        withHelpers(async ({ keystone, items, updateMutationName }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `mutation {
            ${updateMutationName}(
              id: "${items[0].id}"
              data: { price: "879.46" }
            ) {
              price
            }
          }`,
          });
          expect(errors).toBe(undefined);
          expect(data[updateMutationName]).not.toBe(null);
          expect(data[updateMutationName].price).toBe('879.46');
        })
      )
    );

    test(
      'Updating the value to null',
      withKeystone(
        withHelpers(async ({ keystone, items, updateMutationName }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `mutation {
            ${updateMutationName}(
              id: "${items[0].id}"
              data: { price: null }
            ) {
              price
            }
          }`,
          });
          expect(errors).toBe(undefined);
          expect(data[updateMutationName]).not.toBe(null);
          expect(data[updateMutationName].price).toBe(null);
        })
      )
    );

    test(
      'Updating without this field',
      withKeystone(
        withHelpers(async ({ keystone, items, updateMutationName }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `mutation {
            ${updateMutationName}(
              id: "${items[0].id}"
              data: { name: "foobarbaz" }
            ) {
              name
              price
            }
          }`,
          });
          expect(errors).toBe(undefined);
          expect(data[updateMutationName]).not.toBe(null);
          expect(data[updateMutationName].name).toBe('foobarbaz');
          expect(data[updateMutationName].price).toBe(items[0].price);
        })
      )
    );
  });
};
