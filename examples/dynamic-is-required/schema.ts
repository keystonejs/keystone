import type { Lists } from '.keystone/types'
import { action, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, relationship, select, text } from '@keystone-6/core/fields'

const hasHighPriority = {
  priority: { equals: 'high' },
  open: { equals: true },
} as const

export const lists = {
  Issue: list({
    access: allowAll,
    ui: {
      itemView: {
        defaultFieldMode: ({ item }) => (item?.open ? 'edit' : 'read'),
      },
    },
    fields: {
      label: text({ validation: { isRequired: true } }),
      description: text(),
      priority: select({
        type: 'enum',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      }),
      reasonForHighPriority: text({
        ui: {
          createView: {
            isRequired: hasHighPriority,
            fieldMode: {
              hidden: {
                NOT: hasHighPriority,
              },
            },
          },
          itemView: {
            isRequired: hasHighPriority,
            fieldMode: {
              hidden: {
                NOT: hasHighPriority,
              },
            },
          },
        },
        hooks: {
          validate: async ({ resolvedData, addValidationError, operation, item }) => {
            if (operation === 'delete') return
            const priority = resolvedData.priority ?? item?.priority
            const reason = resolvedData.reasonForHighPriority ?? item?.reasonForHighPriority
            if (priority === 'high' && !reason) {
              addValidationError('Reason for high priority is required when priority is high')
            }
          },
        },
      }),
      open: checkbox({
        defaultValue: true,
        ui: {
          label: 'Status',
          views: './issue-status/views',
          createView: { fieldMode: 'hidden' },
          itemView: {
            fieldMode: 'hidden',
            fieldPosition: 'sidebar',
          },
          listView: { fieldMode: 'hidden' },
        },
      }),
      tags: relationship({
        ref: 'Tag.issues',
        many: true,
        ui: {
          createView: { isRequired: true },
          itemView: { isRequired: true },
        },
      }),
    },
    actions: {
      close: action({
        access: allowAll,
        async resolve({ where }, context) {
          return await context.sudo().db.Issue.updateOne({
            where,
            data: { open: false },
          })
        },
        ui: {
          label: 'Close Issue',
          messages: {
            promptTitle: 'Close Issue',
            prompt: 'Are you sure you want to close “{itemLabel}”?',
            promptConfirmLabel: 'Yes, close',
            success: '{Singular} closed',
          },
          itemView: {
            actionMode: { hidden: { open: { equals: false } } },
            navigation: 'refetch',
          },
          listView: {
            actionMode: 'hidden',
          },
        },
      }),
      reopen: action({
        access: allowAll,
        async resolve({ where }, context) {
          return await context.sudo().db.Issue.updateOne({
            where,
            data: { open: true },
          })
        },
        ui: {
          label: 'Re-open Issue',
          messages: {
            promptTitle: 'Re-open Issue',
            prompt: 'Are you sure you want to re-open “{itemLabel}”?',
            promptConfirmLabel: 'Yes, re-open',
            success: '{Singular} re-opened',
          },
          itemView: {
            actionMode: { hidden: { open: { equals: true } } },
            navigation: 'refetch',
          },
          listView: {
            actionMode: 'hidden',
          },
        },
      }),
    },
  }),
  Tag: list({
    access: allowAll,
    fields: {
      name: text(),
      issues: relationship({
        ref: 'Issue.tags',
        many: true,
      }),
    },
  }),
} satisfies Lists
