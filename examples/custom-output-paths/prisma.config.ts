import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'my-prisma.prisma',
  migrations: {
    path: 'migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
})
