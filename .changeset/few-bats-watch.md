---
'@keystone-next/keystone': patch
---

Fixed returning filters like `{ NOT: [{ name: { equals: 'blah' } }] }` from filter access control and improve error messages when returning bad filters from filter access control
