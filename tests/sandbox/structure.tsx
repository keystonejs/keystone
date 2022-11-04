import { ComponentSchemaForGraphQL, fields } from '@keystone-6/fields-document/component-blocks';

export const schema: ComponentSchemaForGraphQL = fields.array(
  fields.conditional(
    fields.select({
      defaultValue: 'leaf',
      label: 'Type',
      options: [
        { label: 'Leaf', value: 'leaf' },
        { label: 'Group', value: 'group' },
      ] as const,
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
  ),
  { label: props => props.value.fields.label.value }
);
