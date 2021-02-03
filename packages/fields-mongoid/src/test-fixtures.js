import { Text } from '@keystonejs/fields';

import { MongoId } from './index';

export const name = 'MongoId';
export const type = MongoId;
export const exampleValue = () => '123456781234567812345678';
export const exampleValue2 = () => '123456781234567812345679';
export const supportsUnique = true;
export const fieldName = 'oldId';

export const getTestFields = () => ({ name: { type: Text }, oldId: { type } });

export const initItems = () => {
  return [
    { name: 'a', oldId: '123456781234567812345678' },
    { name: 'b', oldId: '123456781234567812345687' },
    { name: 'c', oldId: '6162636465666768696a6b6c' },
    { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
    { name: 'e', oldId: '6d6a6867666c6b73656c6b76' },
    { name: 'f', oldId: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', oldId: '123456781234567812345678' },
  { name: 'b', oldId: '123456781234567812345687' },
  { name: 'c', oldId: '6162636465666768696a6b6c' },
  { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
  { name: 'e', oldId: '6d6a6867666c6b73656c6b76' },
  { name: 'f', oldId: null },
  { name: 'g', oldId: null },
];

export const supportedFilters = () => ['null_equality', 'equality', 'in_empty_null', 'in_equal'];
