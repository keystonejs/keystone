import {
  fields,
} from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    label: 'Related posts',
    listKey: 'Post',
//             many: false,
  }),
  {
    itemLabel: props => {
      return `${props.value?.label}`
    },
  }
)
