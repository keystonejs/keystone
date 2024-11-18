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
      author: relationship({
        ref: 'Author',
      }),
      tags: relationship({
        ref: 'Tag.posts',
        many: true,
      }),
    },

    ui: {
      searchFields: [
        'author',
        'tags', // WARNING: results in searching by post.tags.name
                //   this is quite powerful, but may load your database
      ]
    }
  }),

  Author: list({
    // WARNING - for this example, anyone can create, query, update and delete anything
    access: allowAll,

    fields: {
      name: text({ validation: { isRequired: true } }),
    },

    ui: {
      searchFields: [
        'name',
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
