---
'@keystone-next/keystone': major
---

The names of two-sided many-many relationships now only include the list key and field key for one side of the relationship and one-sided many relationships(which are many-many) no longer have `_many` at the end of them for consistency with two-sided relationships. This allows having many-many relationships with long list and field keys without hitting Postgres's 63 character limit.

This will require migrations if you have many-many relationships.

Given a schema like this:

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

When you run Keystone after updating, Keystone will prompt you to create a migration, you should do this but **DO NOT APPLY IT**, it needs to be modified before being applied.

Prisma will generate a migration that looks something like this:


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
