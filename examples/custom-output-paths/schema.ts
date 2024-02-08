import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, timestamp } from '@keystone-6/core/fields'
import type { Lists } from './my-types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      publishDate: timestamp(),
    },

    hooks: {
      afterOperation: async ({ context }) => {
        const posts = (await context.db.Post.findMany({
          where: {
            title: { equals: 'Home' },
          },

          // we use Typescript's satisfies here as way to ensure that
          //   this is the contextualised type - you don't need this
          //
          //   it is helpful for us to check that the example is not
          //   broken by code changes
          //

          // TODO: FIXME, babel and pnpm issues
        })) as readonly { title: string, content: string }[]
        // })) satisfies readonly { title: string; content: string }[];

        console.log(posts)
      },
    },
  }),
} satisfies Lists
