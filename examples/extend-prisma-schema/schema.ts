import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

import { type Lists } from '.keystone/types'

export const lists = {
  Author: list({
    access: allowAll,
    fields: {
      firstName: text(),
      lastName: text(),
    },
    db: {
      extendPrismaSchema: schema => {
        // add a (poor) example of a multi-column unique constraint
        return schema.replace(/(model [^}]+)}/g, '$1@@unique([firstName, lastName])\n}')
      },
    },
  }),
  Post: list({
    access: allowAll,
    fields: {
      title: text(),
      content: text(),
      author: relationship({ ref: 'Author' }),
      tags: relationship({
        ref: 'Tag.posts',
        db: {
          extendPrismaSchema: field => {
            // change relationship to enforce NOT NULL
            //   WARNING: this won't be easy to use, but if you know what you're doing...
            return field
              .replace(/tags Tag\?/g, 'tags Tag')
              .replace(/tagsId String\?/g, 'tagsId String')
          },
        },
      }),
    },
  }),
  Tag: list({
    access: allowAll,
    fields: {
      name: text(),
      posts: relationship({
        ref: 'Post.tags',
        many: true,
      }),
    },
  }),
} satisfies Lists
