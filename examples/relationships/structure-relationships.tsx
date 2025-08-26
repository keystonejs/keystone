import { fields } from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    listKey: 'Post',
    label: 'Recommended Post',
    description: 'What posts do you recommend?',
    filter: {
      relatable: { equals: true },
      hidden: { equals: false }
    },
  }),
  {
    itemLabel: props => {
      return `${props.value?.label}`
    },
  }
)
