---
'@keystone-next/keystone': major
---

Keystone will now default to using GraphQL Playground instead of Apollo Sandbox as it did prior to updating to Apollo Server 3. If you want to use Apollo Sandbox, you can set `graphql.playground: 'apollo'` to use Apollo. `graphql.playground` defaults to `process.env.NODE_ENV !== 'production'`, which will serve GraphQL Playground in development and serve nothing in production, if you'd like to set it to one of those always, you can set `graphql.playground` to a boolean explicitly.
