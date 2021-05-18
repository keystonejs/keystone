---
'@keystone-next/keystone': minor
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

The GraphQL query `_all<Items>Meta { count }` generated for each list has been deprecated in favour of a new query `all<Items>Count`, which directy returns the count.

A `User` list would have the following query added to the API:

```graphql
allUsersCount(where: UserWhereInput! = {}): Int!
```
