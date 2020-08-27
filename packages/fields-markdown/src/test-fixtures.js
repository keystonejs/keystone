import { getItems } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';

import { Markdown } from './index';

export const name = 'Markdown';
export { Markdown as type };
export const exampleValue = 'foo';
export const exampleValue2 = 'bar';
export const supportsUnique = true;
export const fieldName = 'content';

export const getTestFields = () => {
  return {
    name: { type: Text },
    content: { type: Markdown },
  };
};

export const initItems = () => {
  return [
    { name: 'a', content: '**this is bold**' },
    { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
    { name: 'c', content: '~~Strike through~~' },
    { name: 'd', content: '**This is BOLD**' },
    { name: 'e', content: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name content',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', content: '**this is bold**' },
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', content: '**this is bold**' },
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Filter: content (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content: '**this is bold**' }, [{ name: 'a', content: '**this is bold**' }])
    )
  );

  test(
    'Filter: content (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_i: '**this is bold**' }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'd', content: '**This is BOLD**' },
      ])
    )
  );

  test(
    'Filter: content_not (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not: '**this is bold**' }, [
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Filter: content_not_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_i: '**this is bold**' }, [
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'e', content: null },
      ])
    )
  );
  test(
    'Filter: content_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not: null }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
      ])
    )
  );

  test(
    'Filter: content_in (case-sensitive, empty list)',
    withKeystone(({ keystone }) => match(keystone, { content_in: [] }, []))
  );

  test(
    'Filter: content_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_in: [] }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Filter: content_in',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          content_in: ['**this is bold**', 'This is a [link](https://keystonejs.com)'],
        },
        [
          { name: 'a', content: '**this is bold**' },
          { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        ]
      )
    )
  );

  test(
    'Filter: content_not_in',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          content_not_in: [null, '**this is bold**', 'This is a [link](https://keystonejs.com)'],
        },
        [
          { name: 'c', content: '~~Strike through~~' },
          { name: 'd', content: '**This is BOLD**' },
        ]
      )
    )
  );

  test(
    'Filter: content_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { content_in: [null] }, [{ name: 'e', content: null }])
    )
  );

  test(
    'Filter: content_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_in: [null] }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
      ])
    )
  );

  test(
    'Filter: content_contains (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_contains: 'bold' }, [{ name: 'a', content: '**this is bold**' }])
    )
  );
  test(
    'Filter: content_contains_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_contains_i: 'bold' }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'd', content: '**This is BOLD**' },
      ])
    )
  );

  test(
    'Filter: content_not_contains (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_contains: 'bold' }, [
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Filter: content_not_contains_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_contains_i: 'bold' }, [
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Filter: content_starts_with (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_starts_with: '**this' }, [
        { name: 'a', content: '**this is bold**' },
      ])
    )
  );

  test(
    'Filter: content_starts_with_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_starts_with_i: '**this' }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'd', content: '**This is BOLD**' },
      ])
    )
  );

  test(
    'Filter: content_not_starts_with (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_starts_with: '**This' }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'e', content: null },
      ])
    )
  );
  test(
    'Filter: content_not_starts_with_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_starts_with_i: '**This' }, [
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Filter: content_ends_with (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_ends_with: 'bold**' }, [{ name: 'a', content: '**this is bold**' }])
    )
  );

  test(
    'Filter: content_ends_with_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_ends_with_i: 'bold**' }, [
        { name: 'a', content: '**this is bold**' },
        { name: 'd', content: '**This is BOLD**' },
      ])
    )
  );
  test(
    'Filter: content_not_ends_with (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_ends_with: 'bold**' }, [
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'd', content: '**This is BOLD**' },
        { name: 'e', content: null },
      ])
    )
  );

  test(
    'Filter: content_not_ends_with_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { content_not_ends_with_i: 'bold**' }, [
        { name: 'b', content: 'This is a [link](https://keystonejs.com)' },
        { name: 'c', content: '~~Strike through~~' },
        { name: 'e', content: null },
      ])
    )
  );
};
