---
'@keystone-next/keystone': minor
'@keystonejs/keystone': minor
'@keystonejs/demo-project-meetup': patch
'@keystone-next/admin-ui': patch
'@keystone-next/auth': patch
'@keystone-next/types': patch
'@keystonejs/auth-passport': patch
'@keystonejs/example-projects-starter': patch
'@keystonejs/fields': patch
'@keystonejs/list-plugins': patch
'@keystonejs/server-side-graphql-client': patch
'@keystonejs/test-utils': patch
'@keystonejs/api-tests': patch
---

Added a `.sudo()` method to `context` objects, which is equivalent to the common operation `context.createContext({ skipAccessControl: true })`.
