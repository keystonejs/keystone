---
'@keystone-next/fields-document': major
---

The `document` field is now non-nullable in the database. The field no longer has `defaultValue` or `isRequired` options. The same behaviour can be re-created with the `validateInput` and `resolveInput` hooks respectively. The field will default to `[{ "type": "paragraph", "children": [{ "text": "" }] }]`. The output type has also been renamed to `ListKey_fieldKey_Document`

If you're using SQLite, Prisma will generate a migration that makes the column non-nullable and sets any rows that have null values to an empty paragraph.

If you're using PostgreSQL, Prisma will generate a migration but you'll need to modify it if you have nulls in a `document` field. Keystone will say that the migration cannot be executed:

```
✨ Starting Keystone
⭐️ Dev Server Ready on http://localhost:3000
✨ Generating GraphQL and Prisma schemas
✨ There has been a change to your Keystone schema that requires a migration

⚠️ We found changes that cannot be executed:

  • Made the column `content` on table `Post` required, but there are 1 existing NULL values.

✔ Name of migration … make_document_field_non_null
✨ A migration has been created at migrations/20210915050920_make_document_field_non_null
Please edit the migration and run keystone-next dev again to apply the migration
```

The generated migration will look like this:

```sql
/*
  Warnings:

  - Made the column `content` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "content" SET DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]';
```

To make it set any null values to an empty paragraph in your database, you need to modify it so that it looks like this but with the table and column names replaced.

```sql
ALTER TABLE "Post" ALTER COLUMN "content" SET DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]';
UPDATE "Post" SET "content" = DEFAULT WHERE "content" IS NULL;
ALTER TABLE "Post" ALTER COLUMN "content" SET NOT NULL;
```
