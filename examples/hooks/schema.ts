import { list, group } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { checkbox, text, timestamp } from '@keystone-6/core/fields'

import type { Lists } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

const readOnly = {
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
  ui: {
    createView: {
      fieldMode: () => 'hidden' as const,
    },
    itemView: {
      fieldMode: () => 'read' as const,
    },
    listView: {
      fieldMode: () => 'read' as const,
    },
  },
}

export const lists = {
  Post: list({
    access: allowAll, // WARNING: public
    fields: {
      // we use isNonNull for these fields to enforce that they are always provided, and validated against a content filter
      title: text({
        validation: { isRequired: true },
        graphql: {
          isNonNull: {
            create: true,
            update: true,
          },
        },
      }),
      content: text({
        validation: { isRequired: true },
        graphql: {
          isNonNull: {
            create: true,
            update: true,
          },
        },
      }),
      feedback: text({
        validation: { isRequired: true },
        graphql: {
          omit: {
            create: true,
          },
        },
      }),
      preventDelete: checkbox(),

      ...group({
        label: 'Authorship',
        description: 'Fields that show who created and updated this Post',
        fields: {
          createdBy: text({ ...readOnly }),
          createdAt: timestamp({
            ...readOnly,

            // TODO: explain
            // defaultValue: { kind: 'now' }

            hooks: {
              resolveInput: {
                create: () => new Date()
              }
            }
          }),

          updatedBy: text({ ...readOnly }),
          updatedAt: timestamp({
            ...readOnly,

            // TODO: explain
            // db: {
            //   updatedAt: true
            // },

            hooks: {
              resolveInput: {
                update: () => new Date()
              }
            }
          }),
        },
      }),
    },
    hooks: {
      resolveInput: {
        create: ({ context, resolvedData }) => {
          //resolvedData.createdAt = new Date(); // see createdAt field hook
          resolvedData.createdBy = `${context.req?.socket.remoteAddress} (${context.req?.headers['user-agent']})`
          return resolvedData
        },
        update: ({ context, resolvedData }) => {
          //resolvedData.updatedAt = new Date(); // see updatedAt field hook
          resolvedData.updatedBy = `${context.req?.socket.remoteAddress} (${context.req?.headers['user-agent']})`
          return resolvedData
        },
      },
      validate: {
        create: ({ inputData, addValidationError }) => {
          const { title, content } = inputData

  
          // an example of a content filter, the prevents the title or content containing the word "Profanity"
          if (/profanity/i.test(title)) return addValidationError('Unacceptable title')
          if (/profanity/i.test(content)) return addValidationError('Unacceptable content')
        },
        update: ({ inputData, addValidationError }) => {
          const { title, content } = inputData

          if ('feedback' in inputData) {
            const { feedback } = inputData
            if (/profanity/i.test(feedback ?? '')) return addValidationError('Unacceptable feedback')
          }

          // an example of a content filter, the prevents the title or content containing the word "Profanity"
          if (/profanity/i.test(title)) return addValidationError('Unacceptable title')
          if (/profanity/i.test(content)) return addValidationError('Unacceptable content')
        },
        delete: ({ context, item, addValidationError }) => {
          const { preventDelete } = item
  
          // an example of a content filter, the prevents the title or content containing the word "Profanity"
          if (preventDelete) return addValidationError('Cannot delete Post, preventDelete is true')
        },
      },
      beforeOperation: {
        create: ({ item, resolvedData, operation }) => {
          console.log(`Post beforeOperation.${operation}`, resolvedData)
        },
        update: ({ item, resolvedData, operation }) => {
          console.log(`Post beforeOperation.${operation}`, resolvedData)
        },
        delete: ({ item, operation }) => {
          console.log(`Post beforeOperation.${operation}`, item)
        },
      },
      afterOperation: {
        create: ({ inputData, item }) => {
          console.log(`Post afterOperation.create`, inputData, '->', item)
        },

        update: ({ originalItem, item }) => {
          console.log(`Post afterOperation.update`, originalItem, '->', item)
        },
        delete: ({ originalItem }) => {
          console.log(`Post afterOperation.delete`, originalItem, '-> deleted')
        },
      },
    },
  }),
} satisfies Lists
