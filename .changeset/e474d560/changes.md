- GraphQL Playground now correctly sends auth cookies by default.
- The GraphQL `context` object now has `startAuthedSession` and
  `endAuthedSession` methods bound to the current request (from
  `@keystone-alpha/session`)
