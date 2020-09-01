const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import { getItems } from '@keystonejs/server-side-graphql-client';

import { OEmbed, IframelyOEmbedAdapter } from './';

export const name = 'OEmbed';
export { OEmbed as type };
export const exampleValue = 'https://jestjs.io';
export const exampleValue2 = 'https://codesandbox.io';
export const supportsUnique = false;
export const fieldName = 'portfolio';
export const subfieldName = 'originalUrl';

const iframelyAdapter = new IframelyOEmbedAdapter({
  apiKey: process.env.IFRAMELY_API_KEY,
});

export const fieldConfig = { adapter: iframelyAdapter };

export const getTestFields = () => {
  return {
    name: { type: String },
    portfolio: { type: OEmbed, adapter: iframelyAdapter },
  };
};

export const initItems = () => {
  return [
    { name: 'a', portfolio: 'https://github.com' },
    { name: 'b', portfolio: 'https://keystonejs.com' },
    { name: 'c', portfolio: 'https://reactjs.org' },
    { name: 'd', portfolio: 'https://REACTJS.ORG' },
    { name: 'e', portfolio: null },
    { name: 'f' },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name portfolio { originalUrl }',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
        { name: 'e', portfolio: null },
        { name: 'f', portfolio: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
        { name: 'e', portfolio: null },
        { name: 'f', portfolio: null },
      ])
    )
  );

  test(
    'Filter: portfolio_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { portfolio_not: null }, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
      ])
    )
  );

  test(
    'Filter: portfolio_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { portfolio_not_in: [null] }, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
      ])
    )
  );

  test(
    'Filter: portfolio_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { portfolio_in: [] }, []))
  );

  test(
    'Filter: portfolio_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { portfolio_not_in: [] }, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
        { name: 'e', portfolio: null },
        { name: 'f', portfolio: null },
      ])
    )
  );
};
