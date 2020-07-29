import { matchFilter } from '@keystonejs/test-utils';
import Text from './';

const fieldType = 'Text';
export { fieldType as name };

export { Text as type };
export const exampleValue = '"foo"';
export const exampleValue2 = '"bar"';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    order: { type: Text },
    name: { type: Text },
  };
};

export const initItems = () => {
  return [
    { order: 'a', name: '' },
    { order: 'b', name: 'other' },
    { order: 'c', name: 'FOOBAR' },
    { order: 'd', name: 'fooBAR' },
    { order: 'e', name: 'foobar' },
    { order: 'f', name: null },
    { order: 'g' },
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone/issues/391

export const filterTests = withKeystone => {
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'order name',
      expected,
      sortKey: 'order',
    });

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, '', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, '', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key} (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name: "fooBAR" }', [{ order: 'd', name: 'fooBAR' }])
    )
  );
  test(
    `Filter: {key}_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_i: "fooBAR" }', [
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not: "fooBAR" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'c', name: 'FOOBAR' },
        { order: 'e', name: 'foobar' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_i: "fooBAR" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_contains: "oo" }', [
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
      ])
    )
  );
  test(
    `Filter: {key}_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_contains_i: "oo" }', [
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_contains: "oo" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'c', name: 'FOOBAR' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_contains_i: "oo" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_starts_with: "foo" }', [
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
      ])
    )
  );
  test(
    `Filter: {key}_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_starts_with_i: "foo" }', [
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_starts_with: "foo" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'c', name: 'FOOBAR' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_starts_with_i: "foo" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_ends_with: "BAR" }', [
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
      ])
    )
  );
  test(
    `Filter: {key}_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_ends_with_i: "BAR" }', [
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_ends_with: "BAR" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'e', name: 'foobar' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_ends_with_i: "BAR" }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) => match(keystone, 'where: { name_in: [] }', []))
  );
  test(
    `Filter: {key}_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_in: ["", "FOOBAR"] }', [
        { order: 'a', name: '' },
        { order: 'c', name: 'FOOBAR' },
      ])
    )
  );

  test(
    `Filter: {key}_not_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_in: [] }', [
        { order: 'a', name: '' },
        { order: 'b', name: 'other' },
        { order: 'c', name: 'FOOBAR' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { name_not_in: ["", "FOOBAR"] }', [
        { order: 'b', name: 'other' },
        { order: 'd', name: 'fooBAR' },
        { order: 'e', name: 'foobar' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
};
