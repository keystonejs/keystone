import {
  fields,
} from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    label: 'Bundle',
    listKey: 'Post',
    many: true,
  }),
  {
    itemLabel: props => {
      return `${props.value?.map(v => v.label).join(',')}`
    },
  }
)
