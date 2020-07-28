import { matchFilter } from '@keystonejs/test-utils';
import Text from '../Text';
import CalendarDay from './';

export const name = 'CalendarDay';
export { CalendarDay as type };
export const exampleValue = '"1990-12-31"';
export const exampleValue2 = '"2000-12-31"';
export const supportsUnique = true;

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
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'name birthday',
      expected,
      sortKey: 'name',
    });

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
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
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { }', [
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
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday: "2000-01-20" }', [
        { name: 'person2', birthday: '2000-01-20' },
      ])
    )
  );

  test(
    'Filter: birthday_not',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_not: "2000-01-20" }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
        { name: 'person5', birthday: null },
      ])
    )
  );

  test(
    'Filter: birthday_not null',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_not: null }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );

  test(
    'Filter: birthday_lt',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_lt: "1950-10-01" }', [
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );

  test(
    'Filter: birthday_lte',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_lte: "1950-10-01" }', [
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );

  test(
    'Filter: birthday_gt',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_gt: "1950-10-01" }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
      ])
    )
  );

  test(
    'Filter: birthday_gte',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_gte: "1950-10-01" }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
      ])
    )
  );

  test(
    'Filter: birthday_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, 'where: { birthday_in: [] }', []))
  );

  test(
    'Filter: birthday_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_not_in: [] }', [
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
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_in: ["1990-12-31", "2000-01-20", "1950-10-01"] }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
      ])
    )
  );

  test(
    'Filter: birthday_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_not_in: ["1990-12-31", "2000-01-20", "1950-10-01"] }', [
        { name: 'person4', birthday: '1666-04-12' },
        { name: 'person5', birthday: null },
      ])
    )
  );

  test(
    'Filter: birthday_in null',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_in: [null] }', [{ name: 'person5', birthday: null }])
    )
  );

  test(
    'Filter: birthday_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { birthday_not_in: [null] }', [
        { name: 'person1', birthday: '1990-12-31' },
        { name: 'person2', birthday: '2000-01-20' },
        { name: 'person3', birthday: '1950-10-01' },
        { name: 'person4', birthday: '1666-04-12' },
      ])
    )
  );
};
