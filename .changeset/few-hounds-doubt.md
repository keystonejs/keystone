---
'@keystone-next/keystone': major
---

`createSystem` no longer accepts a Prisma client directly and it returns `getKeystone` which accepts the generated Prisma client and returns `connect`, `disconnect` and `createContext` instead of returning a `keystone` instance object.
