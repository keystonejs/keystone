---
'@keystone-next/keystone': major
---

The names of one-sided and two-sided, many-many relationships has been shortened. Two-sided many-many relationship names contain only the left-hand side names now; and the `_many` suffix has been dropped from one-sided many-many relationships.

This reduces the probability that you will exceed [PostgreSQL's 63 character limit for identifiers](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS) with typical usage.

This is a breaking change. 

There are two ways to update:

1. Set `experimental.useLegacyManyRelationNames: true` at the root of your config. This will make Keystone revert to the old relation names. This feature will be removed in a future release.
2. Or, rename your many relation tables using a migration (see below)

For example, given a schema like this:

```ts
Post: list({
  fields: {
    tags: relationship({ ref: 'Tag.posts', many: true }),
  },
}),
Tag: list({
  fields: {
    posts: relationship({ ref: 'Post.tags', many: true }),
  },
}),
```

When updating to this change, and running `yarn dev`, Keystone will prompt you to update your schema.

- If you are using `useMigrations: true`, Keystone will follow the typical migration flow offer to apply an automatically generated migration. **DO NOT APPLY THE AUTOMATICALLY GENERATED MIGRATION** - unless you want to `DROP` your data.

- If you are using `useMigrations: false`, Keystone will follow the typical flow and offer to automatically migrate your schema.  Again, **DO NOT RUN THE AUTOMATIC MIGRATION** - unless you want to `DROP` your data.

On PostgreSQL, Prisma will generate a migration that looks something like this:

```sql
/*
  Warnings:

  - You are about to drop the `_Post_tags_Tag_posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Post_tags_Tag_posts" DROP CONSTRAINT "_Post_tags_Tag_posts_A_fkey";

-- DropForeignKey
ALTER TABLE "_Post_tags_Tag_posts" DROP CONSTRAINT "_Post_tags_Tag_posts_B_fkey";

-- DropTable
DROP TABLE "_Post_tags_Tag_posts";

-- CreateTable
CREATE TABLE "_Post_tags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

You need to modify it so that it looks like this with the old and new table names for your schema substituted:

```sql
ALTER TABLE "_Post_tags_Tag_posts" RENAME TO "_Post_tags";
ALTER INDEX "_Post_tags_Tag_posts_AB_unique" RENAME TO "_Post_tags_AB_unique";
ALTER INDEX "_Post_tags_Tag_posts_B_index" RENAME TO "_Post_tags_B_index";
ALTER TABLE "_Post_tags" RENAME CONSTRAINT "_Post_tags_Tag_posts_A_fkey" TO "_Post_tags_A_fkey";
ALTER TABLE "_Post_tags" RENAME CONSTRAINT "_Post_tags_Tag_posts_B_fkey" TO "_Post_tags_B_fkey";
```

On SQLite, Prisma will generate a migration that looks something like this:

```sql
/*
  Warnings:

  - You are about to drop the `_Post_tags_Tag_posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_Post_tags_Tag_posts";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_Post_tags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");
```

You need to modify it so that it looks like this with the old and new table names for your schema substituted:

```sql
ALTER TABLE "_Post_tags_Tag_posts" RENAME TO "_Post_tags";
DROP INDEX "_Post_tags_Tag_posts_AB_unique";
DROP INDEX "_Post_tags_Tag_posts_B_index";
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");
```
