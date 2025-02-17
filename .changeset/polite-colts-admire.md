---
"@keystone-6/auth": major
"@keystone-6/core": major
---

Replace `bcrypt` and `workFactor` options for `password` field with new generic `kdf` option. The default KDF is still `bcryptjs` but it now errors for passwords longer than 72 bytes to avoid bcrypt's truncation behaviour
