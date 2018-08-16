import { matchFilter } from '../../tests/fields.test';
import Text from '../Text';
import DateTime from './';

export const name = 'DateTime';

export const getTestFields = () => {
  return {
    name: { type: Text },
    birthday: { type: DateTime },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
    { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
    { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
    { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
    { name: 'person5', birthday: null },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(app, filter, '{ name, birthday }', targets, done, 'name');
  };

  test('No filter', done => {
    match(
      undefined,
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', birthday: null },
      ],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', birthday: null },
      ],
      done
    );
  });

  test('Filter: birthday', done => {
    match(
      'where: { birthday: "2000-01-20T00:08:00.000+10:00" }',
      [{ name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' }],
      done
    );
  });

  test('Filter: birthday_not', done => {
    match(
      'where: { birthday_not: "2000-01-20T00:08:00.000+10:00" }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', birthday: null },
      ],
      done
    );
  });

  test('Filter: birthday_not null', done => {
    match(
      'where: { birthday_not: null }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
      ],
      done
    );
  });

  test('Filter: birthday_lt', done => {
    match(
      'where: { birthday_lt: "1950-10-01T23:59:59.999-10:00" }',
      [{ name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' }],
      done
    );
  });

  test('Filter: birthday_lte', done => {
    match(
      'where: { birthday_lte: "1950-10-01T23:59:59.999-10:00" }',
      [
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
      ],
      done
    );
  });

  test('Filter: birthday_gt', done => {
    match(
      'where: { birthday_gt: "1950-10-01T23:59:59.999-10:00" }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
      ],
      done
    );
  });

  test('Filter: birthday_gte', done => {
    match(
      'where: { birthday_gte: "1950-10-01T23:59:59.999-10:00" }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
      ],
      done
    );
  });

  test('Filter: birthday_in (empty list)', done => {
    match('where: { birthday_in: [] }', [], done);
  });

  test('Filter: birthday_not_in (empty list)', done => {
    match(
      'where: { birthday_not_in: [] }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', birthday: null },
      ],
      done
    );
  });

  test('Filter: birthday_in', done => {
    match(
      'where: { birthday_in: ["1990-12-31T12:34:56.789+01:23", "2000-01-20T00:08:00.000+10:00", "1950-10-01T23:59:59.999-10:00"] }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
      ],
      done
    );
  });

  test('Filter: birthday_not_in', done => {
    match(
      'where: { birthday_not_in: ["1990-12-31T12:34:56.789+01:23", "2000-01-20T00:08:00.000+10:00", "1950-10-01T23:59:59.999-10:00"] }',
      [
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', birthday: null },
      ],
      done
    );
  });

  test('Filter: birthday_in null', done => {
    match('where: { birthday_in: [null] }', [{ name: 'person5', birthday: null }], done);
  });

  test('Filter: birthday_not_in null', done => {
    match(
      'where: { birthday_not_in: [null] }',
      [
        { name: 'person1', birthday: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', birthday: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', birthday: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', birthday: '1666-04-12T00:08:00.000+10:00' },
      ],
      done
    );
  });
};
