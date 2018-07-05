import { matchFilter } from '../../tests/fields.test';
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

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(app, filter, '{ count }', targets, done, 'name');
  };

  test('No filter', done => {
    match(
      undefined,
      [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ],
      done
    );
  });

  test('Filter: count', done => {
    match('where: { count: 1 }', [{ name: 'Person2', count: 1 }], done);
  });

  test('Filter: count_not', done => {
    match(
      'where: { count_not: 1 }',
      [
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ],
      done
    );
  });

  test('Filter: count_not null', done => {
    match(
      'where: { count_not: null }',
      [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ],
      done
    );
  });

  test('Filter: count_lt', done => {
    match(
      'where: { count_lt: 2 }',
      [{ name: 'person1', count: 0 }, { name: 'person2', count: 1 }],
      done
    );
  });

  test('Filter: count_lte', done => {
    match(
      'where: { count_lte: 2 }',
      [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ],
      done
    );
  });

  test('Filter: count_gt', done => {
    match('where: { count_gt: 2 }', [{ name: 'person4', count: 3 }], done);
  });

  test('Filter: count_gte', done => {
    match(
      'where: { count_gte: 2 }',
      [
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ],
      done
    );
  });

  test('Filter: count_in (empty list)', done => {
    match('where: { count_in: [] }', [], done);
  });

  test('Filter: count_not_in (empty list)', done => {
    match(
      'where: { count_not_in: [] }',
      [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ],
      done
    );
  });

  test('Filter: count_in', done => {
    match(
      'where: { count_in: [0, 1, 2] }',
      [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ],
      done
    );
  });

  test('Filter: count_not_in', done => {
    match(
      'where: { count_not_in: [0, 1, 2] }',
      [{ name: 'person4', count: 3 }, { name: 'person5', count: null }],
      done
    );
  });

  test('Filter: count_in null', done => {
    match(
      'where: { count_in: [null] }',
      [{ name: 'person5', count: null }],
      done
    );
  });

  test('Filter: count_not_in null', done => {
    match(
      'where: { count_not_in: [null] }',
      [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ],
      done
    );
  });
};
