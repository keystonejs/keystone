---
'@keystone-6/core': major
---

`db.onConnect` is now called with an unprivileged context, **not sudo**.  Use `context.sudo()` if you need to bypass access control
