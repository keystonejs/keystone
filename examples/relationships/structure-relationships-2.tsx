import { fields } from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    listKey: 'Post',
    label: 'Bundle',
    description: 'What posts should be bundled with this post',
    many: true,
  }),
  {
    itemLabel: props => {
      return `${props.value?.map(v => v.label).join(',')}`
    },
  }
)
