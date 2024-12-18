import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, relationship } from '@keystone-6/core/fields'
import { structure } from '@keystone-6/fields-document'
import type { Lists } from '.keystone/types'

import { schema as recommendationsStructureSchema } from './structure-relationships'
import { schema as bundlesStructureSchema } from './structure-relationships-2'

export const lists = {
  Post: list({
    access: allowAll, // WARNING: public
    fields: {
      title: text({
        validation: { isRequired: true },
      }),

      category: relationship({
        ref: 'Category.posts',
        many: true, // a Post can have one Category
      }),

      // with this field, you can add some Tags to Posts
      tags: relationship({
        ref: 'Tag.posts',
        many: true, // a Post can have many Tags, not just one
        ui: {
          hideCreate: true
        }
      }),

      related: relationship({
        ref: 'Post',
        many: true,
        ui: {
          hideCreate: true
        }
      }),

      recommendations: structure({
        schema: recommendationsStructureSchema,
        ui: {
          views: './structure-relationships',
        }
      }),

      bundles: structure({
        schema: bundlesStructureSchema,
        ui: {
          views: './structure-relationships-2',
        }
      }),
    },
  }),

  Category: list({
    access: allowAll, // WARNING: public

    // dont show this list in the AdminUI
    ui: {
      hideNavigation: true,
    },

    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.category', many: true }),
    },
  }),

  Tag: list({
    access: allowAll, // WARNING: public

    // dont show this list in the AdminUI
    ui: {
      hideNavigation: true,
    },

    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
} satisfies Lists
