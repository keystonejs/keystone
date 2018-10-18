import { matchFilter } from '../../tests/fields.test';
import Text from '../Text';
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
      match(server, 'where: { price: 50.00 }', [
        { name: 'price1', price: '50.00' },
      ])
    )
  );

  test(
    'Filter: price_not',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_not: 50.00 }', [
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_not null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_not: null }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
      ])
    )
  );

  test(
    'Filter: price_lt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_lt: 0.01 }', [
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_lte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_lte: 2 }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_gt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_gt: 2 }', [
        { name: 'price4', price: '40000.00' }
      ])
    )
  );

  test(
    'Filter: price_gte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_gte: 2 }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_in (empty list)',
    withKeystone(({ server: { server } }) => match(server, 'where: { price_in: [] }', []))
  );

  test(
    'Filter: price_not_in (empty list)',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_not_in: [] }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_in: [0, 1, 2] }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_not_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_not_in: [0, 1, 2] }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );

  test(
    'Filter: price_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_in: [null] }', [{ name: 'price5', price: null }])
    )
  );

  test(
    'Filter: price_not_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { price_not_in: [null] }', [
        { name: 'price1', price: '50.00' },
        { name: 'price2', price: '0.01' },
        { name: 'price3', price: '2000.00' },
        { name: 'price4', price: '40000.00' },
        { name: 'price5', price: null },
      ])
    )
  );
};
