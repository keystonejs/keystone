---
'@keystone-next/test-utils-legacy': patch
---

Improved performance when running Prisma tests by switching the hashing algorithm from sha256 to md5 used to generate the schema name and memoizing the hashing