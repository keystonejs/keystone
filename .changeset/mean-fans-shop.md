---
"@keystone-6/core": major
---

Changes Prisma client error handling so Prisma operations no longer return `GraphQLError`. Using the Prisma client will now throw errors normally. Prisma errors that are not caught in resolvers will now have all information beyond the fact that they're Prisma errors removed before they're returned over the network. You can use `graphql.apolloConfig.formatError` in your config to override this.
