---
'@keystone-next/keystone': major
---

`createExpressServer` now returns `Promise<{ expressServer: Express; apolloServer: ApolloServer; }>` instead of `Promise<Express>` so that the apollo server can be stopped.
