import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { integer, text, timestamp } from '@keystone-6/core/fields'

import type { Context, Lists } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

export const lists = {
  Post: list({
    access: allowAll, // WARNING: public
    fields: {
      title: text(),
      content: text(),
      votes: integer({ defaultValue: 0 }),
      reportedAt: timestamp({
        ui: {
          itemView: {
            fieldMode: 'read' as const, // WARNING: this is not access control
            fieldPosition: 'sidebar' as const,
          },
        },
      }),
    },
    actions: {
      vote: {
        access: ({ context }) => {
          const ua = context.req?.headers['user-agent'] ?? ''
          // only allow voting from Chrome browsers
          return ua.includes('Chrome')
        },
        // with navigation: 'follow', null redirects to the list view, otherwise to the item view {with the returned item id}
        async resolve(context: Context, { actionKey, where }) {
          console.log(`${actionKey}`, JSON.stringify({ where }))
          if (!where) return null
          if (typeof where.id !== 'string') return null // TODO: FIXME: { increment } support for context.db?
          return await context.prisma.post.update({
            where: { id: where.id },
            data: {
              votes: {
                increment: 1,
              },
            },
          })
        },
        ui: {
          label: 'Vote +1',
          icon: 'voteIcon',
          messages: {
            success: 'Voted for {itemLabel}',
            successMany: 'Voted for {countSuccess} {singular|plural}',
          },
          itemView: {
            hidePrompt: true,
          },
          listView: {
            actionMode: 'hidden',
          },
        },
      },
      report: {
        access: allowAll,
        async resolve(context: Context, { actionKey, where }) {
          console.log(`${actionKey}`, JSON.stringify({ where }))
          return await context.db.Post.updateOne({
            where,
            data: {
              reportedAt: new Date(),
            },
          })
        },
        graphql: {
          singular: 'reportAPost', // optional, defaults to 'reportPost'
          plural: 'reportSomePosts', // optional, defaults to 'reportPosts'
        },
        ui: {
          label: 'Report',
          icon: 'flagIcon',
          messages: {
            promptTitle: 'Report {singular}',
            promptTitleMany: 'Report {count} {singular|plural}',
            prompt: 'Are you sure you want to report “{itemLabel}”?',
            promptMany: 'Are you sure you want to report {count} {singular|plural}?',
            promptConfirmLabel: 'Yes, report',
            promptConfirmLabelMany: 'Yes, report {count} {singular|plural}',
            fail: 'Could not report {singular}',
            failMany: 'Could not report {countFail} {singular|plural}',
            success: '{Singular} reported',
            successMany: 'Successfully reported {countSuccess} {singular|plural}',
          },
          itemView: {
            actionMode: () => 'enabled',
            navigation: 'refetch',
            hideToast: true,
          },
          listView: {
            actionMode: 'enabled',
          },
        },
      },
    },
  }),
} satisfies Lists
