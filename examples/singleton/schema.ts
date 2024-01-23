import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { relationship, text, timestamp } from '@keystone-6/core/fields'

import type { Lists } from '.keystone/types'

export const lists = {
  Settings: list({
    access: allowAll,
    isSingleton: true,
    fields: {
      websiteName: text(),
      copyrightText: text(),
      highlightedPosts: relationship({ ref: 'Post', many: true }),
    },
    graphql: {
      plural: 'ManySettings',
    },
  }),
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      publishDate: timestamp(),
    },
  }),
} satisfies Lists
