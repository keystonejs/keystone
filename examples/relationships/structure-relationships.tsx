import { fields } from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    listKey: 'Post',
    label: 'Recommended Post',
    description: 'What posts do you recommend?',
  }),
  {
    itemLabel: props => {
      return `${props.value?.label}`
    },
  }
)
