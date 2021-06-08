---
'@keystone-next/auth': major
'@keystone-next/fields': major
---

The way that the implementations of `generateHash` and `compare` are passed from the password field to auth has changed to be in the extensions object of the GraphQL output field. Unless you've written your own password field implementation or you're using mismatching versions of @keystone-next/auth and @keystone-next/fields, this won't affect you.
