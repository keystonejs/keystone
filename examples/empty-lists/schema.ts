import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { relationship, text } from '@keystone-6/core/fields'
import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      description: text({ validation: { isRequired: true } }),
      groups: relationship({ ref: 'Group', many: true })
    },
  }),
  Group: list({
    access: allowAll,
    fields: {
    },
  }),
} satisfies Lists
