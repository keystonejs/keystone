import { matchFilter } from '@keystonejs/test-utils';
import Text from '../Text';
import Float from '.';

export const name = 'Float';
export { Float as type };
export const exampleValue = '6.28';
export const exampleValue2 = '6.283';
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
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'name stars',
      expected,
      sortKey: 'name',
    });

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
      match(keystone, 'where: { }', [
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
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars: 1.2 }', [{ name: 'post2', stars: 1.2 }])
    )
  );

  test(
    'Filter: stars_not',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_not: 1.2 }', [
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
      match(keystone, 'where: { stars_not: null }', [
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
      match(keystone, 'where: { stars_lt: 2.30 }', [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
      ])
    )
  );

  test(
    'Filter: stars_lte',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_lte: 2.30 }', [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
      ])
    )
  );

  test(
    'Filter: stars_gt',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_gt: 2.30 }', [{ name: 'post4', stars: 3 }])
    )
  );

  test(
    'Filter: stars_gte',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_gte: 2.30 }', [
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
      ])
    )
  );

  test(
    'Filter: stars_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, 'where: { stars_in: [] }', []))
  );

  test(
    'Filter: stars_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_not_in: [] }', [
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
      match(keystone, 'where: { stars_in: [0, 1.2, 2.30] }', [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
      ])
    )
  );

  test(
    'Filter: stars_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_not_in: [0, 1.2, 2.30] }', [
        { name: 'post4', stars: 3 },
        { name: 'post5', stars: null },
      ])
    )
  );

  test(
    'Filter: stars_in null',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_in: [null] }', [{ name: 'post5', stars: null }])
    )
  );

  test(
    'Filter: stars_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { stars_not_in: [null] }', [
        { name: 'post1', stars: 0 },
        { name: 'post2', stars: 1.2 },
        { name: 'post3', stars: 2.3 },
        { name: 'post4', stars: 3 },
      ])
    )
  );
};
