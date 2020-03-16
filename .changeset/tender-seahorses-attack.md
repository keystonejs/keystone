---
'@keystonejs/fields': major
---

Replaced default bcrypt implementation from `bcrypt` to `bcryptjs`. You can use the new `useCompiledBcrypt` config option to the `Password` field to keep the use of the `bcrypt` package. `bcrypt` must be manually listed in your `package.json` if use set `{ useCompiledBcrypt: true }`, as it is no longer a dependency of Keystone.
