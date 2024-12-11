import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, relationship } from '@keystone-6/core/fields'
import { structure } from '@keystone-6/fields-document'
import type { Lists } from '.keystone/types'

import { schema as inlineRelationships } from './inline-relationships'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({
        validation: { isRequired: true },
        db: { isNullable: false },
        graphql: { isNonNull: { create: true, update: true } },
      }),
      related: relationship({
        ref: 'Post',
        many: true
      }),
      inlineRelationships: structure({
        schema: inlineRelationships,
        ui: {
          views: './inline-relationships',
        }
      }),
    },
  }),
} satisfies Lists
