import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, text, timestamp } from '@keystone-6/core/fields'
import { select } from '@keystone-6/core/fields'
import type { Lists } from '.keystone/types'

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
    },
  }),
} satisfies Lists
