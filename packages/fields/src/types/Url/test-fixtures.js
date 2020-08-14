import { getItems } from '@keystonejs/server-side-graphql-client';
import Text from './';
import Url from './';

export const name = 'Url';
export { Url as type };
export const exampleValue = '"https://keystonejs.org"';
export const exampleValue2 = '"https://thinkmill.com.au"';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    order: { type: Text },
    name: { type: Url },
  };
};

export const initItems = () => {
  return [
    { order: 'a', name: '' },
    { order: 'b', name: 'https://other.com' },
    { order: 'c', name: 'https://FOOBAR.com' },
    { order: 'd', name: 'https://fooBAR.com' },
    { order: 'e', name: 'https://foobar.com' },
    { order: 'f', name: null },
    { order: 'g' },
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone/issues/391

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'order name',
        sortBy: 'order_ASC',
      })
    ).toEqual(expected);

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key} (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name: 'https://fooBAR.com' }, [{ order: 'd', name: 'https://fooBAR.com' }])
    )
  );
  test(
    `Filter: {key}_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_i: 'https://fooBAR.com' }, [
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not: 'https://fooBAR.com' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_i: 'https://fooBAR.com' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_contains: 'oo' }, [
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
      ])
    )
  );
  test(
    `Filter: {key}_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_contains_i: 'oo' }, [
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_contains: 'oo' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_contains_i: 'oo' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_starts_with: 'https://foo' }, [
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
      ])
    )
  );
  test(
    `Filter: {key}_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_starts_with_i: 'https://foo' }, [
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_starts_with: 'https://foo' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_not_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_starts_with_i: 'https://foo' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_ends_with: 'BAR.com' }, [
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
      ])
    )
  );
  test(
    `Filter: {key}_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_ends_with_i: 'BAR.com' }, [
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_ends_with: 'BAR.com' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'e', name: 'https://foobar.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_ends_with_i: 'BAR.com' }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );

  test(
    `Filter: {key}_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) => match(keystone, { name_in: [] }, []))
  );
  test(
    `Filter: {key}_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_in: ['', 'https://FOOBAR.com'] }, [
        { order: 'a', name: '' },
        { order: 'c', name: 'https://FOOBAR.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_in: [] }, [
        { order: 'a', name: '' },
        { order: 'b', name: 'https://other.com' },
        { order: 'c', name: 'https://FOOBAR.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { name_not_in: ['', 'https://FOOBAR.com'] }, [
        { order: 'b', name: 'https://other.com' },
        { order: 'd', name: 'https://fooBAR.com' },
        { order: 'e', name: 'https://foobar.com' },
        { order: 'f', name: null },
        { order: 'g', name: null },
      ])
    )
  );
};
