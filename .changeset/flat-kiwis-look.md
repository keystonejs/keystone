---
'@keystonejs/fields': patch
'@keystonejs/keystone': minor
---

Various improvements to validation hooks (`validateInput`, `validateDelete`):

- `addFieldValidationError` has been deprecated. It was non-functional in list hooks, which already received their own `addValidationError` function. Both field and list hooks should use the latter.
- Any errors thrown from validation hooks now surface as an ValidationFailureError.
- addValidationError no longer returns the number of errors (result of Array.push).
- Field type and field hook validation now runs in parallel.