import { matchFilter } from '../../tests/fields.test';
import Text from '../Text';
import Float from './';

export const name = 'Float';

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
    {
      name: 'post1',
      stars: 0,
    },
    {
      name: 'post2',
      stars: 1.2,
    },
    {
      name: 'post3',
      stars: 2.3,
    },
    {
      name: 'post4',
      stars: 3,
    },
    {
      name: 'post5',
      stars: null,
    },
  ];
};

export const filterTests = withKeystone => {
  const match = (server, filter, targets) =>
    matchFilter(server, filter, '{ name, stars }', targets, 'name');

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
        {
          name: 'post5',
          stars: null,
        },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
        {
          name: 'post5',
          stars: null,
        },
      ])
    )
  );

  test(
    'Filter: stars',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars: 1.2 }', [
        {
          name: 'post2',
          stars: 1.2,
        },
      ])
    )
  );

  test(
    'Filter: stars_not',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_not: 1.2 }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
        {
          name: 'post5',
          stars: null,
        },
      ])
    )
  );

  test(
    'Filter: stars_not null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_not: null }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
      ])
    )
  );

  test(
    'Filter: stars_lt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_lt: 2.30 }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
      ])
    )
  );

  test(
    'Filter: stars_lte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_lte: 2.30 }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
      ])
    )
  );

  test(
    'Filter: stars_gt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_gt: 2.30 }', [
        {
          name: 'post4',
          stars: 3,
        },
      ])
    )
  );

  test(
    'Filter: stars_gte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_gte: 2.30 }', [
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
      ])
    )
  );

  test(
    'Filter: stars_in (empty list)',
    withKeystone(({ server: { server } }) => match(server, 'where: { stars_in: [] }', []))
  );

  test(
    'Filter: stars_not_in (empty list)',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_not_in: [] }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
        {
          name: 'post5',
          stars: null,
        },
      ])
    )
  );

  test(
    'Filter: stars_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_in: [0, 1.2, 2.30] }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
      ])
    )
  );

  test(
    'Filter: stars_not_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_not_in: [0, 1.2, 2.30] }', [
        {
          name: 'post4',
          stars: 3,
        },
        {
          name: 'post5',
          stars: null,
        },
      ])
    )
  );

  test(
    'Filter: stars_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_in: [null] }', [
        {
          name: 'post5',
          stars: null,
        },
      ])
    )
  );

  test(
    'Filter: stars_not_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { stars_not_in: [null] }', [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
      ])
    )
  );
};
