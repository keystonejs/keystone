/** @jsxRuntime classic */
/** @jsx jsx */

import {
  fields,
  ArrayField,
  ComponentPropFieldForGraphQL,
} from '@keystone-6/fields-document/component-blocks';

export const prop: ArrayField<ComponentPropFieldForGraphQL> = fields.array(
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
          return prop;
        },
      }),
    }
  )
);
