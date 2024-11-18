import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

import { text, relationship } from '@keystone-6/core/fields'
import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    // WARNING - for this example, anyone can create, query, update and delete anything
    access: allowAll,

    fields: {
      title: text({ validation: { isRequired: true } }),
      tags: relationship({
        ref: 'Tag.posts',
        many: true,
      }),
    },

    ui: {
      searchFields: [
        'tags',
      ]
    }
  }),

  Tag: list({
    // WARNING - for this example, anyone can create, query, update and delete anything
    access: allowAll,

    fields: {
      name: text({ validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },

    ui: {
      searchFields: [
        'name',
      ]
    }
  }),
} satisfies Lists
