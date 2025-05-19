import { list } from '@keystone-6/core'
import { select, relationship, text, timestamp } from '@keystone-6/core/fields'
import { content } from '@keystone-6/fields-content'
import { allowAll } from '@keystone-6/core/access'

import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      slug: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      status: select({
        type: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: content({
        ui: {
          views: './components.tsx',
        },
      }),
      publishDate: timestamp(),
    },
  }),
} satisfies Lists
