/** @jsxRuntime classic */
/** @jsx jsx */

import { fields } from '@keystone-6/fields-document/component-blocks';

export const prop = fields.array(
  fields.conditional(
    fields.select({
      label: 'Type',
      options: [
        { label: 'Group', value: 'group' },
        { label: 'Leaf', value: 'leaf' },
      ] as const,
      defaultValue: 'leaf',
    }),
    {
      leaf: fields.object({
        url: fields.url({ label: 'URL' }),
        label: fields.text({ label: 'Label' }),
      }),
      group: fields.object({
        label: fields.text({ label: 'Label' }),
      }),
    }
  )
);
