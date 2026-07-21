import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { timestamp } from '@keystone-6/core/fields'

export const dbConfig = {
  provider: 'sqlite' as const,
  prismaClientOptions: () => ({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? 'file:./dev.db',
    }),
  }),
}

export const trackingFields = {
  createdAt: timestamp({
    access: {
      read: { item: () => true, filter: () => false, order: () => false },
      create: () => false,
      update: () => false,
    },
    graphql: { omit: { create: true, update: true } },
    defaultValue: { kind: 'now' },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  updatedAt: timestamp({
    access: {
      read: { item: () => true, filter: () => false, order: () => false },
      create: () => false,
      update: () => false,
    },
    graphql: { omit: { create: true, update: true } },
    db: { updatedAt: true },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
}
