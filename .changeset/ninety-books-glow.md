---
"@keystone-next/keystone": major
---

The Graphql API endpoint now starts up significantly faster in Dev.

To facilitate this, `createExpressServer` no longer includes the step of creating the Admin UI Middleware, which changes its signature. `createAdminUIMiddleware` is now also exported from `@keystone-next/keystone/system`.
