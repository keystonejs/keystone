---
'@keystone-next/fields': major
'@keystone-next/app-basic': patch
'@keystone-next/example-blog': patch
'@keystone-next/example-ecommerce': patch
'keystone-next-app': patch
'@keystone-next/example-json-field': patch
'@keystone-next/example-roles': patch
'@keystone-next/example-sandbox': patch
'@keystone-next/example-todo': patch
'@keystone-next/example-with-auth': patch
---

The GraphQL field `_all<path>Meta { count }` generated for `many` relationships has been deprecated in favour of a new field `<path>Count`, which directly returns the count.

A `posts` relationship field would have the following field added to the API:

```graphql
postsCount(where: PostWhereInput! = {}): Int
```
