/** @jsxRuntime classic */
/** @jsx jsx */

import {
  fields,
  ArrayField,
  ConditionalField,
  ObjectField,
} from '@keystone-6/fields-document/component-blocks';

const label = fields.text({ label: 'Label' });

const leaf = fields.object({
  url: fields.url({ label: 'URL' }),
  label,
});

const discriminant = fields.select({
  label: 'Type',
  options: [
    { label: 'Group', value: 'group' },
    { label: 'Leaf', value: 'leaf' },
  ] as const,
  defaultValue: 'leaf',
});

type Prop = ArrayField<
  ConditionalField<
    typeof discriminant,
    { leaf: typeof leaf; group: ObjectField<{ label: typeof label; children: Prop }> }
  >
>;

export const prop: Prop = fields.array(
  fields.conditional(discriminant, {
    leaf,
    group: fields.object({
      label,
      get children() {
        return prop;
      },
    }),
  })
);
