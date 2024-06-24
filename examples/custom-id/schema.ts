import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { relationship, text, timestamp } from '@keystone-6/core/fields'
import { createId } from '@paralleldrive/cuid2'
import type { Lists } from '.keystone/types'

function makeCustomIdentifier (listKey: string) {
  return `${listKey.toUpperCase()}_${createId()}`
}

export const lists = {
  Task: list({
    access: allowAll,
    db: {
      idField: { kind: 'autoincrement' },
    },
    fields: {
      label: text({ validation: { isRequired: true } }),
      assignedTo: relationship({ ref: 'Person.tasks', many: false }),
      finishBy: timestamp(),
    },
  }),
  Person: list({
    access: allowAll,
    db: {
      idField: { kind: 'random' },
    },
    fields: {
      name: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
  Order: list({
    access: allowAll,
    db: {
      idField: { kind: 'string' },
    },
    fields: {
      description: text({ validation: { isRequired: true } }),
      assignedTo: relationship({ ref: 'Person', many: false }),
      options: relationship({ ref: 'Option', many: true }),
      products: relationship({ ref: 'Product', many: true }),
      orderedAt: timestamp(),
    },
    hooks: {
      resolveInput: {
        create: async ({ listKey, operation, resolvedData }) => {
          return { ...resolvedData, id: makeCustomIdentifier(listKey) }
        },
      },
    },
  }),
  Option: list({
    access: allowAll,
    db: {
      idField: { kind: 'number', type: 'Int' },
    },
    fields: {
      description: text({ validation: { isRequired: true } }),
    },
    hooks: {
      resolveInput: {
        create: async ({ listKey, operation, resolvedData }) => {
          return { ...resolvedData, id: 3 }
        },
      },
    },
  }),
  Product: list({
    access: allowAll,
    db: {
      idField: { kind: 'uuid' },
    },
    fields: {
      sku: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    },
  }),
} satisfies Lists
