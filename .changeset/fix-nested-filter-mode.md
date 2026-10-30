---
'@keystone-6/core': patch
---

Fixes `mode` being dropped from a text filter's nested `not` object, which made queries like `where: { name: { not: { equals: "a", mode: insensitive } } }` fail with `Cannot destructure property 'AND' of 'undefined'`
