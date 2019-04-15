import { matchFilter } from '@keystone-alpha/test-utils';
import Text from '../Text';
import CalendarDay from './';

export const name = 'CalendarDay';

export const getTestFields = () => {
  return {
    name: { type: Text },
    birthday: { type: CalendarDay },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', birthday: '1990-12-31' },
    { name: 'person2', birthday: '2000-01-20' },
    { name: 'person3', birthday: '1950-10-01' },
    { name: 'person4', birthday: '1666-04-12' },
    { name: 'person5', birthday: null },
  ];
};

export const filterTests = withKeystone => {
  const match = (server, filter, targets) =>
    matchFilter(server, filter, '{ name, birthday }', targets, 'name');

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
        { name: 'person5', birthday: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
        { name: 'person5', birthday: null },
      ])
    )
  );

  test(
    'Filter: birthday',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday: "2000-01-20" }', [
        { name: 'person2', birthday: '2000-01-20' },
      ])
    )
  );

  test(
    'Filter: birthday_not',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_not: "2000-01-20" }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
        { name: 'person5', birthday: null },
      ])
    )
  );

  test(
    'Filter: birthday_not null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_not: null }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );

  test(
    'Filter: birthday_lt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_lt: "1950-10-01" }', [
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );

  test(
    'Filter: birthday_lte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_lte: "1950-10-01" }', [
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );

  test(
    'Filter: birthday_gt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_gt: "1950-10-01" }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
      ])
    )
  );

  test(
    'Filter: birthday_gte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_gte: "1950-10-01" }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
      ])
    )
  );

  test(
    'Filter: birthday_in (empty list)',
    withKeystone(({ server: { server } }) => match(server, 'where: { birthday_in: [] }', []))
  );

  test(
    'Filter: birthday_not_in (empty list)',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_not_in: [] }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
        { name: 'person5', birthday: null },
      ])
    )
  );

  test(
    'Filter: birthday_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_in: ["1990-12-31", "2000-01-20", "1950-10-01"] }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
      ])
    )
  );

  test(
    'Filter: birthday_not_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_not_in: ["1990-12-31", "2000-01-20", "1950-10-01"] }', [
        { name: 'person4', birthday: '1666-04-12' },
        { name: 'person5', birthday: null },
      ])
    )
  );

  test(
    'Filter: birthday_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_in: [null] }', [{ name: 'person5', birthday: null }])
    )
  );

  test(
    'Filter: birthday_not_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { birthday_not_in: [null] }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );
};
