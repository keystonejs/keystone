import {
  type ArrayField,
  type ComponentSchemaForGraphQL,
  fields,
} from '@keystone-6/fields-document/component-blocks'

export const schema: ArrayField<ComponentSchemaForGraphQL> = fields.array(
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
        get children () {
          return schema
        },
      }),
    }
  ),
  {
    itemLabel: props =>
      `${
        props.schema.discriminant.options.find(option => props.discriminant === option.value)?.label
      } - ${props.value.fields.label.value}${
        props.discriminant === 'group'
          ? ` (${props.value.fields.children.elements.length} Items)`
          : ''
      }`,
  }
)
