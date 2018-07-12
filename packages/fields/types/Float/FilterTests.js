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

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(app, filter, '{ name, stars }', targets, done, 'name');
  };

  test('No filter', done => {
    match(
      undefined,
      [
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
      ],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [
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
      ],
      done
    );
  });

  test('Filter: stars', done => {
    match(
      'where: { stars: 1.2 }',
      [
        {
          name: 'post2',
          stars: 1.2,
        },
      ],
      done
    );
  });

  test('Filter: stars_not', done => {
    match(
      'where: { stars_not: 1.2 }',
      [
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
      ],
      done
    );
  });

  test('Filter: stars_not null', done => {
    match(
      'where: { stars_not: null }',
      [
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
      ],
      done
    );
  });

  test('Filter: stars_lt', done => {
    match(
      'where: { stars_lt: 2.30 }',
      [
        {
          name: 'post1',
          stars: 0,
        },
        {
          name: 'post2',
          stars: 1.2,
        },
      ],
      done
    );
  });

  test('Filter: stars_lte', done => {
    match(
      'where: { stars_lte: 2.30 }',
      [
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
      ],
      done
    );
  });

  test('Filter: stars_gt', done => {
    match(
      'where: { stars_gt: 2.30 }',
      [
        {
          name: 'post4',
          stars: 3,
        },
      ],
      done
    );
  });

  test('Filter: stars_gte', done => {
    match(
      'where: { stars_gte: 2.30 }',
      [
        {
          name: 'post3',
          stars: 2.3,
        },
        {
          name: 'post4',
          stars: 3,
        },
      ],
      done
    );
  });

  test('Filter: stars_in (empty list)', done => {
    match('where: { stars_in: [] }', [], done);
  });

  test('Filter: stars_not_in (empty list)', done => {
    match(
      'where: { stars_not_in: [] }',
      [
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
      ],
      done
    );
  });

  test('Filter: stars_in', done => {
    match(
      'where: { stars_in: [0, 1.2, 2.30] }',
      [
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
      ],
      done
    );
  });

  test('Filter: stars_not_in', done => {
    match(
      'where: { stars_not_in: [0, 1.2, 2.30] }',
      [
        {
          name: 'post4',
          stars: 3,
        },
        {
          name: 'post5',
          stars: null,
        },
      ],
      done
    );
  });

  test('Filter: stars_in null', done => {
    match(
      'where: { stars_in: [null] }',
      [
        {
          name: 'post5',
          stars: null,
        },
      ],
      done
    );
  });

  test('Filter: stars_not_in null', done => {
    match(
      'where: { stars_not_in: [null] }',
      [
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
      ],
      done
    );
  });
};
