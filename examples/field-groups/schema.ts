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
        fields: {
          slug: text({
            access: {
              read: allowAll,
              create: denyAll,
              update: denyAll,
            },
            // for this example, we are going to use a hook for fun
            //  defaultValue: { kind: 'now' }
            hooks: {
              resolveInput: {
                create: ({ context, operation, resolvedData }) => {
                  // TODO: text should allow you to prevent a defaultValue, then Prisma create could be non-null
                  return resolvedData.title?.replace(/ /g, '-').toLowerCase()                  
                },                
              }
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
