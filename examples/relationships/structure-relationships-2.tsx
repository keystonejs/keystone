import { fields } from '@keystone-6/fields-document/component-blocks'

export const schema = fields.array(
  fields.relationship({
    listKey: 'Post',
    label: 'Bundle',
    description: 'What posts do you want to bundle with this post?',
    many: true,
    sort: { field: 'title', direction: 'ASC' },
    filter: {
      hidden: { equals: false },
    },
  }),
  {
    itemLabel: props => {
      return `${props.value?.map(v => v.label).join(',')}`
    },
  }
)
