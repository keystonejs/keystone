import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
    },
    graphql: {
      // enforce that only 20 posts can be retrieved in a Query
      //   this additionally defaults the GraphQL schema 'take' value to 20
      maxTake: 20,
    },
  }),
} satisfies Lists
