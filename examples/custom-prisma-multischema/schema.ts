import { list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';
import { Lists } from '.keystone/types';

export const lists: Lists = {
  Author: list({
    access: allowAll,
    fields: {
      firstName: text(),
      lastName: text(),
    },
    db: {
      extendPrismaList: (schema) => {
        return schema
          .replace(/(model [^}]+)}/g, '$1@@unique([firstName, lastName])\n}')
      }
    }
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
          extendPrismaField: (field) => {
            // change relationship to enforce NOT NULL
            return field
              .replace(/tags Tag\?/g, 'tags Tag')
              .replace(/tagsId String\?/g, 'tagsId String')
          }
        }
      })
    }
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
};
