import { matchFilter } from '@keystonejs/test-utils';
import Password from './';
import Text from '../Text';

export const name = 'Password';
export { Password as type };
export const exampleValue = '"password"';
export const supportsUnique = false;

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

export const filterTests = withKeystone => {
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'name password_is_set',
      expected,
      sortKey: 'name',
    });

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'person1', password_is_set: true },
        { name: 'person2', password_is_set: false },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { }', [
        { name: 'person1', password_is_set: true },
        { name: 'person2', password_is_set: false },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Filter: is_set - true',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { password_is_set: true }', [
        { name: 'person1', password_is_set: true },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Filter: is_set - false',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { password_is_set: false }', [
        { name: 'person2', password_is_set: false },
      ])
    )
  );
};
