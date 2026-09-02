---
'@keystone-6/auth': major
---

Renames password authentication mutation to always `authenticateWithPassword` with `identity` and `password` arguments. The result types are now `AuthenticationWithPasswordResult`, `AuthenticationWithPasswordSuccess`, and `AuthenticationWithPasswordFailure`.
