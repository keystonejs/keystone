---
'@keystone-next/keystone': major
---

The `checkbox` field is now non-nullable in the database, if you need three states, you should use `select()`. The field no longer accepts dynamic default values and it will default to `false` unless a different `defaultValue` is specified. `graphql.isNonNull` can also be set if you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable.

If you're using SQLite, Prisma will generate a migration that makes the column non-nullable and sets any rows that have null values to the `defaultValue`.

If you're using PostgreSQL, Prisma will generate a migration but you'll need to modify it if you have nulls in a checkbox field. Keystone will say that the migration cannot be executed:

```
✨ Starting Keystone
⭐️ Dev Server Ready on http://localhost:3000
✨ Generating GraphQL and Prisma schemas
✨ There has been a change to your Keystone schema that requires a migration

⚠️ We found changes that cannot be executed:

  • Made the column `isAdmin` on table `User` required, but there are 1 existing NULL values.

✔ Name of migration … make-is-admin-non-null
✨ A migration has been created at migrations/20210906053141_make_is_admin_non_null
Please edit the migration and run keystone-next dev again to apply the migration
```

The generated migration will look like this:

```sql
/*
  Warnings:

  - Made the column `isAdmin` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isAdmin" SET NOT NULL,
ALTER COLUMN "isAdmin" SET DEFAULT false;
```

To make it set any null values to false in your database, you need to modify it so that it looks like this but with the table and column names replaced.

```sql
ALTER TABLE "User" ALTER COLUMN "isAdmin" SET DEFAULT false;
UPDATE "User" SET "isAdmin" = DEFAULT WHERE "isAdmin" IS NULL;
ALTER TABLE "User" ALTER COLUMN "isAdmin" SET NOT NULL;
```