const { Text } = require('@keystone-next/fields-legacy');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { OEmbed, IframelyOEmbedAdapter } from './';

export const name = 'OEmbed';
export const type = OEmbed;
export const exampleValue = () => 'https://jestjs.io';
export const exampleValue2 = () => 'https://codesandbox.io';
export const supportsUnique = false;
export const fieldName = 'portfolio';
export const subfieldName = 'originalUrl';
export const unSupportedAdapterList = ['prisma_sqlite'];

const iframelyAdapter = new IframelyOEmbedAdapter({
  apiKey: process.env.IFRAMELY_API_KEY || 'iframely_api_key',
});

export const fieldConfig = () => ({ adapter: iframelyAdapter });

export const getTestFields = () => ({
  name: { type: Text },
  portfolio: { type, adapter: iframelyAdapter },
});

export const initItems = () => {
  return [
    { name: 'a', portfolio: 'https://github.com' },
    { name: 'b', portfolio: 'https://keystonejs.com' },
    { name: 'c', portfolio: 'https://reactjs.org' },
    { name: 'd', portfolio: 'https://REACTJS.ORG' },
    { name: 'e', portfolio: 'https://google.com' },
    { name: 'f', portfolio: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
  { name: 'b', portfolio: { originalUrl: 'https://keystonejs.com' } },
  { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
  { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
  { name: 'e', portfolio: { originalUrl: 'https://google.com' } },
  { name: 'f', portfolio: null },
  { name: 'g', portfolio: null },
];

export const supportedFilters = adapterName => [
  'null_equality',
  !['prisma_postgresql'].includes(adapterName) && 'in_empty_null',
];
