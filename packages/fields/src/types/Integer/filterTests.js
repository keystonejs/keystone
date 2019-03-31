import { matchFilter } from '@keystone-alpha/test-utils';
import Text from '../Text';
import Integer from './';

export const name = 'Integer';

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
  const match = (server, filter, targets) =>
    matchFilter(server, filter, '{ name, count }', targets, 'name');

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
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
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [
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
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count: 1 }', [{ name: 'person2', count: 1 }])
    )
  );

  test(
    'Filter: count_not',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_not: 1 }', [
        { name: 'person1', count: 0 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_not null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_not: null }', [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );

  test(
    'Filter: count_lt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_lt: 2 }', [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
      ])
    )
  );

  test(
    'Filter: count_lte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_lte: 2 }', [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ])
    )
  );

  test(
    'Filter: count_gt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_gt: 2 }', [{ name: 'person4', count: 3 }])
    )
  );

  test(
    'Filter: count_gte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_gte: 2 }', [
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );

  test(
    'Filter: count_in (empty list)',
    withKeystone(({ server: { server } }) => match(server, 'where: { count_in: [] }', []))
  );

  test(
    'Filter: count_not_in (empty list)',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_not_in: [] }', [
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
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_in: [0, 1, 2] }', [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ])
    )
  );

  test(
    'Filter: count_not_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_not_in: [0, 1, 2] }', [
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_in: [null] }', [{ name: 'person5', count: null }])
    )
  );

  test(
    'Filter: count_not_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { count_not_in: [null] }', [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );
};
