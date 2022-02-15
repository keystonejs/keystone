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
        label2: fields.text({ label: 'Label2' }),
        label3: fields.text({ label: 'Label3' }),
        label4: fields.text({ label: 'Label4' }),
        label5: fields.text({ label: 'Label5' }),
        label6: fields.text({ label: 'Label6' }),
        label7: fields.text({ label: 'Label7' }),
      }),
      group: fields.object({
        label: fields.text({ label: 'Label' }),
      }),
    }
  )
);
