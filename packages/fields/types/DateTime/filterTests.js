import { matchFilter } from '../../tests/fields.test';
import Text from '../Text';
import DateTime from './';

export const name = 'DateTime';

export const getTestFields = () => {
  return {
    name: { type: Text },
    lastOnline: { type: DateTime },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
    { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
    { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
    { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
    { name: 'person5', lastOnline: null },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(app, filter, '{ name, lastOnline }', targets, done, 'name');
  };

  test('No filter', done => {
    match(
      undefined,
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ],
      done
    );
  });

  test('Filter: lastOnline', done => {
    match(
      'where: { lastOnline: "2000-01-20T00:08:00.000+10:00" }',
      [{ name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' }],
      done
    );
  });

  test('Filter: lastOnline_not', done => {
    match(
      'where: { lastOnline_not: "2000-01-20T00:08:00.000+10:00" }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ],
      done
    );
  });

  test('Filter: lastOnline_not null', done => {
    match(
      'where: { lastOnline_not: null }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
      ],
      done
    );
  });

  test('Filter: lastOnline_lt', done => {
    match(
      'where: { lastOnline_lt: "1950-10-01T23:59:59.999-10:00" }',
      [{ name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' }],
      done
    );
  });

  test('Filter: lastOnline_lte', done => {
    match(
      'where: { lastOnline_lte: "1950-10-01T23:59:59.999-10:00" }',
      [
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
      ],
      done
    );
  });

  test('Filter: lastOnline_gt', done => {
    match(
      'where: { lastOnline_gt: "1950-10-01T23:59:59.999-10:00" }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
      ],
      done
    );
  });

  test('Filter: lastOnline_gte', done => {
    match(
      'where: { lastOnline_gte: "1950-10-01T23:59:59.999-10:00" }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
      ],
      done
    );
  });

  test('Filter: lastOnline_in (empty list)', done => {
    match('where: { lastOnline_in: [] }', [], done);
  });

  test('Filter: lastOnline_not_in (empty list)', done => {
    match(
      'where: { lastOnline_not_in: [] }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ],
      done
    );
  });

  test('Filter: lastOnline_in', done => {
    match(
      'where: { lastOnline_in: ["1990-12-31T12:34:56.789+01:23", "2000-01-20T00:08:00.000+10:00", "1950-10-01T23:59:59.999-10:00"] }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
      ],
      done
    );
  });

  test('Filter: lastOnline_not_in', done => {
    match(
      'where: { lastOnline_not_in: ["1990-12-31T12:34:56.789+01:23", "2000-01-20T00:08:00.000+10:00", "1950-10-01T23:59:59.999-10:00"] }',
      [
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ],
      done
    );
  });

  test('Filter: lastOnline_in null', done => {
    match('where: { lastOnline_in: [null] }', [{ name: 'person5', lastOnline: null }], done);
  });

  test('Filter: lastOnline_not_in null', done => {
    match(
      'where: { lastOnline_not_in: [null] }',
      [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
      ],
      done
    );
  });
};
