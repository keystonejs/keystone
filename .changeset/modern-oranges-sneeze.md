---
'@keystonejs/api-tests': patch
'@keystonejs/keystone': patch
---

Fixed invalid GraphQL schema when using `access: { update: false, auth: true }` on a list configured with an `AuthStrategy`.
