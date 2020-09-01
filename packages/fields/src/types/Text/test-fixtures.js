import { getItems } from '@keystonejs/server-side-graphql-client';
import Text from './';

const fieldType = 'Text';
export { fieldType as name };

export { Text as type };
export const exampleValue = 'foo';
export const exampleValue2 = 'bar';
export const supportsUnique = true;
export const fieldName = 'text';

export const getTestFields = () => {
  return {
    name: { type: Text },
    text: { type: Text },
  };
};

export const initItems = () => {
  return [
    { name: 'a', text: '' },
    { name: 'b', text: 'other' },
    { name: 'c', text: 'FOOBAR' },
    { name: 'd', text: 'fooBAR' },
    { name: 'e', text: 'foobar' },
    { name: 'f', text: null },
    { name: 'g' },
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and nameing)
// See https://github.com/keystonejs/keystone/issues/391

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name text',
        sortBy,
      })
    ).toEqual(expected);

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );

  test(
    `Filter: {key} (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text: 'fooBAR' }, [{ name: 'd', text: 'fooBAR' }])
    )
  );
  test(
    `Filter: {key}_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_i: 'fooBAR' }, [
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not: 'fooBAR' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'c', text: 'FOOBAR' },
        { name: 'e', text: 'foobar' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_i: 'fooBAR' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );

  test(
    `Filter: {key}_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_contains: 'oo' }, [
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
      ])
    )
  );
  test(
    `Filter: {key}_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_contains_i: 'oo' }, [
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_contains: 'oo' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'c', text: 'FOOBAR' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_contains_i: 'oo' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );

  test(
    `Filter: {key}_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_starts_with: 'foo' }, [
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
      ])
    )
  );
  test(
    `Filter: {key}_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_starts_with_i: 'foo' }, [
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_starts_with: 'foo' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'c', text: 'FOOBAR' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_starts_with_i: 'foo' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );

  test(
    `Filter: {key}_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_ends_with: 'BAR' }, [
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
      ])
    )
  );
  test(
    `Filter: {key}_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_ends_with_i: 'BAR' }, [
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
      ])
    )
  );

  test(
    `Filter: {key}_not_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_ends_with: 'BAR' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'e', text: 'foobar' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_ends_with_i: 'BAR' }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );

  test(
    `Filter: {key}_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) => match(keystone, { text_in: [] }, []))
  );
  test(
    `Filter: {key}_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_in: ['', 'FOOBAR'] }, [
        { name: 'a', text: '' },
        { name: 'c', text: 'FOOBAR' },
      ])
    )
  );

  test(
    `Filter: {key}_not_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_in: [] }, [
        { name: 'a', text: '' },
        { name: 'b', text: 'other' },
        { name: 'c', text: 'FOOBAR' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { text_not_in: ['', 'FOOBAR'] }, [
        { name: 'b', text: 'other' },
        { name: 'd', text: 'fooBAR' },
        { name: 'e', text: 'foobar' },
        { name: 'f', text: null },
        { name: 'g', text: null },
      ])
    )
  );
};
