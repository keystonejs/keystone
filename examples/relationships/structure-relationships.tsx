import {
  fields,
} from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    label: 'Recommended Post',
    listKey: 'Post',
  }),
  {
    itemLabel: props => {
      return `${props.value?.label}`
    },
  }
)
