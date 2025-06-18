import type { Lists } from '.keystone/types'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, relationship, select, text, timestamp } from '@keystone-6/core/fields'

export const lists = {
  Todo: list({
    access: allowAll,
    fields: {
      label: text({ validation: { isRequired: true } }),
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
            fieldMode: {
              edit: {
                priority: { equals: 'high' },
              },
            },
            isRequired: {
              priority: { equals: 'high' },
            },
          },
          itemView: {
            fieldMode: {
              edit: {
                priority: { equals: 'high' },
              },
            },
            isRequired: {
              priority: { equals: 'high' },
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
      isComplete: checkbox(),
      finishBy: timestamp(),
      tags: relationship({
        ref: 'Tag.todos',
        many: true,
        ui: {
          createView: { isRequired: true },
          itemView: { isRequired: true },
        },
      }),
    },
  }),
  Tag: list({
    access: allowAll,
    fields: {
      name: text(),
      todos: relationship({
        ref: 'Todo.tags',
        many: true,
      }),
    },
  }),
} satisfies Lists
