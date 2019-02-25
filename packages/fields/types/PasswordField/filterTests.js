import { matchFilter } from '@voussoir/test-utils';
import Text from '@voussoir/field-text';
import Password from './';

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

export const filterTests = withKeystone => {
  const match = (server, filter, targets) =>
    matchFilter(
      server,
      filter,
      '{ name password_is_set }',
      targets,
      'name' // Sort by name
    );

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
        { name: 'person1', password_is_set: true },
        { name: 'person2', password_is_set: false },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [
        { name: 'person1', password_is_set: true },
        { name: 'person2', password_is_set: false },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Filter: is_set - true',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { password_is_set: true }', [
        { name: 'person1', password_is_set: true },
        { name: 'person3', password_is_set: true },
      ])
    )
  );

  test(
    'Filter: is_set - false',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { password_is_set: false }', [
        { name: 'person2', password_is_set: false },
      ])
    )
  );
};
