import { getItems } from '@keystonejs/server-side-graphql-client';
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
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name password_is_set',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

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
      match(keystone, {}, [
        { name: 'person1', password_is_set: true },
        { name: 'person2', password_is_set: false },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Filter: is_set - true',
    withKeystone(({ keystone }) =>
      match(keystone, { password_is_set: true }, [
        { name: 'person1', password_is_set: true },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Filter: is_set - false',
    withKeystone(({ keystone }) =>
      match(keystone, { password_is_set: false }, [{ name: 'person2', password_is_set: false }])
    )
  );
};
