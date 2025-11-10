import { list } from '@keystone-6/core'
import { select, relationship, text, timestamp } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { allowAll } from '@keystone-6/core/access'

import type { Lists } from '.keystone/types'
import { componentBlocks } from './component-blocks'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: document({
        formatting: true,
        dividers: true,
        links: true,
        componentBlocks,
        ui: { views: './component-blocks' },
      }),
    },
  }),
  DynamicComponent: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      content: document({
        formatting: true,
        dividers: true,
        links: true,
      }),
    },
  }),
} satisfies Lists
