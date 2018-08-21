import { matchFilter } from '../../tests/fields.test';
import Password from './';
import Text from '../Text';

export const name = 'Password';

export const getTestFields = () => {
  return {
    name: { type: Text },
    password: { type: Password, minLength: 4 },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', password: 'pass1' },
    { name: 'person2', password: '' },
    { name: 'person3', password: 'pass3' },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(
      app,
      filter,
      '{ name password_is_set }',
      targets.map(x => {
        return x;
      }),
      done,
      'name' // Sort by name
    );
  };

  test('No filter', done => {
    match(
      undefined,
      [
        { name: 'person1', password_is_set: true },
        { name: 'person2', password_is_set: false },
        { name: 'person3', password_is_set: true },
      ],
      done
    );
  });

  test('Empty filter', done => {
    match(
      'where: { }',
      [
        { name: 'person1', password_is_set: true },
        { name: 'person2', password_is_set: false },
        { name: 'person3', password_is_set: true },
      ],
      done
    );
  });

  test('Filter: is_set - true', done => {
    match(
      'where: { password_is_set: true }',
      [{ name: 'person1', password_is_set: true }, { name: 'person3', password_is_set: true }],
      done
    );
  });

  test('Filter: is_set - false', done => {
    match('where: { password_is_set: false }', [{ name: 'person2', password_is_set: false }], done);
  });
};
