---
'@keystonejs/app-admin-ui': patch
---

Fixed Select field filter when there are multiple values, generated GraphQL query did not include the `[]` in case of multi value filter.
