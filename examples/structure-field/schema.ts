import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { structure } from '@keystone-6/fields-document'
import { allowAll } from '@keystone-6/core/access'

import type { Lists } from '.keystone/types'
import { schema } from './featured-posts'

export const lists = {
  Homepage: list({
    isSingleton: true,
    access: allowAll,
    fields: {
      metadata: structure({
        schema,
        ui: { views: './featured-posts.ts' },
      }),
    },
  }),
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
    },
  }),
} satisfies Lists
