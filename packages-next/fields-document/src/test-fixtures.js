import { Text } from '@keystone-next/fields-legacy';
import { DocumentFieldType } from './base-field-type';

export const name = 'Document';
export const type = DocumentFieldType;
export const exampleValue = () => [{ type: 'paragraph', children: [{ text: '' }] }];
export const exampleValue2 = () => [
  { type: 'heading', children: [{ text: 'heading' }], level: 1 },
  { type: 'paragraph', children: [{ text: '' }] },
];
export const supportsUnique = false;
export const fieldName = 'content';
export const subfieldName = 'document';
export const unSupportedAdapterList = ['prisma_sqlite'];

export const fieldConfig = () => ({ ___validateAndNormalize: x => x });

export const getTestFields = () => ({
  name: { type: Text },
  content: { type, ___validateAndNormalize: x => x },
});

export const initItems = () => {
  return [
    { name: 'a', content: [{ type: 'paragraph', children: [{ text: '' }] }] },
    {
      name: 'b',
      content: [
        { type: 'heading', children: [{ text: 'heading' }], level: 1 },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
    },
    {
      name: 'c',
      content: [
        { type: 'blockquote', children: [{ type: 'paragraph', children: [{ text: '' }] }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
    },
    {
      name: 'd',
      content: [{ type: 'paragraph', children: [{ text: 'text' }] }],
    },
    { name: 'e', content: null },
    { name: 'f' },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', content: { document: [{ type: 'paragraph', children: [{ text: '' }] }] } },
  {
    name: 'b',
    content: {
      document: [
        { type: 'heading', children: [{ text: 'heading' }], level: 1 },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
    },
  },
  {
    name: 'c',
    content: {
      document: [
        { type: 'blockquote', children: [{ type: 'paragraph', children: [{ text: '' }] }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
    },
  },
  {
    name: 'd',
    content: { document: [{ type: 'paragraph', children: [{ text: 'text' }] }] },
  },
  { name: 'e', content: null },
  { name: 'f', content: null },
  { name: 'g', content: null },
];

export const supportedFilters = () => [];
