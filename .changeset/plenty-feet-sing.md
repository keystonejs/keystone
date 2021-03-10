---
'@keystone-next/keystone': minor
'@keystone-next/adapter-prisma-legacy': minor
'@keystone-next/admin-ui': minor
---

Added an option to pass in the prisma client to use instead of attempting to generate one and `require()`ing it to fix the experimental `enableNextJsGraphqlApiEndpoint` option not working on Vercel
