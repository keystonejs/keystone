---
'@keystone-6/auth': major
---

Removes `initFirstItem`, including the `/init` Admin UI page and the `createInitial*` GraphQL mutation. Use `db.onConnect` to seed an initial user instead.
