import { matchFilter } from '../../tests/fields.test';
import Text from './';

const fieldType = 'Text';
export { fieldType as name };

export const getTestFields = () => {
  return {
    name: { type: Text },
  };
};

export const initItems = () => {
  return [
    { name: '' },
    { name: 'other' },
    { name: 'FOOBAR' },
    { name: 'fooBAR' },
    { name: 'foobar' },
    { name: null },
    {},
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone-5/issues/391

export const filterTests = withKeystone => {
  const match = (server, gqlArgs, targets) => {
    gqlArgs = (gqlArgs || '') + ' orderBy: "name"';
    return matchFilter(server, gqlArgs, '{ name }', targets.map(name => ({ name })));
  };

  test(
    `No 'where' argument`,
    withKeystone(({ server: { server } }) =>
      match(server, '', [null, null, '', 'FOOBAR', 'fooBAR', 'foobar', 'other'])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [null, null, '', 'FOOBAR', 'fooBAR', 'foobar', 'other'])
    )
  );

  test(
    `Filter: {key} (case-sensitive)`,
    withKeystone(({ server: { server } }) => match(server, 'where: { name: "fooBAR" }', ['fooBAR']))
  );
  test(
    `Filter: {key}_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_i: "fooBAR" }', ['FOOBAR', 'fooBAR', 'foobar'])
    )
  );

  test(
    `Filter: {key}_not (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not: "fooBAR" }', [null, null, '', 'FOOBAR', 'foobar', 'other'])
    )
  );
  test(
    `Filter: {key}_not_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_i: "fooBAR" }', [null, null, '', 'other'])
    )
  );

  test(
    `Filter: {key}_contains (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_contains: "oo" }', ['fooBAR', 'foobar'])
    )
  );
  test(
    `Filter: {key}_contains_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_contains_i: "oo" }', ['FOOBAR', 'fooBAR', 'foobar'])
    )
  );

  test(
    `Filter: {key}_not_contains (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_contains: "oo" }', [null, null, '', 'FOOBAR', 'other'])
    )
  );
  test(
    `Filter: {key}_not_contains_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_contains_i: "oo" }', [null, null, '', 'other'])
    )
  );

  test(
    `Filter: {key}_starts_with (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_starts_with: "foo" }', ['fooBAR', 'foobar'])
    )
  );
  test(
    `Filter: {key}_starts_with_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_starts_with_i: "foo" }', ['FOOBAR', 'fooBAR', 'foobar'])
    )
  );

  test(
    `Filter: {key}_not_starts_with (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_starts_with: "foo" }', [null, null, '', 'FOOBAR', 'other'])
    )
  );
  test(
    `Filter: {key}_not_starts_with_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_starts_with_i: "foo" }', [null, null, '', 'other'])
    )
  );

  test(
    `Filter: {key}_ends_with (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_ends_with: "BAR" }', ['FOOBAR', 'fooBAR'])
    )
  );
  test(
    `Filter: {key}_ends_with_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_ends_with_i: "BAR" }', ['FOOBAR', 'fooBAR', 'foobar'])
    )
  );

  test(
    `Filter: {key}_not_ends_with (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_ends_with: "BAR" }', [null, null, '', 'foobar', 'other'])
    )
  );
  test(
    `Filter: {key}_not_ends_with_i (case-insensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_ends_with_i: "BAR" }', [null, null, '', 'other'])
    )
  );

  test(
    `Filter: {key}_in (case-sensitive, empty list)`,
    withKeystone(({ server: { server } }) => match(server, 'where: { name_in: [] }', []))
  );
  test(
    `Filter: {key}_in (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_in: ["", "FOOBAR"] }', ['', 'FOOBAR'])
    )
  );

  test(
    `Filter: {key}_not_in (case-sensitive, empty list)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_in: [] }', [
        null,
        null,
        '',
        'FOOBAR',
        'fooBAR',
        'foobar',
        'other',
      ])
    )
  );
  test(
    `Filter: {key}_not_in (case-sensitive)`,
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { name_not_in: ["", "FOOBAR"] }', [
        null,
        null,
        'fooBAR',
        'foobar',
        'other',
      ])
    )
  );
};
