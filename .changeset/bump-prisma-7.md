---
'@keystone-6/core': major
---

Upgrades Prisma major version to 7. `prisma` and `@prisma/client` are now peer dependencies of `@keystone-6/core`. You will need to install them in your project along with the relevant adapter for your database (e.g. `@prisma/adapter-pg`). The `db.url`, `db.shadowDatabaseUrl`, and `db.enableLogging` config options have been replaced with a `prismaClientOptions` option, this is a function which should return the configuring Prisma adapter and any other options you want to pass to the Prisma client. The Prisma Client is now generated into `generated/prisma` by default now
