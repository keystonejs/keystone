import { matchFilter } from '@keystone/test-utils';
import Text from '../Text';
import Decimal from './';

export const name = 'Decimal';
export { Decimal as type };
export const exampleValue = '"6.28"';

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
  const match = (keystone, filter, targets) =>
    matchFilter(keystone, filter, '{ name, price }', targets, 'name');

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
