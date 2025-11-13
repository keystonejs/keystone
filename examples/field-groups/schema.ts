import { list, group } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({
        validation: { isRequired: true },
        db: { isNullable: false },
        graphql: { isNonNull: { create: true, update: true } },
      }),
      ...group({
        label: 'Meta',
        description: 'Some automatically updated meta fields',
        ui: {
          createView: {
            defaultFieldMode: 'hidden',
          },
          itemView: {
            defaultFieldMode: 'read',
          },
        },
        fields: {
          slug: text({
            access: {
              read: allowAll,
              create: denyAll,
              update: denyAll,
            },
            graphql: {
              omit: {
                create: true,
                update: true,
              },
            },
            hooks: {
              resolveInput: ({ context, operation, resolvedData }) => {
                if (typeof resolvedData.title !== 'string') return undefined // TODO: remove this
                return resolvedData.title?.replace(/ /g, '-').toLowerCase()
              },
            },
          }),
        },
      }),

      content: text({
        db: {
          isNullable: true,
        },
      }),
    },
  }),
} satisfies Lists
