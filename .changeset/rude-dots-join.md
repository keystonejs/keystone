---
'@keystone-next/keystone': major
'@keystone-next/adapter-prisma-legacy': major
'@keystone-next/website': patch
'@keystone-next/example-auth': patch
'@keystone-next/app-basic': patch
'@keystone-next/example-blog': patch
'@keystone-next/example-ecommerce': patch
'keystone-next-app': patch
'@keystone-next/example-next-lite': patch
'@keystone-next/example-roles': patch
'@keystone-next/example-sandbox': patch
'@keystone-next/example-todo': patch
'@keystone-next/example-with-auth': patch
'@keystone-next/types': patch
'@keystone-next/api-tests-legacy': patch
---

Deprecated the `sortBy` GraphQL filter. Updated the `orderBy` GraphQL filter with an improved API.

Previously a `User` list's `allUsers` query would have the argument:

```graphql
orderBy: String
```

The new API gives it the argument:

```graphql
orderBy: [UserOrderByInput!]! = []
```

where

```graphql
input UserOrderByInput {
  id: OrderDirection
  name: OrderDirection
  score: OrderDirection
}

enum OrderDirection {
  asc
  desc
}
```

Rather than writing `allusers(orderBy: "name_ASC")` you now write `allUsers(orderBy: { name: asc })`. You can also now order by multiple fields, e.g. `allUsers(orderBy: [{ score: asc }, { name: asc }])`. Each `UserOrderByInput` must have exactly one key, or else an error will be returned.
