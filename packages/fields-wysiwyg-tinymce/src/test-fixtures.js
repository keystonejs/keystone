import { Text } from '@keystonejs/fields';

import { Wysiwyg } from './';

export const name = 'Wysiwyg';
export const type = Wysiwyg;
export const exampleValue = () => 'foo';
export const exampleValue2 = () => '<p><strong>This is BOLD</strong></p>';
export const supportsUnique = true;
export const fieldName = 'content';

export const getTestFields = () => ({ name: { type: Text }, content: { type } });

const contentA = '';
const contentB = '<p>This is content B</p>';
const contentC = 'FOOBAR';
const contentD = 'fooBAR';
const contentE = 'foobar';

export const initItems = () => {
  return [
    { name: 'a', content: contentA },
    { name: 'b', content: contentB },
    { name: 'c', content: contentC },
    { name: 'd', content: contentD },
    { name: 'e', content: contentE },
    { name: 'f', content: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', content: contentA },
  { name: 'b', content: contentB },
  { name: 'c', content: contentC },
  { name: 'd', content: contentD },
  { name: 'e', content: contentE },
  { name: 'f', content: null },
  { name: 'g', content: null },
];

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'equality_case_insensitive',
  'in_empty_null',
  'in_equal',
  'string',
  'string_case_insensitive',
];
