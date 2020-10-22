---
'@keystonejs/adapter-prisma': patch
'@keystonejs/test-utils': patch
---

Added a `provider` config option to `PrismaAdapter`. Only `postgresql` is currently supported, and this is the default value.
