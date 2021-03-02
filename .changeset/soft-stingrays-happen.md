---
'@keystone-next/auth': major
---

Fixed a bug when using `passwordResetLink` with a `secretField` other than `'password'`. If you used a `secretField` other than `'password'` then the generated fields in your schema will change.
