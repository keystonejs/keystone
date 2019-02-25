import { matchFilter } from '@voussoir/test-utils';
import Text from '@voussoir/field-text';
import Decimal from './';

export const name = 'Decimal';

export const getTestFields = () => {
  return {
    name: { type: Text },
    price: { type: Decimal },
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
  const match = (server, filter, targets) =>
    matchFilter(server, filter, '{ name, price }', targets, 'name');

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
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
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [
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
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price: "50.00" }', [{ name: 'price1', price: '50.00' }])
    )
  );

  test(
    'Filter: price_not',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_not: "50.00" }', [
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_lt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_lt: "50.00" }', [{ name: 'price2', price: '0.01' }])
    )
  );

  test(
    'Filter: price_lte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_lte: "2000.00" }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
      ])
    )
  );

  test(
    'Filter: price_gt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_gt: "2000.00" }', [{ name: 'price4', price: '40000.00' }])
    )
  );

  test(
    'Filter: price_gte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_gte: "2000.00" }', [
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
      ])
    )
  );
};
