import { matchFilter } from '../../tests/fields.test';
import Text from '../Text';
import Boolean from './';

export const name = 'Boolean';

export const getTestFields = () => {
  return {
    name: { type: Text },
    bool: { type: Boolean },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', bool: true },
    { name: 'person2', bool: false },
    { name: 'person3', bool: null },
    { name: 'person4', bool: true },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(app, filter, '{ name bool }', targets, done, 'name');
  };

  test('No filter', done => {
    match(
      undefined,
      [
        { name: 'person1', bool: true },
        { name: 'person2', bool: false },
        { name: 'person3', bool: null },
        { name: 'person4', bool: true },
      ],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [
        { name: 'person1', bool: true },
        { name: 'person2', bool: false },
        { name: 'person3', bool: null },
        { name: 'person4', bool: true },
      ],
      done
    );
  });

  test('Filter: bool true', done => {
    match(
      'where: { bool: true }',
      [
        { name: 'person1', bool: true },
        { name: 'person4', bool: true },
      ],
      done
    );
  });

  test('Filter: bool false', done => {
    match(
      'where: { bool: false }',
      [{ name: 'person2', bool: false }],
      done
    );
  });

  test('Filter: bool_not true', done => {
    match(
      'where: { bool_not: true }',
      [
        { name: 'person2', bool: false },
        { name: 'person3', bool: null },
      ],
      done
    );
  });

  test('Filter: bool_not false', done => {
    match(
      'where: { bool_not: false }',
      [
        { name: 'person1', bool: true },
        { name: 'person3', bool: null },
        { name: 'person4', bool: true },
      ],
      done
    );
  });
};
