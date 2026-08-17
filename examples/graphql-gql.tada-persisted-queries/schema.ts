import { allowAll, denyAll } from '@keystone-6/core/access'
import { list } from '@keystone-6/core'
import { checkbox, password, text } from '@keystone-6/core/fields'
import type { Lists } from './generated/keystone/types.ts'

export type Session = {
  itemId: string
  data: {
    isAdmin: boolean
  }
}

export function isAdmin({ session }: { session?: Session }) {
  return session?.data.isAdmin ?? false
}

export const lists = {
  User: list({
    access: {
      operation: {
        query: isAdmin,
        create: denyAll,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({
        isIndexed: 'unique',
        validation: { isRequired: true },
      }),
      password: password({
        access: { read: denyAll },
        validation: { isRequired: true },
      }),
      isAdmin: checkbox({ defaultValue: false }),
    },
  }),
  Post: list({
    access: {
      operation: {
        query: allowAll,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      title: text({ validation: { isRequired: true } }),
    },
  }),
} satisfies Lists<Session>
