---
'@keystone-next/fields': major
---

The `password` field type now adds a GraphQL type `PasswordState` to the GraphQL output type instead of adding `${fieldKey}_is_set`.

```graphql
type User {
  password: PasswordState
}

type PasswordState {
  isSet: Boolean!
}
```
