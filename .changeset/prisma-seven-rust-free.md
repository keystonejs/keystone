---
"@keystone-6/core": major
"create-keystone-app": minor
---

Adopt Prisma 7's Rust-free client generator and require applications to provide their Prisma driver adapter through `db.prismaClientOptions`. Move Prisma CLI datasource and schema settings into the `prisma.config.ts`, generate clients outside `node_modules`, and bundle the generated client with the built Keystone config.
