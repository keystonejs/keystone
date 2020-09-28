---
'@keystonejs/adapter-prisma': patch
'@keystonejs/api-tests': patch
---

Fixed queries with `{search: ""}`, which should return all items in the list.
