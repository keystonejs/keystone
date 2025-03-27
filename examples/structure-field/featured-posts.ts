import { fields } from '@keystone-6/fields-document/component-blocks'

export const schema = fields.object({
  featuredPosts: fields.relationship({ listKey: 'Post', label: 'Featured Posts', many: true }),
})
