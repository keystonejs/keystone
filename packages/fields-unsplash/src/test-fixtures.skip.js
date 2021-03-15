const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import { Text } from '@keystone-next/fields-legacy';
import { Unsplash } from './';

// Field configurations
export const name = 'Unsplash';
export const type = Unsplash;
export const supportsUnique = false;
export const exampleValue = () => 'U0tBTn8UR8I';
export const exampleValue2 = () => 'xrVDYZRGdw4';
export const fieldName = 'heroImage';
export const subfieldName = 'unsplashId';
export const fieldConfig = () => ({
  accessKey: process.env.UNSPLASH_KEY || 'unsplash_key',
  secretKey: process.env.UNSPLASH_SECRET || 'unplash_secret',
});

export const getTestFields = () => ({
  name: { type: Text },
  heroImage: {
    type,
    accessKey: process.env.UNSPLASH_KEY || 'unsplash_key',
    secretKey: process.env.UNSPLASH_SECRET || 'unplash_secret',
  },
});

export const initItems = () => {
  return [
    { name: 'a', heroImage: 'dYEuFB8KQJk' },
    { name: 'b', heroImage: '95YRwf6CNw8' },
    { name: 'c', heroImage: 'U0tBTn8UR8I' },
    { name: 'd', heroImage: 'xrVDYZRGdw4' },
    { name: 'e', heroImage: 'dYEuFB8KQJk' },
    { name: 'f', heroImage: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', heroImage: { unsplashId: 'dYEuFB8KQJk' } },
  { name: 'b', heroImage: { unsplashId: '95YRwf6CNw8' } },
  { name: 'c', heroImage: { unsplashId: 'U0tBTn8UR8I' } },
  { name: 'd', heroImage: { unsplashId: 'xrVDYZRGdw4' } },
  { name: 'e', heroImage: { unsplashId: 'dYEuFB8KQJk' } },
  { name: 'f', heroImage: null },
  { name: 'g', heroImage: null },
];

export const supportedFilters = adapterName => [
  'null_equality',
  !['prisma_postgresql', 'prisma_sqlite'].includes(adapterName) && 'in_empty_null',
];
