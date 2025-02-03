import {
  type ArrayField,
  type ConditionalField,
  fields,
} from '@keystone-6/fields-document/component-blocks'

const leafSelect = fields.select({
  defaultValue: 'leaf',
  label: 'Type',
  options: [
    { label: 'Leaf', value: 'leaf' },
    { label: 'Group', value: 'group' },
  ] as const,
})

export const schema: ArrayField<ConditionalField<typeof leafSelect>> = fields.array(
  fields.conditional(
    leafSelect,
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
