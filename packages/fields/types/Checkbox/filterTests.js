import { matchFilter } from '../../tests/fields.test';
import Text from '../Text';
import Checkbox from './';

export const name = 'Checkbox';

export const getTestFields = () => {
  return {
    name: { type: Text },
    enabled: { type: Checkbox },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', enabled: true },
    { name: 'person2', enabled: false },
    { name: 'person3', enabled: null },
    { name: 'person4', enabled: true },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(app, filter, '{ name enabled }', targets, done, 'name');
  };

  test('No filter', done => {
    match(
      undefined,
      [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ],
      done
    );
  });

  test('Filter: enabled true', done => {
    match(
      'where: { enabled: true }',
      [{ name: 'person1', enabled: true }, { name: 'person4', enabled: true }],
      done
    );
  });

  test('Filter: enabled false', done => {
    match('where: { enabled: false }', [{ name: 'person2', enabled: false }], done);
  });

  test('Filter: enabled_not true', done => {
    match(
      'where: { enabled_not: true }',
      [{ name: 'person2', enabled: false }, { name: 'person3', enabled: null }],
      done
    );
  });

  test('Filter: enabled_not false', done => {
    match(
      'where: { enabled_not: false }',
      [
        { name: 'person1', enabled: true },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ],
      done
    );
  });
};
