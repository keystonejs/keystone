---
'@keystone-next/keystone': minor
'@keystonejs/keystone': minor
'@keystonejs/demo-project-meetup': major
'@keystone-next/admin-ui': major
'@keystone-next/auth': major
'@keystone-next/types': major
'@keystonejs/auth-passport': major
'@keystonejs/example-projects-starter': major
'@keystonejs/fields': major
'@keystonejs/list-plugins': major
'@keystonejs/server-side-graphql-client': major
'@keystonejs/test-utils': major
'@keystonejs/api-tests': major
---

Added a `.sudo()` method to `context` objects, which is equivalent to the common operation `context.createContext({ skipAccessControl: true })`.
