import { matchFilter } from '../../tests/fields.test';
import Boolean from './';

export const getTestFields = () => {
  return {
    isTested: { type: Boolean },
  };
};

export const initItems = () => {
  return [
    { isTested: true },
    { isTested: false },
    { isTested: null },
    { isTested: true },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(
      app,
      filter,
      '{ isTested }',
      targets.map(isTested => {
        return { isTested };
      }),
      done,
      'isTested'
    );
  };

  test('No filter', done => {
    match(
      undefined,
      [true, false, null, true],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [true, false, null, true],
      done
    );
  });

  test('Filter: isTested true', done => {
    match('where: { isTested: true }', [true, true], done);
  });

  test('Filter: isTested false', done => {
    match('where: { isTested: false }', [false], done);
  });

  test('Filter: isTested_not true', done => {
    match(
      'where: { isTested_not: true }',
      [false, null],
      done
    );
  });

  test('Filter: isTested_not false', done => {
    match(
      'where: { isTested_not: true }',
      [true, null, true],
      done
    );
  });

};
