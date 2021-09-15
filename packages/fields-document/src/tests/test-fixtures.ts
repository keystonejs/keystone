import { document } from '..';

export const name = 'Document';
export const typeFunction = document;
export const exampleValue = () => [{ type: 'paragraph', children: [{ text: '' }] }];
export const exampleValue2 = () => [
  { type: 'heading', children: [{ text: 'heading' }], level: 1 },
  { type: 'paragraph', children: [{ text: '' }] },
];
export const updateReturnedValue = [
  { type: 'paragraph', children: [{ text: 'heading' }] },
  { type: 'paragraph', children: [{ text: '' }] },
];

export const supportsUnique = false;
export const skipRequiredTest = true;
export const fieldName = 'content';
export const subfieldName = 'document';

export const getTestFields = () => ({ content: document() });

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
    { name: 'e', content: [{ type: 'paragraph', children: [{ text: '' }] }] },
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
        { type: 'paragraph', children: [{ text: 'heading' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
    },
  },
  {
    name: 'c',
    content: {
      document: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
    },
  },
  {
    name: 'd',
    content: { document: [{ type: 'paragraph', children: [{ text: 'text' }] }] },
  },
  { name: 'e', content: { document: [{ type: 'paragraph', children: [{ text: '' }] }] } },
  { name: 'f', content: { document: [{ type: 'paragraph', children: [{ text: '' }] }] } },
  { name: 'g', content: { document: [{ type: 'paragraph', children: [{ text: '' }] }] } },
];

export const supportedFilters = () => [];
