import { list, action, g } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { checkbox, integer, text, timestamp } from '@keystone-6/core/fields'

import type { Lists } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

const readOnly = {
  access: {
    read: { item: allowAll, filter: denyAll, order: denyAll },
    create: denyAll,
    update: denyAll,
  },
  graphql: {
    omit: {
      create: true,
      update: true,
    },
  },
  ui: {
    createView: {
      fieldMode: 'hidden' as const,
    },
    itemView: {
      fieldMode: 'read' as const,
      fieldPosition: 'sidebar' as const,
    },
  },
}

const isReportDisabled = {
  OR: [{ hidden: { equals: true } }, { reportedAt: { not: { equals: null } } }],
} as const

export const lists = {
  Post: list({
    access: allowAll, // WARNING: public

    fields: {
      title: text(),
      content: text(),
      hidden: checkbox({
        ui: {
          itemView: {
            fieldMode: ({ item, itemField }) => {
              // WARNING: none of this is access control
              if (!item || item.votes === null) return 'edit'
              if (itemField) return 'edit'
              return item.votes > 0 ? 'read' : 'edit'
            },
          },
        },
      }),
      votes: integer({ defaultValue: 0, ...readOnly }),
      reportedAt: timestamp({ ...readOnly }),
    },
    actions: {
      vote: action({
        access: ({ context }) => {
          const ua = context.req?.headers['user-agent'] ?? ''
          // only allow voting from Chrome browsers
          return ua.includes('Chrome')
        },
        // with navigation: 'follow', null redirects to the list view, otherwise to the item view {with the returned item id}
        async resolve({ actionKey, where }, context) {
          console.log(`${actionKey}`, JSON.stringify({ where }))
          if (!where) return null
          if (typeof where.id !== 'string') return null // TODO: FIXME: { increment } support for context.db?

          // WARNING: prisma bypasses access control, be wary of this
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
            actionMode: { disabled: { hidden: { equals: true } } },
            hidePrompt: true,
          },
          listView: {
            actionMode: 'hidden',
          },
        },
      }),
      report: action({
        access: allowAll,
        async resolve({ actionKey, where }, context) {
          console.log(`${actionKey}`, JSON.stringify({ where }))
          // throw new Error('Random failure, try again')

          // WARNING: bypasses access control for the reportedAt field, be wary of this
          return await context.sudo().db.Post.updateOne({
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
            fail: 'Could not report {singular} “{itemLabel}”',
            failMany: 'Could not report {countFail} {singular|plural}',
            success: '{Singular} reported',
            successMany: 'Successfully reported {countSuccess} {singular|plural}',
          },
          itemView: {
            actionMode: { disabled: isReportDisabled },
            navigation: 'refetch',
            hideToast: true,
          },
          listView: {
            actionMode: { disabled: isReportDisabled },
          },
        },
      }),
      hideWithReason: action({
        access: allowAll,
        args: {
          reason: {
            graphql: g.arg({ type: g.nonNull(g.String) }),
            ui: {
              source: {
                field: text({
                  validation: { isRequired: true },
                  ui: {
                    label: 'Reason',
                    description: 'This is collected for the action only, not stored on the post.',
                    displayMode: 'textarea',
                  },
                }),
              },
            },
          },
        },
        async resolve({ actionKey, where, args }, context) {
          console.log(`${actionKey}`, JSON.stringify({ where, reason: args.reason }))

          return await context.sudo().db.Post.updateOne({
            where,
            data: {
              hidden: true,
            },
          })
        },
        ui: {
          label: 'Hide with reason',
          icon: 'eyeOffIcon',
          messages: {
            promptTitle: 'Hide {singular}',
            promptTitleMany: 'Hide {count} {singular|plural}',
            prompt: 'Provide a reason before hiding “{itemLabel}”.',
            promptMany: 'Provide a reason before hiding {count} {singular|plural}.',
            promptConfirmLabel: 'Hide',
            promptConfirmLabelMany: 'Hide {count} {singular|plural}',
            success: '{Singular} hidden',
            successMany: 'Successfully hid {countSuccess} {singular|plural}',
          },
          itemView: {
            actionMode: { disabled: { hidden: { equals: true } } },
            navigation: 'refetch',
          },
          listView: {
            actionMode: { disabled: { hidden: { equals: true } } },
          },
        },
      }),
    },
    ui: {
      listView: {
        initialFilter: {
          hidden: { equals: false },
        },
        initialSort: { field: 'votes', direction: 'DESC' },
      },
    },
  }),
} satisfies Lists
