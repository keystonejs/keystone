import { componentThing } from '../../component';
import { ArrayField, ComponentSchemaForGraphQL, fields } from '../../component-blocks';

export const name = 'NEEDS A NAME';
export const typeFunction = componentThing;
export const exampleValue = () => [
  {
    leaf: {
      label: 'Keystone',
      url: 'https://keystonejs.com',
    },
  },
  {
    group: {
      label: 'Docs',
      children: [
        { leaf: { label: 'GraphQL API', url: 'https://keystonejs.com/docs/apis/graphql' } },
        {
          group: {
            label: 'Fields',
            children: [
              { leaf: { label: 'Text', url: 'https://keystonejs.com/docs/apis/fields#text' } },
            ],
          },
        },
      ],
    },
  },
];
export const createReturnedValue = () => [
  {
    discriminant: 'leaf',
    value: { label: 'Keystone', url: 'https://keystonejs.com' },
  },
  {
    discriminant: 'group',
    value: {
      label: 'Docs',
      children: [
        {
          discriminant: 'leaf',
          value: { label: 'GraphQL API', url: 'https://keystonejs.com/docs/apis/graphql' },
        },
        {
          discriminant: 'group',
          value: {
            label: 'Fields',
            children: [
              {
                discriminant: 'leaf',
                value: { label: 'Text', url: 'https://keystonejs.com/docs/apis/fields#text' },
              },
            ],
          },
        },
      ],
    },
  },
];
export const exampleValue2 = () => [
  {
    leaf: {
      label: 'Keystone',
      url: 'https://keystonejs.com',
    },
  },
];
export const updateReturnedValue = () => [
  {
    discriminant: 'leaf',
    value: {
      label: 'Keystone',
      url: 'https://keystonejs.com',
    },
  },
];

export const neverNull = true;
export const supportsUnique = false;
export const skipRequiredTest = true;
export const supportsDbMap = true;
export const fieldName = 'content';
export const readFieldName = 'contentRaw';

const schema: ArrayField<ComponentSchemaForGraphQL> = fields.array(
  fields.conditional(
    fields.select({
      defaultValue: 'leaf',
      label: 'Type',
      options: [
        { label: 'Leaf', value: 'leaf' },
        { label: 'Group', value: 'group' },
      ],
    }),
    {
      leaf: fields.object({
        label: fields.text({ label: 'Label' }),
        url: fields.url({ label: 'URL' }),
      }),
      group: fields.object({
        label: fields.text({ label: 'Label' }),
        get children() {
          return schema;
        },
      }),
    }
  )
);

export const getTestFields = () => ({ content: componentThing(fieldConfig()) });
export const fieldConfig = () => ({
  schema,
});

export const initItems = () => [
  { name: 'a', content: [] },
  {
    name: 'b',
    content: [{ leaf: { label: 'Keystone', url: 'https://keystonejs.com' } }],
  },
  {
    name: 'c',
    content: [
      { leaf: { label: 'Keystone', url: 'https://keystonejs.com' } },
      {
        group: {
          label: 'Docs',
          children: [
            { leaf: { label: 'GraphQL API', url: 'https://keystonejs.com/docs/apis/graphql' } },
            {
              group: {
                label: 'Fields',
                children: [
                  { leaf: { label: 'Text', url: 'https://keystonejs.com/docs/apis/fields#text' } },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  {
    name: 'd',
    content: [{ group: { label: 'Something' } }],
  },
  {
    name: 'e',
    content: [{ group: { label: 'Outer', children: [{ group: { label: 'Inner' } }] } }],
  },
  { name: 'f' },
  { name: 'g' },
];

export const storedValues = () => [
  { name: 'a', contentRaw: [] },
  {
    name: 'b',
    contentRaw: [
      { discriminant: 'leaf', value: { label: 'Keystone', url: 'https://keystonejs.com' } },
    ],
  },
  {
    name: 'c',
    contentRaw: [
      { discriminant: 'leaf', value: { label: 'Keystone', url: 'https://keystonejs.com' } },
      {
        discriminant: 'group',
        value: {
          label: 'Docs',
          children: [
            {
              discriminant: 'leaf',
              value: { label: 'GraphQL API', url: 'https://keystonejs.com/docs/apis/graphql' },
            },
            {
              discriminant: 'group',
              value: {
                label: 'Fields',
                children: [
                  {
                    discriminant: 'leaf',
                    value: { label: 'Text', url: 'https://keystonejs.com/docs/apis/fields#text' },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  {
    name: 'd',
    contentRaw: [{ discriminant: 'group', value: { label: 'Something', children: [] } }],
  },
  {
    name: 'e',
    contentRaw: [
      {
        discriminant: 'group',
        value: {
          label: 'Outer',
          children: [{ discriminant: 'group', value: { label: 'Inner', children: [] } }],
        },
      },
    ],
  },
  { name: 'f', contentRaw: [] },
  { name: 'g', contentRaw: [] },
];

export const supportedFilters = () => [];
