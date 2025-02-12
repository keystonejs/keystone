import { list } from '@keystone-6/core'
import { bigInt, checkbox, relationship, text, timestamp } from '@keystone-6/core/fields'
import { select } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import type { Lists } from '.keystone/types'

export const lists = {
  Task: list({
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
        hooks: {
          resolveInput ({ resolvedData, inputData }) {
            if (inputData.priority === null) {
              // default to high if "urgent" is in the label
              if (inputData.label && inputData.label.toLowerCase().includes('urgent')) {
                return 'high'
              } else {
                return 'low'
              }
            }
            return resolvedData.priority
          },
        },
      }),

      // static default: when a task is first created, it is incomplete
      isComplete: checkbox({ defaultValue: false }),

      assignedTo: relationship({
        ref: 'Person.tasks',
        many: false,
        hooks: {
          // dynamic default: if unassigned, find an anonymous user and assign the task to them
          async resolveInput ({ context, operation, resolvedData }) {
            if (resolvedData.assignedTo === null) {
              const [user] = await context.db.Person.findMany({
                where: { name: { equals: 'Anonymous' } },
              })

              if (user) {
                return { connect: { id: user.id } }
              }
            }

            return resolvedData.assignedTo
          },
        },
      }),

      // dynamic default: we set the due date to be 7 days in the future
      finishBy: timestamp({
        hooks: {
          resolveInput ({ resolvedData, inputData, operation }) {
            if (inputData.finishBy == null) {
              const date = new Date()
              date.setUTCDate(new Date().getUTCDate() + 7)
              return date
            }
            return resolvedData.finishBy
          },
        },
      }),

      // static default: when a task is first created, it has been viewed zero times
      viewCount: bigInt({
        defaultValue: 0n,
      }),
    },
  }),
  Person: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
} satisfies Lists
