import { getItems } from '@keystonejs/server-side-graphql-client';
import Text from './';
import Url from './';

export const name = 'Url';
export { Url as type };
export const exampleValue = 'https://keystonejs.org';
export const exampleValue2 = 'https://thinkmill.com.au';
export const supportsUnique = true;
export const fieldName = 'url';

export const getTestFields = () => {
  return {
    name: { type: Text },
    url: { type: Url },
  };
};

export const initItems = () => {
  return [
    { name: 'a', url: '' },
    { name: 'b', url: 'https://other.com' },
    { name: 'c', url: 'https://FOOBAR.com' },
    { name: 'd', url: 'https://fooBAR.com' },
    { name: 'e', url: 'https://foobar.com' },
    { name: 'f', url: null },
    { name: 'g' },
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone/issues/391

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name url',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );

  test(
    `Filter: {key} (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url: 'https://fooBAR.com' }, [{ name: 'd', url: 'https://fooBAR.com' }])
    )
  );
  test(
    `Filter: {key}_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_i: 'https://fooBAR.com' }, [
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not: 'https://fooBAR.com' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_i: 'https://fooBAR.com' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );

  test(
    `Filter: {key}_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_contains: 'oo' }, [
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
      ])
    )
  );
  test(
    `Filter: {key}_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_contains_i: 'oo' }, [
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_contains (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_contains: 'oo' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_contains_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_contains_i: 'oo' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );

  test(
    `Filter: {key}_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_starts_with: 'https://foo' }, [
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
      ])
    )
  );
  test(
    `Filter: {key}_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_starts_with_i: 'https://foo' }, [
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_starts_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_starts_with: 'https://foo' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );

  test(
    `Filter: {key}_not_starts_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_starts_with_i: 'https://foo' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );

  test(
    `Filter: {key}_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_ends_with: 'BAR.com' }, [
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
      ])
    )
  );
  test(
    `Filter: {key}_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_ends_with_i: 'BAR.com' }, [
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_ends_with (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_ends_with: 'BAR.com' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'e', url: 'https://foobar.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_ends_with_i (case-insensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_ends_with_i: 'BAR.com' }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );

  test(
    `Filter: {key}_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) => match(keystone, { url_in: [] }, []))
  );
  test(
    `Filter: {key}_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_in: ['', 'https://FOOBAR.com'] }, [
        { name: 'a', url: '' },
        { name: 'c', url: 'https://FOOBAR.com' },
      ])
    )
  );

  test(
    `Filter: {key}_not_in (case-sensitive, empty list)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_in: [] }, [
        { name: 'a', url: '' },
        { name: 'b', url: 'https://other.com' },
        { name: 'c', url: 'https://FOOBAR.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_in (case-sensitive)`,
    withKeystone(({ keystone }) =>
      match(keystone, { url_not_in: ['', 'https://FOOBAR.com'] }, [
        { name: 'b', url: 'https://other.com' },
        { name: 'd', url: 'https://fooBAR.com' },
        { name: 'e', url: 'https://foobar.com' },
        { name: 'f', url: null },
        { name: 'g', url: null },
      ])
    )
  );
};
