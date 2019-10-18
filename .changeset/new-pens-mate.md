---
'@keystone-alpha/keystone': minor
---

The `keystone` cli now accepts a return of `{ keystone, apps, configureExpress }` from the entry file. `configureExpress` will be called on the Express app before applying the keystone middlewares.
