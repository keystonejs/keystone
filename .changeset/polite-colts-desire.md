---
"@keystone-6/core": major
---

Fixes the `password` field to throw an error for inputs longer than 72 bytes when using the default `bcrypt` key derivation function (KDF)
