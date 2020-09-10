---
'@keystonejs/keystone': major
---

Removed the automatic mapping of native types to keystone field types when defining fields. Keystone will no longer convert `{ type: String }` to `{ type: Text }`, `{ type: Number }` to `{ type: Float }`, or `{ type: Boolean }` to `{ type: Checkbox }`.
