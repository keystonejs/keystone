---
'@keystone-next/fields': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Renamed `first` argument in find many queries to `take` to align with Prisma.

```graphql
type Query {
  users(
    where: UserWhereInput! = {}
    orderBy: [UserOrderByInput!]! = []
    # previously was first: Int
    take: Int
    skip: Int! = 0
  ): [User!]
  # ...
}

type User {
  # ...
  posts(
    where: PostWhereInput! = {}
    orderBy: [PostOrderByInput!]! = []
    # previously was first: Int
    take: Int
    skip: Int! = 0
  ): [Post!]
  # ...
}
```
