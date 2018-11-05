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

export const filterTests = withKeystone => {
  const match = (server, filter, targets) =>
    matchFilter(server, filter, '{ name enabled }', targets, 'name');

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Filter: enabled true',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { enabled: true }', [
        { name: 'person1', enabled: true },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Filter: enabled false',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { enabled: false }', [{ name: 'person2', enabled: false }])
    )
  );

  test(
    'Filter: enabled_not true',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { enabled_not: true }', [
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
      ])
    )
  );

  test(
    'Filter: enabled_not false',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { enabled_not: false }', [
        { name: 'person1', enabled: true },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );
};
