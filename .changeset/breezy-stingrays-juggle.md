---
'@keystonejs/keystone': patch
---

The `authenticateMutation` resolver now passes the `context` object through to the `authStrategy.validate` method.
