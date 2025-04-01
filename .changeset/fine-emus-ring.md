---
'@keystone-6/auth': major
---

Password authentication now always uses the `authenticateWithPassword` mutation with `identity` and `password` arguments. Its result types are now `AuthenticationWithPasswordResult`, `AuthenticationWithPasswordSuccess`, and `AuthenticationWithPasswordFailure`.
