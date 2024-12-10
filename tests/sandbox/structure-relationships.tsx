import {
  fields,
} from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    label: 'My things',
    listKey: 'Thing',
    many: false,
  }),
  {
    itemLabel: props => {
      return `${props.value?.label}`
    },
  }
)
