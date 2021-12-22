# @keystone-next/keystone

## 1.0.1

### Patch Changes

- [#7091](https://github.com/keystonejs/keystone/pull/7091) [`5ac8ef453`](https://github.com/keystonejs/keystone/commit/5ac8ef4533198ed8aa732131959ddd09758bda8d) Thanks [@Noviny](https://github.com/Noviny)! - Page names now reflect the page you are on: Item view shows the item's label, list view shows the list name, other pages show 'Keystone'

* [#7064](https://github.com/keystonejs/keystone/pull/7064) [`54c056c58`](https://github.com/keystonejs/keystone/commit/54c056c58af60d2ab86fd5590df5544e0a0132f9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Refactoring of TypeScript type generation

- [#7029](https://github.com/keystonejs/keystone/pull/7029) [`53f3ca6fd`](https://github.com/keystonejs/keystone/commit/53f3ca6fdbef16b305a41240f107754ad6823ff7) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Explicitly disable caching for redirect responses in the Admin UI

* [#7069](https://github.com/keystonejs/keystone/pull/7069) [`c51f8f7a0`](https://github.com/keystonejs/keystone/commit/c51f8f7a0b18fa53d45c026664454dbb6cd60694) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `You must await server.start() before calling server.createHandler()` error when using the `generateNextGraphqlAPI` experimental option.

- [#7062](https://github.com/keystonejs/keystone/pull/7062) [`30b3cacb0`](https://github.com/keystonejs/keystone/commit/30b3cacb08601a8db445e3c7be85dee10d0d2958) Thanks [@dcousens](https://github.com/dcousens)! - Updated prisma monorepo to [v3.6.0 (minor)](https://github.com/prisma/prisma/releases/tag/3.6.0).

* [#7052](https://github.com/keystonejs/keystone/pull/7052) [`911972098`](https://github.com/keystonejs/keystone/commit/911972098c1bdaa6e64a7aee028b3446e00106e5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed setting `db.enableLogging` to `false` erroring

- [#7073](https://github.com/keystonejs/keystone/pull/7073) [`1353c6290`](https://github.com/keystonejs/keystone/commit/1353c62906ee63d8f4006193f73357168208078c) Thanks [@SerWonka](https://github.com/SerWonka)! - Fix Lists import in artifacts types (changed in https://github.com/keystonejs/keystone/pull/7001)

* [#7092](https://github.com/keystonejs/keystone/pull/7092) [`1eed5d546`](https://github.com/keystonejs/keystone/commit/1eed5d54668757eb28cb3c8460631125d20b6722) Thanks [@Noviny](https://github.com/Noviny)! - Keystone favicon is now displayed on keystone sites

- [#7065](https://github.com/keystonejs/keystone/pull/7065) [`8c7a54453`](https://github.com/keystonejs/keystone/commit/8c7a54453e740906c18222244f86c3d59ddd54a4) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `fast-glob` dependency

* [#7111](https://github.com/keystonejs/keystone/pull/7111) [`888cf021a`](https://github.com/keystonejs/keystone/commit/888cf021a1beee64937c00bc5b58f8b3628dbdd4) Thanks [@Noviny](https://github.com/Noviny)! - Differentiate types for the field `resolveInput` hook and the list `resolveInput` hook.
  `undefined` may be returned by field `resolveInput` hooks (indicates a no-op), but not for lists.

## 1.0.0

### Major Changes

- [#7005](https://github.com/keystonejs/keystone/pull/7005) [`7dddbe0fd`](https://github.com/keystonejs/keystone/commit/7dddbe0fd5b42a2596ba4dc0bbe1813cb54571c7) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Change cli command from `keystone-next` to `keystone`

* [#7028](https://github.com/keystonejs/keystone/pull/7028) [`3c7a581c1`](https://github.com/keystonejs/keystone/commit/3c7a581c1e53ae49c9f74509de3927ebf2703bde) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Released Keystone 6

- [#7005](https://github.com/keystonejs/keystone/pull/7005) [`f4554980f`](https://github.com/keystonejs/keystone/commit/f4554980f6243a6545eee6c887d946ff25cd90e3) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - - The following types have been renamed:
  - `BaseGeneratedListTypes` → `BaseListTypeInfo`
  - `ItemRootValue` → `BaseItem`
  - `ListInfo` → `ListGraphQLTypes`
  - `TypesForList` → `GraphQLTypesForList`
  - `FieldTypeFunc` now has a required type parameter which must satisfy `BaseListTypeInfo`
  - The following types now have a required type parameter which must satisfy `BaseKeystoneTypeInfo`:
    - `ServerConfig`
    - `CreateRequestContext`
    - `AdminUIConfig`
    - `DatabaseConfig`
    - `ListOperationAccessControl`
    - `MaybeSessionFunction`
    - `MaybeItemFunction`
  - `GraphQLResolver` and `GraphQLSchemaExtension` now have a required type parameter which must satisfy `KeystoneContext`
  - `KeystoneGraphQLAPI` no longer has a type parameter
  - The first parameter to the resolver in a `virtual` field will be typed as the item type if the list is typed with `Keystone.Lists` or `Keystone.Lists.ListKey`, otherwise it will be typed as `unknown`
  - The `item`/`originalItem` arguments in hooks/access control will now receive the `Item` type if the list is typed with `Keystone.Lists` or `Keystone.Lists.ListKey`, otherwise it will be typed as `BaseItem`
  - `args` has been removed from `BaseListTypeInfo`
  - `inputs.orderBy` and `all` has been added to `BaseListTypeInfo`
  - In `.keystone/types`:
    - `ListKeyListTypeInfo` has been moved to `Lists.ListKey.TypeInfo`
    - `KeystoneContext` has been renamed to `Context`

### Patch Changes

- [#7005](https://github.com/keystonejs/keystone/pull/7005) [`fb7844ab5`](https://github.com/keystonejs/keystone/commit/fb7844ab50c1d4a6d14b2ad46a568665f6661921) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Improve console output for when you need to restart the server because of schema changes

## 29.0.0

### Major Changes

- [#6920](https://github.com/keystonejs/keystone/pull/6920) [`82539faa5`](https://github.com/keystonejs/keystone/commit/82539faa53c495be1f5f470deb9eae9861cd31a0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Keystone now uses Prisma's Node-API Query Engine instead of the Binary Query Engine. This should improve the performance of operations using Prisma. See https://www.prisma.io/docs/concepts/components/prisma-engines/query-engine for more details.

* [#6917](https://github.com/keystonejs/keystone/pull/6917) [`04c54a4eb`](https://github.com/keystonejs/keystone/commit/04c54a4eb4aa6076cf87d441060eaa2091bc903b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The names of one-sided and two-sided, many-many relationships has been shortened. Two-sided many-many relationship names contain only the left-hand side names now; and the `_many` suffix has been dropped from one-sided many-many relationships.

  This reduces the probability that you will exceed [PostgreSQL's 63 character limit for identifiers](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS) with typical usage.

  This is a breaking change.

  There are two ways to update:

  ### Set `db.relationName` on many to many relation

  Rather than doing a migration, you can set the new field property `db.relationName`, for either side of a many-to-many relationship field.
  If set to the existing relation name, your database will remain unchanged.

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

  Before this release, the generated Prisma schema looked like this:

  ```prisma
  // This file is automatically generated by Keystone, do not modify it manually.
  // Modify your Keystone config when you want to change this.

  datasource postgresql {
    url      = env("DATABASE_URL")
    provider = "postgresql"
  }

  generator client {
    provider   = "prisma-client-js"
    output     = "node_modules/.prisma/client"
    engineType = "binary"
  }

  model Post {
    id   String @id @default(cuid())
    tags Tag[]  @relation("Post_tags_Tag_posts")
  }

  model Tag {
    id    String @id @default(cuid())
    posts Post[] @relation("Post_tags_Tag_posts")
  }
  ```

  By adding `db: { relationName: 'Post_tags_Tag_posts' }` to one side of the many-to-many relationship; you can preclude yourself from a migration.

  **Note:** It doesn't matter which side of the relationship you put this property, but it should be only on one side; otherwise you will receive an error.

  ```ts
  Post: list({
    fields: {
      tags: relationship({ ref: 'Tag.posts', many: true, db: { relationName: 'Post_tags_Tag_posts' } }),
    },
  }),
  Tag: list({
    fields: {
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
  ```

  ### Rename your many relation tables using a migration

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

  - If you are using `useMigrations: false`, Keystone will follow the typical flow and offer to automatically migrate your schema. Again, **DO NOT RUN THE AUTOMATIC MIGRATION** - unless you want to `DROP` your data.

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

- [#6957](https://github.com/keystonejs/keystone/pull/6957) [`de8cf44e7`](https://github.com/keystonejs/keystone/commit/de8cf44e7b328ab98e1466d7191d9ee65a57b02a) Thanks [@bladey](https://github.com/bladey)! - Update Node engines to support current Node LTS versions, currently versions 14 and 16.

### Minor Changes

- [#6968](https://github.com/keystonejs/keystone/pull/6968) [`f2b41df9f`](https://github.com/keystonejs/keystone/commit/f2b41df9f77cf340e5e138cf60bacd6aec8e4548) Thanks [@JedWatson](https://github.com/JedWatson)! - Added `db.foreignKey` option to the `relationship` field that allows you to explicitly pick which side of a one to one relationship the foreign key should be on and for one to one or one to many relationships add `@map` to the foreign key to change the column name in the database.

* [#6917](https://github.com/keystonejs/keystone/pull/6917) [`04c54a4eb`](https://github.com/keystonejs/keystone/commit/04c54a4eb4aa6076cf87d441060eaa2091bc903b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `db.relationName` option to many to many `relationship` fields to allow explicitly setting the relation name.

### Patch Changes

- [#6911](https://github.com/keystonejs/keystone/pull/6911) [`748538649`](https://github.com/keystonejs/keystone/commit/748538649645d3b0ef32b0baba8fa310f2a493fe) Thanks [@dcousens](https://github.com/dcousens)! - Explicitly declare return type on createExpressServer

* [#6967](https://github.com/keystonejs/keystone/pull/6967) [`4e96c23bb`](https://github.com/keystonejs/keystone/commit/4e96c23bb6c3a134f1324ec7879adac3abf90132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `relationship` field not respecting `ui.displayMode: 'cards'` in the create view.

- [#6949](https://github.com/keystonejs/keystone/pull/6949) [`76ec35c97`](https://github.com/keystonejs/keystone/commit/76ec35c97a72dcb023e1b0da5b47e876896b6a03) Thanks [@bladey](https://github.com/bladey)! - Fixed React key error in `relationship` field with `ui.displayMode: 'cards'`

* [#6955](https://github.com/keystonejs/keystone/pull/6955) [`760ae82ac`](https://github.com/keystonejs/keystone/commit/760ae82ac0fac5f73e123e2b36f7ba6320312ca6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `ui.isAccessAllowed` not being respected in the admin meta query when no session strategy was defined

- [#6932](https://github.com/keystonejs/keystone/pull/6932) [`0a7b75838`](https://github.com/keystonejs/keystone/commit/0a7b7583887e3811c23b0b74f4f97633fd484e08) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Field-level hooks and field-level create and update access control functions are now awaited in parallel. Note this means all field-level hooks and access control are now awaited in parallel because field-level read access control was already awaited in parallel.

* [`622e57689`](https://github.com/keystonejs/keystone/commit/622e57689cf27dbecba7f64c02f0a3b6499d3218) Thanks [@JedWatson](https://github.com/JedWatson)! - Pinned `@apollo/client` to 3.4.17, fixes an incompatibility between `@apollo/client` >= 3.5.0 and `apollo-upload-client` that breaks the Admin UI.

  We can revert this when [jaydenseric/apollo-upload-client#273](https://github.com/jaydenseric/apollo-upload-client/issues/273) has been resolved (may also be resolved by [apollographql/apollo-client#9103](https://github.com/apollographql/apollo-client/pull/9103))

- [#6972](https://github.com/keystonejs/keystone/pull/6972) [`bbedee845`](https://github.com/keystonejs/keystone/commit/bbedee84541d22c91a6816872902f6cce8e6aee3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The item page in the Admin UI no longer crashes when failing to fetch an item.

* [#6955](https://github.com/keystonejs/keystone/pull/6955) [`760ae82ac`](https://github.com/keystonejs/keystone/commit/760ae82ac0fac5f73e123e2b36f7ba6320312ca6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The admin meta query now bypasses `ui.isAccessAllowed` for sudo contexts.

- [#6974](https://github.com/keystonejs/keystone/pull/6974) [`96fd2e220`](https://github.com/keystonejs/keystone/commit/96fd2e22041de84a042f5a0df2cab75ba0dacc35) Thanks [@JedWatson](https://github.com/JedWatson)! - Removed unnecessary `@types/` dependencies

* [#6920](https://github.com/keystonejs/keystone/pull/6920) [`82539faa5`](https://github.com/keystonejs/keystone/commit/82539faa53c495be1f5f470deb9eae9861cd31a0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed doing multiple writes at the same time on SQLite causing an timeout immediately.

- [#6948](https://github.com/keystonejs/keystone/pull/6948) [`7a7450009`](https://github.com/keystonejs/keystone/commit/7a7450009d68f70173a2af55eb3a845ea3799c99) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `Set as Authenticated Item`/`Add Authenticated Item` button is now hidden if the relationship field already has the authenticated item.

- Updated dependencies [[`96fd2e220`](https://github.com/keystonejs/keystone/commit/96fd2e22041de84a042f5a0df2cab75ba0dacc35), [`de8cf44e7`](https://github.com/keystonejs/keystone/commit/de8cf44e7b328ab98e1466d7191d9ee65a57b02a), [`748538649`](https://github.com/keystonejs/keystone/commit/748538649645d3b0ef32b0baba8fa310f2a493fe)]:
  - @keystone-ui/fields@6.0.0
  - @keystone-ui/options@5.0.0
  - @keystone-ui/button@6.0.0
  - @keystone-ui/core@4.0.0
  - @keystone-ui/icons@5.0.0
  - @keystone-ui/loading@5.0.0
  - @keystone-ui/modals@5.0.0
  - @keystone-ui/notice@5.0.0
  - @keystone-ui/pill@6.0.0
  - @keystone-ui/popover@5.0.0
  - @keystone-ui/segmented-control@6.0.0
  - @keystone-ui/toast@5.0.0
  - @keystone-ui/tooltip@5.0.0

## 28.0.0

### Major Changes

- [#6915](https://github.com/keystonejs/keystone/pull/6915) [`b981f4c3e`](https://github.com/keystonejs/keystone/commit/b981f4c3ee135a1184188deb5ed8de22f718080c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `select`, `timestamp`, `float` and `decimal` fields with `isIndexed: 'unique'` now add unique filters to `ListWhereUniqueInput` like `text`, `integer` and the id field do.

### Minor Changes

- [#6907](https://github.com/keystonejs/keystone/pull/6907) [`990b56291`](https://github.com/keystonejs/keystone/commit/990b56291e677077656b201b935086754c6257f1) Thanks [@JedWatson](https://github.com/JedWatson)! - Added `db.map` option to lists and fields which adds the `@@map` and `@map` Prisma attributes respectively

### Patch Changes

- [#6918](https://github.com/keystonejs/keystone/pull/6918) [`70eb86237`](https://github.com/keystonejs/keystone/commit/70eb86237bd3eafd36b0579f66ad3f1e173357b1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The format of the date shown in the `timestamp` field in the Admin UI now uses the user's locale

- Updated dependencies [[`70eb86237`](https://github.com/keystonejs/keystone/commit/70eb86237bd3eafd36b0579f66ad3f1e173357b1)]:
  - @keystone-ui/fields@5.0.2

## 27.0.2

### Patch Changes

- [#6895](https://github.com/keystonejs/keystone/pull/6895) [`14d74b014`](https://github.com/keystonejs/keystone/commit/14d74b0149a6d34063c8c7d6df5071694e639291) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed importing packages that provide Node ESM

* [#6893](https://github.com/keystonejs/keystone/pull/6893) [`465eb3f95`](https://github.com/keystonejs/keystone/commit/465eb3f9595892cec34d17e1b7c21aea0c61a9d6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Local images and files are no longer restricted behind `ui.isAccessAllowed`

- [#6904](https://github.com/keystonejs/keystone/pull/6904) [`859ccb974`](https://github.com/keystonejs/keystone/commit/859ccb97489370443bc8d78b0bd7543d83f5b381) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Update prisma monorepo to [v3.4.0 (minor)](https://github.com/prisma/prisma/releases/tag/3.4.0)

* [#6910](https://github.com/keystonejs/keystone/pull/6910) [`127a0db64`](https://github.com/keystonejs/keystone/commit/127a0db646ecbfb9ec51c58a98d013e4e7ead20a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Keystone will continue starting up when Keystone Cloud is configured but fails to connect

## 27.0.1

### Patch Changes

- [#6870](https://github.com/keystonejs/keystone/pull/6870) [`8dac6bb93`](https://github.com/keystonejs/keystone/commit/8dac6bb93ccfbe62fe73e3ada311d2283f57ba6c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed files with names including things like `[...rest]` created using `ui.getAdditionalFiles` being deleted after being written in dev.

* [#6880](https://github.com/keystonejs/keystone/pull/6880) [`400f4e1eb`](https://github.com/keystonejs/keystone/commit/400f4e1eb34ef70d11a1f8c1f8bcf20d5fb10a1a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Runtime type errors from Prisma are now actually returned instead of being returned as `Prisma error:`

- [#6872](https://github.com/keystonejs/keystone/pull/6872) [`aa98b1c49`](https://github.com/keystonejs/keystone/commit/aa98b1c49b44938d2cf0904fd05b041f2259d267) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `Schema must contain uniquely named types but contains multiple types named "OrderDirection".` error when running `keystone-next build`.

## 27.0.0

### Major Changes

- [#6824](https://github.com/keystonejs/keystone/pull/6824) [`ddabdbd02`](https://github.com/keystonejs/keystone/commit/ddabdbd02230374ff921998f9d21c0ad7d32b226) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Keystone will now default to using GraphQL Playground instead of Apollo Sandbox as it did prior to updating to Apollo Server 3. If you want to use Apollo Sandbox, you can set `graphql.playground: 'apollo'` to use Apollo. `graphql.playground` defaults to `process.env.NODE_ENV !== 'production'`, which will serve GraphQL Playground in development and serve nothing in production, if you'd like to set it to one of those always, you can set `graphql.playground` to a boolean explicitly.

* [#6845](https://github.com/keystonejs/keystone/pull/6845) [`71600965b`](https://github.com/keystonejs/keystone/commit/71600965b963e098ca77ae1261b850b9573c9f22) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `CloudImageFieldOutput` and `CloudFileFieldOutput` GraphQL types to the `image` and `file` fields respectively

- [#6789](https://github.com/keystonejs/keystone/pull/6789) [`d9e1ba8fa`](https://github.com/keystonejs/keystone/commit/d9e1ba8fa23c0d9e902ef61167913ee92f5657cb) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed the deprecated `resolveFields` from `context.query`, if you were still using it, you should switch to providing `the query option` to `context.query` or use `context.db` if you were providing `false`. The `context.query` functions will now also throw an error if an empty string is passed to `query` rather than silently returning what the `context.db` functions return, you must select at least one field or omit the `query` option to default to selecting the `id`.

* [#6845](https://github.com/keystonejs/keystone/pull/6845) [`71600965b`](https://github.com/keystonejs/keystone/commit/71600965b963e098ca77ae1261b850b9573c9f22) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `src` field on the output of `image` and `file` fields has been renamed to `url`.

- [#6813](https://github.com/keystonejs/keystone/pull/6813) [`c0661b8ee`](https://github.com/keystonejs/keystone/commit/c0661b8ee9e16a1ffdd7fc77c9c56fead0efda36) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `@graphql-ts/schema` to `0.5.0`. The `__rootVal` properties on `ObjectType`, `InterfaceType` and `UnionType` have been renamed to `__source`, this is intended to be internal but it could be depended on so if you did, you will need to change to `__source`. The `fields` property on `InterfaceType` has been renamed to `__fields` and it will no longer exist at runtime like the other types.

* [#6797](https://github.com/keystonejs/keystone/pull/6797) [`cbb9df927`](https://github.com/keystonejs/keystone/commit/cbb9df927a0f106aaa35d107961a405b0d08a751) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `createExpressServer` now returns `Promise<{ expressServer: Express; apolloServer: ApolloServer; }>` instead of `Promise<Express>` so that the apollo server can be stopped.

- [#6797](https://github.com/keystonejs/keystone/pull/6797) [`cbb9df927`](https://github.com/keystonejs/keystone/commit/cbb9df927a0f106aaa35d107961a405b0d08a751) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added live reloading of your Keystone config to `keystone-next dev`

* [#6824](https://github.com/keystonejs/keystone/pull/6824) [`ddabdbd02`](https://github.com/keystonejs/keystone/commit/ddabdbd02230374ff921998f9d21c0ad7d32b226) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `graphql.cors` option. You should exclusively configure `cors` with the `server.cors` option.

- [#6845](https://github.com/keystonejs/keystone/pull/6845) [`71600965b`](https://github.com/keystonejs/keystone/commit/71600965b963e098ca77ae1261b850b9573c9f22) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `getSrc` function on `ImagesContext` and `FilesContext` has been renamed to `getUrl`

* [#6755](https://github.com/keystonejs/keystone/pull/6755) [`dcf5241d8`](https://github.com/keystonejs/keystone/commit/dcf5241d8e3e62b080842a5d4bfd47a7f2cce5ca) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated the way the `endSession` field on the `Mutation` type and the `keystone` field on the `Query` type are added to the GraphQL schema. This may result in re-ordering in your generated `schema.graphql` file. The `sessionSchema` export of `@keystone-next/keystone/session` has also been removed.

### Minor Changes

- [#6856](https://github.com/keystonejs/keystone/pull/6856) [`f3e8aac31`](https://github.com/keystonejs/keystone/commit/f3e8aac31efb3eb1573eb340e07a25920084a4aa) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `graphql.extend` and `graphql.wrap`.

### Patch Changes

- [#6714](https://github.com/keystonejs/keystone/pull/6714) [`5e61e0050`](https://github.com/keystonejs/keystone/commit/5e61e00503715f0f634d97e573926091a52661e6) Thanks [@Zlitus](https://github.com/Zlitus)! - When generating safe filenames, support extensions with numerical characters

* [#6758](https://github.com/keystonejs/keystone/pull/6758) [`f38772b27`](https://github.com/keystonejs/keystone/commit/f38772b27d3e9d157127dabfa40036462c235a9f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `text`, `integer`, `float` and `decimal` on the item view when using `ui.itemView.fieldMode: 'read'`.

- [#6777](https://github.com/keystonejs/keystone/pull/6777) [`30fc08b51`](https://github.com/keystonejs/keystone/commit/30fc08b515e4f8851fd2583a265a813c683bf604) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed the home page of the Admin UI not respecting `ui.hideCreate`

* [#6790](https://github.com/keystonejs/keystone/pull/6790) [`f683dcfe3`](https://github.com/keystonejs/keystone/commit/f683dcfe37d013b3d17f1fbad3df335b2f2ee51c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Readonly arrays are now accepted where previously mutable arrays were required. This means that if you use `as const` when writing an array and then pass it to various APIs in keystone, that will now work.

- [#6837](https://github.com/keystonejs/keystone/pull/6837) [`db7f2311b`](https://github.com/keystonejs/keystone/commit/db7f2311bb2ff8e1e70350cd0f087439b8404a8a) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed bug in LinkToRelatedItems button for double sided relationships

* [#6804](https://github.com/keystonejs/keystone/pull/6804) [`023bc7a0b`](https://github.com/keystonejs/keystone/commit/023bc7a0b1e6fb0ebdc5055f0243d9dad255a667) Thanks [@renovate](https://github.com/apps/renovate)! - Update prisma monorepo to [v3.3.0 (minor)](https://github.com/prisma/prisma/releases/tag/3.3.0)

- [#6839](https://github.com/keystonejs/keystone/pull/6839) [`d1141ea82`](https://github.com/keystonejs/keystone/commit/d1141ea8235bca4ce88500991c24b962b06ade45) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed overfetching, not filtering by the search and erroring when an id is searched for in the relationship select UI.

* [#6843](https://github.com/keystonejs/keystone/pull/6843) [`d107a5bec`](https://github.com/keystonejs/keystone/commit/d107a5becdd16245caf208c3979965fa926e484c) Thanks [@dcousens](https://github.com/dcousens)! - - We have bumped `memoize-one` to [`v6.0.0`](https://github.com/alexreardon/`/releases/tag/v6.0.0), the only breaking changes for the package were related to Typescript (please see the release notes)

- [#6853](https://github.com/keystonejs/keystone/pull/6853) [`44cbef543`](https://github.com/keystonejs/keystone/commit/44cbef5435081311acb9e68dd750f1ca289b8221) Thanks [@lukebennett88](https://github.com/lukebennett88)! - Updated minor typos in GraphQL errors

## 26.1.1

### Patch Changes

- [#6774](https://github.com/keystonejs/keystone/pull/6774) [`d67066e6d`](https://github.com/keystonejs/keystone/commit/d67066e6d6bc46119279f5e382581d46658cb39d) Thanks [@bladey](https://github.com/bladey)! - Fixed `text`, `integer`, `float` and `decimal` on the item view when using `ui.itemView.fieldMode: 'read'`.

## 26.1.0

### Minor Changes

- [#6746](https://github.com/keystonejs/keystone/pull/6746) [`d64bd4a7f`](https://github.com/keystonejs/keystone/commit/d64bd4a7f3da87e13e9cac41f0eb9757b771835f) Thanks [@timleslie](https://github.com/timleslie)! - The following config functions now also access a `context` argument:
  - `list.ui.isHidden`
  - `list.ui.hideCreate`
  - `list.ui.hideDelete`
  - `list.ui.createView.defaultFieldMode`
  - `list.ui.itemView.defaultFieldMode`
  - `list.ui.listView.defaultFieldMode`
  - `field.ui.createView.fieldMode`
  - `field.ui.itemView.fieldMode`
  - `field.ui.listView.fieldMode`

* [#6743](https://github.com/keystonejs/keystone/pull/6743) [`abeceaf90`](https://github.com/keystonejs/keystone/commit/abeceaf902c231aabe9cf3a383ecf29c09b8f4dd) Thanks [@timleslie](https://github.com/timleslie)! - Added custom error codes to all GraphQL errors to support easier debugging and processing of errors.

### Patch Changes

- [#6732](https://github.com/keystonejs/keystone/pull/6732) [`73544fd19`](https://github.com/keystonejs/keystone/commit/73544fd19b865be9fbf3ea9ae68fae5f039eb13f) Thanks [@timleslie](https://github.com/timleslie)! - Improved the error messages for user input errors on relationships in update/create operations.

* [#6744](https://github.com/keystonejs/keystone/pull/6744) [`0ef1ee3cc`](https://github.com/keystonejs/keystone/commit/0ef1ee3ccd99f0f3e1f955f03d00b1a0f238c7cd) Thanks [@bladey](https://github.com/bladey)! - Renamed branch `master` to `main`.

- [#6737](https://github.com/keystonejs/keystone/pull/6737) [`930b7129f`](https://github.com/keystonejs/keystone/commit/930b7129f37beb396bb8ecc8a8dc9f1b3615a7e0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improved dev startup performance

* [#6727](https://github.com/keystonejs/keystone/pull/6727) [`fac96cbd1`](https://github.com/keystonejs/keystone/commit/fac96cbd14febcc01bdffbecd1aceee391f6a20a) Thanks [@timleslie](https://github.com/timleslie)! - Improved error messages when using the items and DB APIs.

- [#6729](https://github.com/keystonejs/keystone/pull/6729) [`3d289eb3d`](https://github.com/keystonejs/keystone/commit/3d289eb3d00c3e6a0c26ce962fb0f942a08c400a) Thanks [@timleslie](https://github.com/timleslie)! - Improved the error message when trying to perform a `connect` operation on a missing/access denied ID.

* [#6754](https://github.com/keystonejs/keystone/pull/6754) [`bed3a560a`](https://github.com/keystonejs/keystone/commit/bed3a560a59d4fe787f3beebd65f8148453aae35) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated dist filenames

- [#6737](https://github.com/keystonejs/keystone/pull/6737) [`930b7129f`](https://github.com/keystonejs/keystone/commit/930b7129f37beb396bb8ecc8a8dc9f1b3615a7e0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Keystone will now consistently not respect a custom Babel config if it exists rather than the previous behaviour of respecting it in some commands but not for compilations from `keystone-next build` that are run with `keystone-next start`

* [#6721](https://github.com/keystonejs/keystone/pull/6721) [`6e4a0cf56`](https://github.com/keystonejs/keystone/commit/6e4a0cf56ce35b2446db7970763c55446de3db0e) Thanks [@timleslie](https://github.com/timleslie)! - Improved error messages when updating/creating relationship fields.

- [#6719](https://github.com/keystonejs/keystone/pull/6719) [`704f68b38`](https://github.com/keystonejs/keystone/commit/704f68b38f970860137380e21c36e04d2c51a7a4) Thanks [@renovate](https://github.com/apps/renovate)! - Upgraded Prisma monorepo packages to [3.2.0](https://github.com/prisma/prisma/releases/tag/3.2.0).

* [#6738](https://github.com/keystonejs/keystone/pull/6738) [`576f341e6`](https://github.com/keystonejs/keystone/commit/576f341e61b31bbcf076ba70002d137c7b7ff9a9) Thanks [@timleslie](https://github.com/timleslie)! - Improved error messages when to-many relationship update/create operations fail.

* Updated dependencies [[`0ef1ee3cc`](https://github.com/keystonejs/keystone/commit/0ef1ee3ccd99f0f3e1f955f03d00b1a0f238c7cd), [`bed3a560a`](https://github.com/keystonejs/keystone/commit/bed3a560a59d4fe787f3beebd65f8148453aae35)]:
  - @keystone-ui/button@5.0.2
  - @keystone-ui/core@3.2.1
  - @keystone-ui/fields@5.0.1
  - @keystone-ui/icons@4.0.2
  - @keystone-ui/loading@4.0.2
  - @keystone-ui/modals@4.0.2
  - @keystone-ui/notice@4.1.1
  - @keystone-ui/options@4.0.4
  - @keystone-ui/pill@5.0.2
  - @keystone-ui/popover@4.0.5
  - @keystone-ui/segmented-control@5.0.1
  - @keystone-ui/toast@4.0.4
  - @keystone-ui/tooltip@4.0.3

## 26.0.1

### Patch Changes

- [#6711](https://github.com/keystonejs/keystone/pull/6711) [`1a0614351`](https://github.com/keystonejs/keystone/commit/1a0614351808d4cb024840308fcc8288860e1de5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix `KeystoneContext` type exported from `.keystone/types`

## 26.0.0

### Major Changes

- [#6680](https://github.com/keystonejs/keystone/pull/6680) [`5c0163e09`](https://github.com/keystonejs/keystone/commit/5c0163e0973e5fee9b1e2c2b1f2834284858a509) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the `originalInput` argument for access control functions to `inputData`.

* [#6638](https://github.com/keystonejs/keystone/pull/6638) [`7f5caff60`](https://github.com/keystonejs/keystone/commit/7f5caff60308112ded832db4703f33eaae00ce24) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - In the `select` field, `dataType` has been renamed to `type`, `defaultValue` is now a static value and `isRequired` has moved to `validation.isRequired`. The `select` field can also be made non-nullable at the database-level with the `db.isNullable` option which defaults to `validation.isRequired ? false : true`. `graphql.read.isNonNull` can also be set if the field is non-nullable in the database and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable. The `select` can now also be cleared in the Admin UI when `ui.displayMode` is `segmented-control`.

- [#6663](https://github.com/keystonejs/keystone/pull/6663) [`480c875d1`](https://github.com/keystonejs/keystone/commit/480c875d11700f9eb23f403a5bb277aa94c38ce7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - In the `decimal` field, `defaultValue` is now a static number written as a string, `isRequired` has moved to `validation.isRequired` and now also requires the input isn't `NaN`, along with new `validation.min` and `validation.max` options. The `decimal` field can also be made non-nullable at the database-level with the `db.isNullable` option which defaults to `validation.isRequired ? false : true`. `graphql.read.isNonNull` can also be set if the field is non-nullable in the database and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable.

* [#6409](https://github.com/keystonejs/keystone/pull/6409) [`3ece149e5`](https://github.com/keystonejs/keystone/commit/3ece149e53066661c57c56fdd1467003c5b11c06) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded Apollo Server to [Version 3](https://www.apollographql.com/docs/apollo-server/migration/).

  The Apollo documentation contains a full list of breaking changes introduced by this update.
  You can configure the Apollo Server provided by Keystone using the [`graphql.apolloConfig`](https://keystonejs.com/docs/apis/config#graphql) configuration option.

  The most prominant change for most users will be that the GraphQL Playground has been replaced by the Apollo Sandbox.
  If you prefer to keep the GraphQL Playground, you can configure your server by [following these instructions](https://www.apollographql.com/docs/apollo-server/migration/#graphql-playground).

- [#6587](https://github.com/keystonejs/keystone/pull/6587) [`8bbba49c7`](https://github.com/keystonejs/keystone/commit/8bbba49c74fd4b7cf2560613c9cf6bcaddb11a6f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `KeystoneAdminUIFieldMeta.isOrderable` and `KeystoneAdminUIFieldMeta.isFilterable` fields are no longer statically resolvable and will now take into account the context/session. This also means `isOrderable` and `isFilterable` are no longer accessible on `useList().fields[fieldKey].isOrderable/isFilterable`, they can be fetched through GraphQL if you need them in the Admin UI.

* [#6607](https://github.com/keystonejs/keystone/pull/6607) [`42268ee72`](https://github.com/keystonejs/keystone/commit/42268ee72707e94a6197607d24534a438b748649) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `isRequired` and `defaultValue` can no longer be dynamic in the `json` field. If you were using `isRequired`, the same behaviour can be re-created with the `validateInput` hook.

- [#6461](https://github.com/keystonejs/keystone/pull/6461) [`e81947d6c`](https://github.com/keystonejs/keystone/commit/e81947d6ccb0b541387519898fdbbf09274d4c9f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - In the `text` field, `defaultValue` is now a static value, `isRequired` has moved to `validation.isRequired` and also requires that the value has a length of at least one, along with new `validation.lenght.min`, `validation.length.max` and `validation.match` options. The `text` field is also now non-nullable at the database-level by default and can be made nullable by setting the `db.isNullable` option to `true`. `graphql.read.isNonNull` can also be set if the field does not have `db.isNullable: true` and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable.

* [#6691](https://github.com/keystonejs/keystone/pull/6691) [`5d3fc0b77`](https://github.com/keystonejs/keystone/commit/5d3fc0b77c92efc69d725f943626d8d76a28e799) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `__legacy` property from field type implementations

- [#6518](https://github.com/keystonejs/keystone/pull/6518) [`0218a4215`](https://github.com/keystonejs/keystone/commit/0218a421576fb3ceb38eb5f38223a9ef0af4c4d2) Thanks [@timleslie](https://github.com/timleslie)! - Removed the deprecated `config.db.adapter` option. Please use `config.db.provider` to indicate the database provider for your system.

* [#6684](https://github.com/keystonejs/keystone/pull/6684) [`14bfa8a9b`](https://github.com/keystonejs/keystone/commit/14bfa8a9b33fae4c5eb3664ca23bb88850df5e50) Thanks [@timleslie](https://github.com/timleslie)! - \* Consolidated the `beforeChange`/`beforeDelete` and `afterChange`/`afterDelete` hooks into `beforeOperation` and `afterOperation`.

  - Renamed the `existingItem` argument for all hooks (except `afterOperation`) to `item`.
  - Renamed the `existingItem` argument for `afterOperation` to `originalItem`.
  - Renamed the `updatedItem` argument for `afterOperation` to `item`.

  See the [Hooks API docs](https://keystonejs.com/docs/apis/hooks) for a complete reference for the updated API.

- [#6535](https://github.com/keystonejs/keystone/pull/6535) [`581e130cf`](https://github.com/keystonejs/keystone/commit/581e130cf2a833c2b363801a32f4791bc1c7c62c) Thanks [@timleslie](https://github.com/timleslie)! - The API `context.lists` has been renamed to `context.query`, and `context.db.lists` has been renamed to `context.db`.

  When using the experimental option `config.experimental.generateNodeAPI`, the `api` module now exports `query` rather than `lists`.

* [#6674](https://github.com/keystonejs/keystone/pull/6674) [`f963966ab`](https://github.com/keystonejs/keystone/commit/f963966ab138a315a8f18d83ed7a676f7423a51d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - In the `timestamp` field, `defaultValue` is now a static date time value in an ISO8601 string or `{ kind: 'now' }` and `isRequired` has moved to `validation.isRequired`. The `timestamp` field can also be made non-nullable at the database-level with the `db.isNullable` option which defaults to `validation.isRequired ? false : true`. `graphql.read.isNonNull` can also be set if the field is non-nullable in the database and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable. The field can also be automatically set to the current time on a create/update by setting `db.updatedAt: true`, this will add Prisma's `@updatedAt` attribute to the field. The `timestamp` field also now uses a custom GraphQL scalar type named `DateTime` which requires inputs as full ISO8601 date-time strings such as `"2021-01-30T00:00:00.000Z"`, using `new Date().toISOString()` will give you a string in the correct format.

- [#6683](https://github.com/keystonejs/keystone/pull/6683) [`b76974736`](https://github.com/keystonejs/keystone/commit/b76974736132a71d693b3e325ffa009d395840a4) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - In the `password` field, `defaultValue` has been removed, `isRequired` has moved to `validation.isRequired`, `rejectCommon` has moved to `validation.rejectCommon`, `minLength` has moved to `validation.length.min` along with with the new `validation.length.max` and `validation.match` options. The `password` field can also be made non-nullable at the database-level with the `db.isNullable` option which defaults to `validation.isRequired ? false : true`. Also, providing `''` to the field will now result in an error instead of silently setting null. `validation.length.min` also must be `1` or above, though it still defaults to `8`. If `workFactor` is outside of the range of `6` to `31`, an error will now be thrown instead of the previous behaviour of clamping the value to `4` to `31` and warning if it's below `6`.

* [#6542](https://github.com/keystonejs/keystone/pull/6542) [`47c8b53ce`](https://github.com/keystonejs/keystone/commit/47c8b53ce44b7ad34ba40501a257a2b679cdee05) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `createSchema` function, you can remove the call to `createSchema` and pass the lists directly to the `lists` property

- [#6520](https://github.com/keystonejs/keystone/pull/6520) [`1b0a2f516`](https://github.com/keystonejs/keystone/commit/1b0a2f516d7d9ffce2e470dcd9ea870a3274500b) Thanks [@timleslie](https://github.com/timleslie)! - Removed `context.schemaName` from the `context` object. This value was an internal API which is no longer required.

* [#6689](https://github.com/keystonejs/keystone/pull/6689) [`67492f37d`](https://github.com/keystonejs/keystone/commit/67492f37dd9fbcd94234c15a072e9c826fa7a665) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `graphql` export of `@keystone-next/keystone/types` to `@keystone-next/keystone`

- [#6656](https://github.com/keystonejs/keystone/pull/6656) [`002e1d88b`](https://github.com/keystonejs/keystone/commit/002e1d88b0908c2e1215c1181724b2bc1cc57538) Thanks [@Noviny](https://github.com/Noviny)! - In the `float` field, `defaultValue` is now a static number, `isRequired` has moved to `validation.isRequired`, along with new `validation.min` and `validation.max` options. The `float` field can also be made non-nullable at the database-level with the `db.isNullable` option which defaults to `validation.isRequired ? false : true`. `graphql.read.isNonNull` can also be set if the field is non-nullable in the database and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable.

* [#6490](https://github.com/keystonejs/keystone/pull/6490) [`ca48072b4`](https://github.com/keystonejs/keystone/commit/ca48072b4d137e879e328c93b703a8364562db8a) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma package dependencies to `3.0.2`. See the [Prisma release notes](https://github.com/prisma/prisma/releases/tag/3.0.1) for full details of the changes.

  Note that Keystone continues to use the "binary" query engine, rather than the new "node-API" query engine, which is now the Prisma default. We are still performing tests to ensure that the node-API query engine will work well with Keystone.

- [#6588](https://github.com/keystonejs/keystone/pull/6588) [`3b9732acd`](https://github.com/keystonejs/keystone/commit/3b9732acd8cd597fa9c70128a2e7129ed02e6775) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - In the `integer` field, `defaultValue` is now a static number or `{ kind: 'autoincrement' }`, `isRequired` has moved to `validation.isRequired`, along with new `validation.min` and `validation.max` options. The `integer` field can also be made non-nullable at the database-level with the `db.isNullable` option which defaults to `validation.isRequired ? false : true`. `graphql.read.isNonNull` can also be set if the field is non-nullable in the database and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable.

  The `autoIncrement` field has also been removed, use the integer field with a `defaultValue` of `{ kind: 'autoincrement' }`

* [#6448](https://github.com/keystonejs/keystone/pull/6448) [`c2b124f8e`](https://github.com/keystonejs/keystone/commit/c2b124f8e4b283022ec473d9e5f32f37de639cf0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `checkbox` field is now non-nullable in the database, if you need three states, you should use `select()`. The field no longer accepts dynamic default values and it will default to `false` unless a different `defaultValue` is specified. `graphql.read.isNonNull` can also be set if you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable.

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

- [#6513](https://github.com/keystonejs/keystone/pull/6513) [`4048991ba`](https://github.com/keystonejs/keystone/commit/4048991ba7db234a694287000beaf2ea052cd24e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `isRequired` and `defaultValue` from the `image` and `file` fields. If you were using these options, the same behaviour can be re-created with the `validateInput` and `resolveInput` hooks respectively.

* [#6514](https://github.com/keystonejs/keystone/pull/6514) [`79e2cc3aa`](https://github.com/keystonejs/keystone/commit/79e2cc3aa79a90358a6ce1281a8ad5f5632ac185) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `defaultValue` and the undocumented `withMeta` option from the `relationship` field. To re-create `defaultValue`, you can use `resolveInput` though note that if you're using autoincrement ids, you need to return the id as number, not a string like you would provide to GraphQL, e.g. `{ connect: { id: 1 } }` rather than `{ connect: { id: "1" } }`. If you were using `withMeta: false`, please open an issue with your use case.

- [#6707](https://github.com/keystonejs/keystone/pull/6707) [`1f952fb10`](https://github.com/keystonejs/keystone/commit/1f952fb10710b7fae6a88112310b25a09ab330ea) Thanks [@timleslie](https://github.com/timleslie)! - Changed the default for `defaultIsFilterable` and `defaultIsOrderable` from `false` to `true`. This means that all fields are filterable and orderable by default. Filtering can be disabled by setting either `defaultIsFilterable: false` at the list level, or `isFilterable: false` at the field level. Ordering can be disabled by setting either `defaultIsOrderable: false` at the list level, or `isOrderable: false` at the field level.

* [#6520](https://github.com/keystonejs/keystone/pull/6520) [`1b0a2f516`](https://github.com/keystonejs/keystone/commit/1b0a2f516d7d9ffce2e470dcd9ea870a3274500b) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the `skipAccessControl` argument to `createContext` to `sudo` for consistency with `context.sudo()`.

- [#6538](https://github.com/keystonejs/keystone/pull/6538) [`4e485a914`](https://github.com/keystonejs/keystone/commit/4e485a914cfbc6c4b5ef9eeca9157bf654469b2d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed `graphQLReturnFragment` to `ui.query` in the virtual field options. The virtual field now checks if `ui.query` is required for the GraphQL output type, and throws an error if it is missing. If you don't want want the Admin UI to fetch the field, you can set `ui.itemView.fieldMode` and `ui.listView.fieldMode` to `'hidden'` instead of providing `ui.query`.

* [#6490](https://github.com/keystonejs/keystone/pull/6490) [`ca48072b4`](https://github.com/keystonejs/keystone/commit/ca48072b4d137e879e328c93b703a8364562db8a) Thanks [@renovate](https://github.com/apps/renovate)! - Removed `filters.postgresql.Json` export from `@keystone-next/keystone/types`. Note this is unrelated to the `json` field type. The `json` field type did not have filters and still does not.

- [#6681](https://github.com/keystonejs/keystone/pull/6681) [`c8aca958b`](https://github.com/keystonejs/keystone/commit/c8aca958b3650f10011370e0c00b01cb681bb212) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the `originalInput` argument for hook functions to `inputData`.

* [#6519](https://github.com/keystonejs/keystone/pull/6519) [`838845298`](https://github.com/keystonejs/keystone/commit/8388452982277b10c65ff89be442464761a680a7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The Admin UI will skip fetching fields that have a statically set `itemView.fieldMode: 'hidden'` on the item view. The `id` argument to the `KeystoneAdminUIFieldMeta.itemView` GraphQL field can now be omitted which will make `KeystoneAdminUIFieldMetaItemView.fieldMode` return null when there isn't a static field mode. The `itemView` also no longer uses a sudo context when fetching the item in the `KeystoneAdminUIFieldMetaItemView.fieldMode`. Previously, if someone had access to the Admin UI(`ui.isAccessAllowed`) and a field had a `itemView.fieldMode` function that used the `item` argument, someone could bypass access control to determine whether or not an item with a given id exists.

### Minor Changes

- [#6560](https://github.com/keystonejs/keystone/pull/6560) [`a95da1d81`](https://github.com/keystonejs/keystone/commit/a95da1d812574fd17d1fa8bc324415da558a9d9d) Thanks [@timleslie](https://github.com/timleslie)! - Added support for dynamic `isFilterable` and `isOrderable` field config values. If a function is provided for these config option, it will be dynamically evaluated each time the field is used for filtering and ordering, and an error will be returned if the function returns `false`.

* [#6574](https://github.com/keystonejs/keystone/pull/6574) [`3ee4542a8`](https://github.com/keystonejs/keystone/commit/3ee4542a884d8135299178950ab47bb82907bcd9) Thanks [@Nikitoring](https://github.com/Nikitoring)! - Added support for [Prisma preview features](https://www.prisma.io/docs/concepts/components/preview-features) via the `config.db.prismaPreviewFeatures` configuration option.

- [#6608](https://github.com/keystonejs/keystone/pull/6608) [`e747ef6f3`](https://github.com/keystonejs/keystone/commit/e747ef6f31590799fa332e1f011b160a443fbeb4) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - \* Added Filter functionality to relationships.
  - Added `portalMenu` prop to the RelationshipSelect and updated it to **not** portal the menu by default.

* [#6616](https://github.com/keystonejs/keystone/pull/6616) [`232c512a0`](https://github.com/keystonejs/keystone/commit/232c512a05250cb8a9c26b70969afe4106e2f8ac) Thanks [@timleslie](https://github.com/timleslie)! - Added a `createContext` argument to the `config.server.extendExpressApp` option, allowing access to the full context API.

- [#6564](https://github.com/keystonejs/keystone/pull/6564) [`b6c8c3bff`](https://github.com/keystonejs/keystone/commit/b6c8c3bff9d3d98f743c47c015ae27e63db0271e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `dbFieldConfig` parameter to `jsonFieldTypePolyfilledForSQLite`

### Patch Changes

- [#6591](https://github.com/keystonejs/keystone/pull/6591) [`d0e3c087e`](https://github.com/keystonejs/keystone/commit/d0e3c087e49310774b9538dfa5d2432c00381db0) Thanks [@timleslie](https://github.com/timleslie)! - Improved the error message returned when access is denied.

* [#6685](https://github.com/keystonejs/keystone/pull/6685) [`21c5d1aa9`](https://github.com/keystonejs/keystone/commit/21c5d1aa964a19657d4ba7eb913e8ca292bf1714) Thanks [@timleslie](https://github.com/timleslie)! - Updated field-type resolver error handling to catch and group errors from all fields.

- [#6524](https://github.com/keystonejs/keystone/pull/6524) [`d9e18613a`](https://github.com/keystonejs/keystone/commit/d9e18613a4136f1c1201a197e47d9d4bde292cd2) Thanks [@timleslie](https://github.com/timleslie)! - Updated system setup to only check for a valid `config.db.provider` once during `initConfig`.

* [#6508](https://github.com/keystonejs/keystone/pull/6508) [`3cfc2a383`](https://github.com/keystonejs/keystone/commit/3cfc2a3839142dd3ccdbf1dd86768257e9acc0dc) Thanks [@JedWatson](https://github.com/JedWatson)! - Add Margin to error messages in the Admin UI Item Form

- [#6532](https://github.com/keystonejs/keystone/pull/6532) [`1da120a38`](https://github.com/keystonejs/keystone/commit/1da120a388a80585e897a06b81b027b7d8011902) Thanks [@bladey](https://github.com/bladey)! - Updated schema export message to accurately reflect required import changes.

* [#6559](https://github.com/keystonejs/keystone/pull/6559) [`499c00b44`](https://github.com/keystonejs/keystone/commit/499c00b44b4b378285ed21a385da799b4af0af82) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed unnecessary dependency on `typescript`

- [#6678](https://github.com/keystonejs/keystone/pull/6678) [`eb1a89f3c`](https://github.com/keystonejs/keystone/commit/eb1a89f3c13d4e80516cc372cef3dc505ef864f3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed returning filters like `{ NOT: [{ name: { equals: 'blah' } }] }` from filter access control and improve error messages when returning bad filters from filter access control

* [#6639](https://github.com/keystonejs/keystone/pull/6639) [`4da935870`](https://github.com/keystonejs/keystone/commit/4da935870374414e83900949cc70fce0d4b6de19) Thanks [@timleslie](https://github.com/timleslie)! - Improved query generation performance when querying single relationships without filter-based access control.

- [#6565](https://github.com/keystonejs/keystone/pull/6565) [`1faddea9d`](https://github.com/keystonejs/keystone/commit/1faddea9d285c70d2d867958bc5ab2bbfb44dbd6) Thanks [@timleslie](https://github.com/timleslie)! - Updated error messages to indicate user input errors.

* [#6571](https://github.com/keystonejs/keystone/pull/6571) [`7de13bce3`](https://github.com/keystonejs/keystone/commit/7de13bce32630ee2478a9894e801020c520c64a9) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed pagination bug on deletion of items.

- [#6537](https://github.com/keystonejs/keystone/pull/6537) [`271e5d97b`](https://github.com/keystonejs/keystone/commit/271e5d97bc2e4548ce039a568278f9f7569aa41a) Thanks [@timleslie](https://github.com/timleslie)! - Renamed internal function `checkOperationAccess` to `getOperationAccess`.

* [#6592](https://github.com/keystonejs/keystone/pull/6592) [`273ee446a`](https://github.com/keystonejs/keystone/commit/273ee446a6d3e22c4d01c530d33282df362a6f1b) Thanks [@timleslie](https://github.com/timleslie)! - Removed check for access denied on count operations in the Admin UI databoard queries, as these errors are no longer returned.

- [#6587](https://github.com/keystonejs/keystone/pull/6587) [`8bbba49c7`](https://github.com/keystonejs/keystone/commit/8bbba49c74fd4b7cf2560613c9cf6bcaddb11a6f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `@keystone-next/keystone/testing` not respecting Admin UI config

* [#6526](https://github.com/keystonejs/keystone/pull/6526) [`a645861a9`](https://github.com/keystonejs/keystone/commit/a645861a9562748cf3e9786e37acea67c4a0cc17) Thanks [@bladey](https://github.com/bladey)! - Fixed Relationship field inline connect throwing 400 errors when selecting a value.

- [#6672](https://github.com/keystonejs/keystone/pull/6672) [`689d8ecaa`](https://github.com/keystonejs/keystone/commit/689d8ecaa9e93eedc80084aafc319a0396efc593) Thanks [@timleslie](https://github.com/timleslie)! - Improved the error messages provided from the GraphQL API when extension code (e.g access control functions, hooks, etc) throw exceptions.

* [#6487](https://github.com/keystonejs/keystone/pull/6487) [`144f7f8e4`](https://github.com/keystonejs/keystone/commit/144f7f8e4e13ec547865927cb224fea7165b98b7) Thanks [@timleslie](https://github.com/timleslie)! - Fixed type definition of `ValidationArgs['addValidationError']`.

- [#6481](https://github.com/keystonejs/keystone/pull/6481) [`7621d0db7`](https://github.com/keystonejs/keystone/commit/7621d0db75033b68a510d5f6c9b03d9418980e73) Thanks [@gautamsi](https://github.com/gautamsi)! - Exported Field types to help in updating contrib packages

* [#6500](https://github.com/keystonejs/keystone/pull/6500) [`10c61bd44`](https://github.com/keystonejs/keystone/commit/10c61bd44176ffa7d0e446c28fd9f12ed54790f0) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug in `context.db` API when finding items that don't exist.

- [#6482](https://github.com/keystonejs/keystone/pull/6482) [`1659e1fe5`](https://github.com/keystonejs/keystone/commit/1659e1fe5e0f394df058b3a773ea62bf392fa8db) Thanks [@timleslie](https://github.com/timleslie)! - Cleaned up the formatting of GraphQL error messages result from Prisma errors.

* [#6521](https://github.com/keystonejs/keystone/pull/6521) [`e84f8f655`](https://github.com/keystonejs/keystone/commit/e84f8f6550cff4fbca69982e0371d787e67c8915) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused `BaseKeystone` type.

- [#6625](https://github.com/keystonejs/keystone/pull/6625) [`5e62702ba`](https://github.com/keystonejs/keystone/commit/5e62702ba3934bf8effb5dce65466017dd868610) Thanks [@renovate](https://github.com/apps/renovate)! - Update Prisma dependency to `3.1.1`.

* [#6664](https://github.com/keystonejs/keystone/pull/6664) [`b00596d3f`](https://github.com/keystonejs/keystone/commit/b00596d3f8b64cddc46ec9e5e4e567dd67264253) Thanks [@timleslie](https://github.com/timleslie)! - Improved error messages when access control functions return invalid values.

- [#6530](https://github.com/keystonejs/keystone/pull/6530) [`80cd31303`](https://github.com/keystonejs/keystone/commit/80cd313033b339d90b5e640b252a357a4d60fbcd) Thanks [@gautamsi](https://github.com/gautamsi)! - Fixed remaining windows issue where it creates invalid import path. This removes some duplicate code which caused this.

* [#6667](https://github.com/keystonejs/keystone/pull/6667) [`8631917d1`](https://github.com/keystonejs/keystone/commit/8631917d14778468652abb8eda06802d2469646c) Thanks [@timleslie](https://github.com/timleslie)! - Simplified logic of validation hook execution code.

- [#6512](https://github.com/keystonejs/keystone/pull/6512) [`bf5874411`](https://github.com/keystonejs/keystone/commit/bf58744118320493325b3b48aadd007e12d5c680) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed lists with `graphql.omit: ['query']` causing issues in the Admin UI.

* [#6505](https://github.com/keystonejs/keystone/pull/6505) [`398c08529`](https://github.com/keystonejs/keystone/commit/398c085295d992658a9e7e22aae037f55528c258) Thanks [@timleslie](https://github.com/timleslie)! - Improved error message for bad relationship filter inputs.

- [#6627](https://github.com/keystonejs/keystone/pull/6627) [`47cee8c95`](https://github.com/keystonejs/keystone/commit/47cee8c952c1134e503bff54e61dcd48c76b5429) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Keystone Cloud assets integration has been fixed

* [#6523](https://github.com/keystonejs/keystone/pull/6523) [`9f0a4cc1f`](https://github.com/keystonejs/keystone/commit/9f0a4cc1f6d5133e92a0d326e285152d18689173) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The item view page will only fetch the item once to determine the field modes rather than once per field.

- [#6617](https://github.com/keystonejs/keystone/pull/6617) [`11fb46c91`](https://github.com/keystonejs/keystone/commit/11fb46c918e508cc182d5bd22f069b9329edadba) Thanks [@Noviny](https://github.com/Noviny)! - Improved messaging around keystone startup a little

- Updated dependencies [[`3cfc2a383`](https://github.com/keystonejs/keystone/commit/3cfc2a3839142dd3ccdbf1dd86768257e9acc0dc), [`6d3798fdb`](https://github.com/keystonejs/keystone/commit/6d3798fdbd0a9f1567821e90b7176cf7dd208fda), [`f963966ab`](https://github.com/keystonejs/keystone/commit/f963966ab138a315a8f18d83ed7a676f7423a51d), [`7f5caff60`](https://github.com/keystonejs/keystone/commit/7f5caff60308112ded832db4703f33eaae00ce24), [`409fd04b8`](https://github.com/keystonejs/keystone/commit/409fd04b8c8b9a847ec288972dc8918c7604f011)]:
  - @keystone-ui/notice@4.1.0
  - @keystone-ui/popover@4.0.4
  - @keystone-ui/fields@5.0.0
  - @keystone-ui/segmented-control@5.0.0
  - @keystone-ui/options@4.0.3

## 25.0.4

### Patch Changes

- [`7e0cae544`](https://github.com/keystonejs/keystone/commit/7e0cae54484b19c6adb267e1fda3cbc4058c0381) Thanks [@timleslie](https://github.com/timleslie)! - Keystone Cloud assets integration has been fixed

## 25.0.3

### Patch Changes

- [`7b7956428`](https://github.com/keystonejs/keystone/commit/7b795642803fbd4586ca28c9d398a5735f5964d4) Thanks [@timleslie](https://github.com/timleslie)! - Fixed Relationship field inline connect throwing 400 errors when selecting a value.

## 25.0.2

### Patch Changes

- [#6507](https://github.com/keystonejs/keystone/pull/6507) [`847f6f046`](https://github.com/keystonejs/keystone/commit/847f6f04691e6a4847fea6f89de18675254e8845) Thanks [@timleslie](https://github.com/timleslie)! - Fixed an issue where the incorrect value for the `operation` argument was passed into field-level access control functions. Keystone now correctly passes in `'read'` rather than the incorrect `'query'`.

* [#6507](https://github.com/keystonejs/keystone/pull/6507) [`69b4332a7`](https://github.com/keystonejs/keystone/commit/69b4332a7bc39f9c4d3731002c4224e39a0660bd) Thanks [@timleslie](https://github.com/timleslie)! - Fixed windows issues with new view resolver from #6414.

- [#6507](https://github.com/keystonejs/keystone/pull/6507) [`b3a77c311`](https://github.com/keystonejs/keystone/commit/b3a77c31154990a3350fc0005d9d04812021cf0a) Thanks [@timleslie](https://github.com/timleslie)! - Fixed item form submitting an invalid request after saving returns errors

## 25.0.1

### Patch Changes

- [#6474](https://github.com/keystonejs/keystone/pull/6474) [`6205381b1`](https://github.com/keystonejs/keystone/commit/6205381b19041b88363a32e7ff13d606ba12a48e) Thanks [@timleslie](https://github.com/timleslie)! - Fixed typo in Admin UI.

## 25.0.0

### Major Changes

- [#6377](https://github.com/keystonejs/keystone/pull/6377) [`3008c5110`](https://github.com/keystonejs/keystone/commit/3008c5110a0ebc524eb3609bd8ba901f664f83d3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved exports of `@keystone-next/keystone` to `@keystone-next/keystone/system`

* [#6323](https://github.com/keystonejs/keystone/pull/6323) [`3904a9cf7`](https://github.com/keystonejs/keystone/commit/3904a9cf73e16ef192faae833f2f39ed05f2d707) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed unused legacy filter code

- [#6414](https://github.com/keystonejs/keystone/pull/6414) [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated to Next.js 11. If you were using a custom Babel config, it will no longer be respected because of changes in Next.js.

* [#6393](https://github.com/keystonejs/keystone/pull/6393) [`ee54522d5`](https://github.com/keystonejs/keystone/commit/ee54522d513a9376c1ed1e472a7ff91657e4e693) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `@graphql-ts/schema` to `0.3.0` and moved the `schema` export to `@keystone-next/keystone` entrypoint and renamed it to `graphql`. `bindSchemaAPIToContext` on the `graphql` export has also been renamed to `bindGraphQLSchemaAPIToContext`.

- [#6426](https://github.com/keystonejs/keystone/pull/6426) [`8f2786535`](https://github.com/keystonejs/keystone/commit/8f2786535272976678427fd13758e63b2c59d955) Thanks [@timleslie](https://github.com/timleslie)! - Update the Access Control API. This is a breaking change which impacts the security of all Keystone systems.

  See the [Access Control API](https://keystonejs.com/docs/apis/access-control) for a full description of the new API.

* [#6420](https://github.com/keystonejs/keystone/pull/6420) [`0aa02a333`](https://github.com/keystonejs/keystone/commit/0aa02a333d989c30647cd10e25325d4d2db61be6) Thanks [@timleslie](https://github.com/timleslie)! - Added the config option `graphql.omit` to list and field level configuration to control which types and operations are excluded from the GraphQL API. The use of a static `false` value in access control definitions no longer excludes operations from the GraphQL API.

- [#6455](https://github.com/keystonejs/keystone/pull/6455) [`bf9b5605f`](https://github.com/keystonejs/keystone/commit/bf9b5605fc684975d9e2cad604c8e0d978eac40a) Thanks [@timleslie](https://github.com/timleslie)! - The `fieldPath` argument to field hooks has been renamed to `fieldKey`. This makes the naming consistent with the Access Control APIs.

* [#6463](https://github.com/keystonejs/keystone/pull/6463) [`3957c0981`](https://github.com/keystonejs/keystone/commit/3957c098131b3b055cb94b07f1ce55ec82640908) Thanks [@JedWatson](https://github.com/JedWatson)! - The GraphQL API endpoint now starts up significantly faster in Dev.

  To facilitate this, `createExpressServer` no longer includes the step of creating the Admin UI Middleware, which changes its signature. `createAdminUIMiddleware` is now also exported from `@keystone-next/keystone/system`.

- [#6437](https://github.com/keystonejs/keystone/pull/6437) [`af5e59bf4`](https://github.com/keystonejs/keystone/commit/af5e59bf4215aa297495ae603239b1e3510be39b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed `isUnique: true` config in fields to `isIndexed: 'unique'`

* [#6420](https://github.com/keystonejs/keystone/pull/6420) [`0aa02a333`](https://github.com/keystonejs/keystone/commit/0aa02a333d989c30647cd10e25325d4d2db61be6) Thanks [@timleslie](https://github.com/timleslie)! - Filtering and ordering is no longer enabled by default, as they have the potential to expose data which would otherwise be protected by access control. To enable filtering and ordering you can set `isFilterable: true` and `isOrderable: true` on specific fields, or set `defaultIsFilterable: true` and `defaultIsOrderable: true` at the list level.

- [#6378](https://github.com/keystonejs/keystone/pull/6378) [`489e128fe`](https://github.com/keystonejs/keystone/commit/489e128fe0835968eda0908b199a8867c0e72a5b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved exports of `@keystone-next/keystone/schema` to `@keystone-next/keystone`

### Minor Changes

- [#6403](https://github.com/keystonejs/keystone/pull/6403) [`2a901a121`](https://github.com/keystonejs/keystone/commit/2a901a1210a0b3de0ccd22ca93e9cbcc8ed0f951) Thanks [@timleslie](https://github.com/timleslie)! - Added the experimental config option `config.experimental.contextInitialisedLists`, which adds the internal data structure `experimental.initialisedLists` to the `context` object. This is a temporary addition to the API which will be removed in a future release once a more controlled API is available. It should be used with caution, as it will contain breaking change in `patch` level releases.

* [#6371](https://github.com/keystonejs/keystone/pull/6371) [`44f2ef60e`](https://github.com/keystonejs/keystone/commit/44f2ef60e29912f3c85b91fc704e09a7d5a15b22) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/types` to `@keystone-next/keystone/types`

- [#6367](https://github.com/keystonejs/keystone/pull/6367) [`4f36a81af`](https://github.com/keystonejs/keystone/commit/4f36a81afb03591354acc1d0141eff8fe54ff208) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/admin-ui-utils` to `@keystone-next/keystone/admin-ui/utils`

* [#6361](https://github.com/keystonejs/keystone/pull/6361) [`595922b48`](https://github.com/keystonejs/keystone/commit/595922b48c909053fa9d34bb1c42177ad41c72d5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved exports of `@keystone-next/testing` to `@keystone-next/keystone/testing`

- [#6368](https://github.com/keystonejs/keystone/pull/6368) [`783290796`](https://github.com/keystonejs/keystone/commit/78329079606d74a2eedd63f96a985116bf0b449c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/utils` to `@keystone-next/keystone/fields/types/image/utils` for image ref related utilities and `@keystone-next/keystone/fields/types/file/utils` for file ref related utilities.

* [#6458](https://github.com/keystonejs/keystone/pull/6458) [`944bce1e8`](https://github.com/keystonejs/keystone/commit/944bce1e834be4d0f4c79f35cd53ccbabb92f555) Thanks [@timleslie](https://github.com/timleslie)! - Added the config option `config.graphql.path` to configure the endpoint of the GraphQL API (default `'/api/graphql'`).

- [#6467](https://github.com/keystonejs/keystone/pull/6467) [`e0f935eb2`](https://github.com/keystonejs/keystone/commit/e0f935eb2ef8ac311a43423c6691e56cd27b6bed) Thanks [@JedWatson](https://github.com/JedWatson)! - Add extendExpressApp config option for configuring the express app that Keystone creates

* [#6459](https://github.com/keystonejs/keystone/pull/6459) [`f2311781a`](https://github.com/keystonejs/keystone/commit/f2311781a990c0ccd3302ac8e7aa889138f70e47) Thanks [@timleslie](https://github.com/timleslie)! - Updated Navigation component to show docs and playground links irrespective of authentication.

- [#6362](https://github.com/keystonejs/keystone/pull/6362) [`fd744dcaa`](https://github.com/keystonejs/keystone/commit/fd744dcaa513efb2a8ae954bb2d5d1fa7f0723d6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/fields` to `@keystone-next/keystone/fields`

### Patch Changes

- [#6390](https://github.com/keystonejs/keystone/pull/6390) [`2e3f3666b`](https://github.com/keystonejs/keystone/commit/2e3f3666b5340b8eb778104a1d4a3f4d52be6528) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improved performance of create item modal with many fields

* [#6385](https://github.com/keystonejs/keystone/pull/6385) [`9651aff8e`](https://github.com/keystonejs/keystone/commit/9651aff8eb9a51c0fbda6f51b1be0fedb07571da) Thanks [@gautamsi](https://github.com/gautamsi)! - Fixed issue in Relationship field display mode 'count'. It was using `_fieldnameMeta.count` instead of `fieldnameCount`

- [#6422](https://github.com/keystonejs/keystone/pull/6422) [`9c5991f43`](https://github.com/keystonejs/keystone/commit/9c5991f43e8f909e576f6b51fd87aab3bbead504) Thanks [@timleslie](https://github.com/timleslie)! - Made cosmetic changes to the Admin UI code. No functional changes.

* [#6453](https://github.com/keystonejs/keystone/pull/6453) [`069265b9c`](https://github.com/keystonejs/keystone/commit/069265b9cdd5898f4501535793f56debaa247c1c) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Dashboard cards now enclosed in unordered list, for clearer semantics.

- [#6397](https://github.com/keystonejs/keystone/pull/6397) [`c76bfc0a2`](https://github.com/keystonejs/keystone/commit/c76bfc0a2ad5aeffb68b8d2006225f608e855a19) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added a comment in the `schema.prisma` and `schema.graphql` files explaining that they're generated and should not be modified manually.

* [#6391](https://github.com/keystonejs/keystone/pull/6391) [`bc9088f05`](https://github.com/keystonejs/keystone/commit/bc9088f0574af27be6a068483a789a80f7a46a41) Thanks [@bladey](https://github.com/bladey)! - Adds support for `introspection` in the Apollo Server config. Introspection enables you to query a GraphQL server for information about the underlying schema. If the playground is enabled then introspection is automatically enabled - unless specifically disabled.

- [#6414](https://github.com/keystonejs/keystone/pull/6414) [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated usages of `jsx` from `@keystone-ui/core` to explicitly use `/** @jsxRuntime classic */`

* [#6392](https://github.com/keystonejs/keystone/pull/6392) [`bd120c7c2`](https://github.com/keystonejs/keystone/commit/bd120c7c296c9adaaefe9bf93cbb384cc7528715) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed negative `take` values above the list's `graphql.queryLimits.maxResults` not causing an error before getting the values from the database.

- [#6381](https://github.com/keystonejs/keystone/pull/6381) [`b3eefc1c3`](https://github.com/keystonejs/keystone/commit/b3eefc1c336a9a366c39f7aa2cf5251baaf843fd) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed error from prisma when using `.keystone/api` from `generateNodeAPI` in a API route (`admin/pages/api/*`)

* [#6429](https://github.com/keystonejs/keystone/pull/6429) [`cbc5a68aa`](https://github.com/keystonejs/keystone/commit/cbc5a68aa7547ea55d1254ee5c3b1e543cdc78e2) Thanks [@timleslie](https://github.com/timleslie)! - Update adminMeta `fieldMode` resolvers to respect `graphql.omit` configuration.

- [#6414](https://github.com/keystonejs/keystone/pull/6414) [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed the way the package directory for resolving views is obtained to use `__dirname` rather than `require.resolve('pkg/package.json')` because in Next.js 11 `require.resolve` returns a numeric id instead of the path.

* [#6432](https://github.com/keystonejs/keystone/pull/6432) [`0a189d5d0`](https://github.com/keystonejs/keystone/commit/0a189d5d0e618ee5598e9beaccea0290d2a3f8d9) Thanks [@renovate](https://github.com/apps/renovate)! - Updated `typescript` dependency to `^4.4.2`.

- [#6412](https://github.com/keystonejs/keystone/pull/6412) [`2324fa027`](https://github.com/keystonejs/keystone/commit/2324fa027a6c2beabef4724c69a9ad05338a0cf3) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Merged aria-description text for dialogs on list view in Admin UI into their respective aria-labels.

* [#6462](https://github.com/keystonejs/keystone/pull/6462) [`88b03bd79`](https://github.com/keystonejs/keystone/commit/88b03bd79112c7d8f0d41c592c8bd4bb226f5f71) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed crashing the process when createContext() fails for Admin UI requests

- [#6354](https://github.com/keystonejs/keystone/pull/6354) [`5ceccd821`](https://github.com/keystonejs/keystone/commit/5ceccd821b513e2abec3eb24278e7c30bdcdf6d6) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed Listview checkbox bug in a better way.

* [#6433](https://github.com/keystonejs/keystone/pull/6433) [`bb0c6c626`](https://github.com/keystonejs/keystone/commit/bb0c6c62610eda20ae93a6b67185276bdbba3248) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.30.2`.

* Updated dependencies [[`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f), [`069265b9c`](https://github.com/keystonejs/keystone/commit/069265b9cdd5898f4501535793f56debaa247c1c)]:
  - @keystone-ui/button@5.0.1
  - @keystone-ui/core@3.2.0
  - @keystone-ui/fields@4.1.3
  - @keystone-ui/icons@4.0.1
  - @keystone-ui/loading@4.0.1
  - @keystone-ui/modals@4.0.1
  - @keystone-ui/notice@4.0.2
  - @keystone-ui/options@4.0.2
  - @keystone-ui/pill@5.0.1
  - @keystone-ui/popover@4.0.3
  - @keystone-ui/segmented-control@4.0.3
  - @keystone-ui/toast@4.0.3
  - @keystone-ui/tooltip@4.0.2

## 24.0.1

### Patch Changes

- [#6350](https://github.com/keystonejs/keystone/pull/6350) [`9ca1c41cd`](https://github.com/keystonejs/keystone/commit/9ca1c41cd6cc34b4cf4393abfbe2e4b43a275401) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed delete toast not leveraging labelField property.

## 24.0.0

### Major Changes

- [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `_ListKeyMeta` and `_toManyRelationshipFieldMeta` fields. You should use `listKeyCount` and `toManyRelationshipFieldCount` instead

* [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed all arguments from `context.lists.List.count` and `context.db.lists.List.count` except for `where`.

- [#6266](https://github.com/keystonejs/keystone/pull/6266) [`b696a9579`](https://github.com/keystonejs/keystone/commit/b696a9579b503db86f42776381e247c4e1a7409f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed `first` argument in find many queries to `take` to align with Prisma.

  ```graphql
  type Query {
    users(
      where: UserWhereInput! = {}
      orderBy: [UserOrderByInput!]! = []
      # previously was first: Int
      take: Int
      skip: Int! = 0
    ): [User!]
    # ...
  }

  type User {
    # ...
    posts(
      where: PostWhereInput! = {}
      orderBy: [PostOrderByInput!]! = []
      # previously was first: Int
      take: Int
      skip: Int! = 0
    ): [Post!]
    # ...
  }
  ```

* [#6208](https://github.com/keystonejs/keystone/pull/6208) [`092df6678`](https://github.com/keystonejs/keystone/commit/092df6678cea18d639be16ad250ec4ecc9250f5a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The create one mutation now requires a non-null `data` argument and the create many mutation accepts a list of `ItemCreateInput` directly instead of being nested inside of an object with the `ItemCreateInput` in a `data` field.

  If you have a list called `Item`, `createItem` now looks like `createItem(data: ItemCreateInput!): Item` and `createItems` now looks like `createItems(data: [ItemCreateInput!]!): [Item]`.

- [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `search` argument from the GraphQL API for finding many items, Lists/DB API and to-many relationship fields. You should use `contains` filters instead.

* [#6095](https://github.com/keystonejs/keystone/pull/6095) [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated filters to be nested instead of flattened and add top-level `NOT` operator. See the [Query Filter API docs](https://keystonejs.com/docs/apis/filters) and the upgrade guide for more information.

  ```graphql
  query {
    posts(where: { title: { contains: "Something" } }) {
      title
      content
    }
  }
  ```

- [#6198](https://github.com/keystonejs/keystone/pull/6198) [`9d361c1c8`](https://github.com/keystonejs/keystone/commit/9d361c1c8625e1390f837b7318b63547d686a63b) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `uid` and `name` properties from the errors returned by the GraphQL API.

* [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `sortBy` argument from the GraphQL API for finding many items, Lists/DB API and to-many relationship fields. You should use `orderBy` instead.

- [#6312](https://github.com/keystonejs/keystone/pull/6312) [`56044e2a4`](https://github.com/keystonejs/keystone/commit/56044e2a425f4256b66475fd3b1a6342cd6c3bf9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `@graphql-ts/schema`. The second type parameter of `schema.Arg` exported from `@keystone-next/types` is now a boolean that defines whether or not the arg has a default value to make it easier to define circular input objects.

* [#6217](https://github.com/keystonejs/keystone/pull/6217) [`874f2c405`](https://github.com/keystonejs/keystone/commit/874f2c4058c9cf006213e84b9ffcf39c5bf144e8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `disconnectAll` has been renamed to `disconnect` in to-one relationship inputs and the old `disconnect` field has been removed. There are also seperate input types for create and update where the input for create doesn't have `disconnect`. It's also now required that if you provide a to-one relationship input, you must provide exactly one field to the input.

  If you have a list called `Item`, the to-one relationship inputs now look like this:

  ```graphql
  input ItemRelateToOneForCreateInput {
    create: ItemCreateInput
    connect: ItemWhereUniqueInput
  }
  input ItemRelateToOneForUpdateInput {
    create: ItemCreateInput
    connect: ItemWhereUniqueInput
    disconnect: Boolean
  }
  ```

- [#6224](https://github.com/keystonejs/keystone/pull/6224) [`3564b342d`](https://github.com/keystonejs/keystone/commit/3564b342d6dc2127ae591d7ac055af9eae90543c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `disconnectAll` has been replaced by `set` in to-many relationship inputs, the equivalent to `disconnectAll: true` is now `set: []`. There are also seperate input types for create and update where the input for create doesn't have `disconnect` or `set`. The inputs in the lists in the input field are now also non-null.

  If you have a list called `Item`, the to-many relationship inputs now look like this:

  ```graphql
  input ItemRelateToManyForCreateInput {
    create: [ItemCreateInput!]
    connect: [ItemWhereUniqueInput!]
  }
  input ItemRelateToManyForUpdateInput {
    disconnect: [ItemWhereUniqueInput!]
    set: [ItemWhereUniqueInput!]
    create: [ItemCreateInput!]
    connect: [ItemWhereUniqueInput!]
  }
  ```

* [#6197](https://github.com/keystonejs/keystone/pull/6197) [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The generated CRUD queries, and some of the input types, in the GraphQL API have been renamed.

  If you have a list called `Item`, the query for multiple values, `allItems` will be renamed to `items`. The query for a single value, `Item`, will be renamed to `item`.

  Also, the input type used in the `updateItems` mutation has been renamed from `ItemsUpdateInput` to `ItemUpdateArgs`.

- [#6211](https://github.com/keystonejs/keystone/pull/6211) [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The update mutations now accept `where` unique inputs instead of only an `id` and the `where` and `data` arguments are non-null.

  If you have a list called `Item`, the update mutations now look like this:

  ```graphql
  type Mutation {
    updateItem(where: ItemWhereUniqueInput!, data: ItemUpdateInput!): Item
    updateItems(data: [ItemUpdateArgs!]!): [Item]
  }

  input ItemUpdateArgs {
    where: ItemWhereUniqueInput!
    data: ItemUpdateInput!
  }
  ```

* [#6206](https://github.com/keystonejs/keystone/pull/6206) [`f5e64af37`](https://github.com/keystonejs/keystone/commit/f5e64af37df2eb460c89d89fa3c8924fb34970ed) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The delete mutations now accept `where` unique inputs instead of only an `id`.

  If you have a list called `Item`, `deleteItem` now looks like `deleteItem(where: ItemWhereUniqueInput!): Item` and `deleteItems` now looks like `deleteItems(where: [ItemWhereUniqueInput!]!): [Item]`

### Minor Changes

- [#6276](https://github.com/keystonejs/keystone/pull/6276) [`3a7a06b2c`](https://github.com/keystonejs/keystone/commit/3a7a06b2cc6b5ea157d34d925b15494b471899eb) Thanks [@gautamsi](https://github.com/gautamsi)! - Added option for `Bearer` token auth when using session.

* [#6267](https://github.com/keystonejs/keystone/pull/6267) [`1030296d1`](https://github.com/keystonejs/keystone/commit/1030296d1f304dc44246e895089ac1f992e80590) Thanks [@timleslie](https://github.com/timleslie)! - Added `config.graphql.debug` option, which can be used to control whether debug information such as stack traces are included in the errors returned by the GraphQL API.

### Patch Changes

- [#6317](https://github.com/keystonejs/keystone/pull/6317) [`1cbcf54cb`](https://github.com/keystonejs/keystone/commit/1cbcf54cb1206461866b582865e3b1a8fc728f18) Thanks [@timleslie](https://github.com/timleslie)! - Separated the resolving of non-relationship field from relationship fields in create/update inputs to allow for better error handling.

* [#6250](https://github.com/keystonejs/keystone/pull/6250) [`a92169d04`](https://github.com/keystonejs/keystone/commit/a92169d04e5a1a98deb8e757b8eae3b06fc66450) Thanks [@timleslie](https://github.com/timleslie)! - Updated internal type definitions.

- [#6334](https://github.com/keystonejs/keystone/pull/6334) [`f3014a627`](https://github.com/keystonejs/keystone/commit/f3014a627060c7cd86440a6937da5caecfd023a0) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Resolved bug with visually hidden elements in ListView checkboxes expanding to fill the whole body on click of elements near the bottom of the screen.

* [#6219](https://github.com/keystonejs/keystone/pull/6219) [`6da56b80e`](https://github.com/keystonejs/keystone/commit/6da56b80e03c748a621afcca6c1ec2887fef7271) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused code path in Admin UI error display.

- [#6269](https://github.com/keystonejs/keystone/pull/6269) [`697efa354`](https://github.com/keystonejs/keystone/commit/697efa354b1066b3d4b6eb757ca704b458f45e93) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added ignoreBuildErrors flag to next-config.js file, to negate false positive errors in keystone builds with imported components.

* [#6218](https://github.com/keystonejs/keystone/pull/6218) [`c7e331d90`](https://github.com/keystonejs/keystone/commit/c7e331d90a28b2ed8236100097cb8d34a11fabe2) Thanks [@timleslie](https://github.com/timleslie)! - Added more details to validation failure error messages.

- [#6316](https://github.com/keystonejs/keystone/pull/6316) [`78dac764e`](https://github.com/keystonejs/keystone/commit/78dac764e1860b33f9e2bd8cee6015abeaaa5ec4) Thanks [@timleslie](https://github.com/timleslie)! - Updated handling of errors in `resolveInput` hooks to provide developers with appropriate debug information.

* [#6310](https://github.com/keystonejs/keystone/pull/6310) [`399561b27`](https://github.com/keystonejs/keystone/commit/399561b2769ddd8f3d3fdf29838f5784404bb053) Thanks [@timleslie](https://github.com/timleslie)! - Updated dependencies to use `mergeSchemas` from `@graphql-tools/schema`, rather than its old location in `@graphql-tools/merge`. You might see a reordering of the contents of your `graphql.schema` file.

- [#6292](https://github.com/keystonejs/keystone/pull/6292) [`0dcb1c95b`](https://github.com/keystonejs/keystone/commit/0dcb1c95b5200750cc8649485425f2ae40d023a3) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.29.1`.

* [#6263](https://github.com/keystonejs/keystone/pull/6263) [`94435ffee`](https://github.com/keystonejs/keystone/commit/94435ffee765824091899242e4a2f73c7356b524) Thanks [@timleslie](https://github.com/timleslie)! - Made the original stacktraces for before/after hooks available on `error.extension.errors`.

- [#6259](https://github.com/keystonejs/keystone/pull/6259) [`f46fd32b7`](https://github.com/keystonejs/keystone/commit/f46fd32b7047dbb5ea2566859f7ecee8db5b0b15) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Bumped @apollo/client dependency to ^3.4.5, the update resolves the following useQuery [issue](https://github.com/keystonejs/keystone/issues/6254).

* [#6239](https://github.com/keystonejs/keystone/pull/6239) [`8ea4eed55`](https://github.com/keystonejs/keystone/commit/8ea4eed55367aaa213f6b4ffb7473087498e39ae) Thanks [@timleslie](https://github.com/timleslie)! - Added more details to before/after change/delete hook error messages.

- [#6248](https://github.com/keystonejs/keystone/pull/6248) [`e3fe6498d`](https://github.com/keystonejs/keystone/commit/e3fe6498dc36203d8080dff3c2e0c25f6c98733e) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependency `@graphql-tools/schema`.

* [#6203](https://github.com/keystonejs/keystone/pull/6203) [`8b2d179b2`](https://github.com/keystonejs/keystone/commit/8b2d179b2463d78b082182ca9afa8233109e0ba3) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.28.0`.

- [#6296](https://github.com/keystonejs/keystone/pull/6296) [`e3fefafcc`](https://github.com/keystonejs/keystone/commit/e3fefafcce6f8bf836c9bf0f4d931b8200ba41c7) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed delete success notifications in the Admin UI appearing on failed deletes in List view and Item view.

* [#6200](https://github.com/keystonejs/keystone/pull/6200) [`686c0f1c4`](https://github.com/keystonejs/keystone/commit/686c0f1c4a1feb609e1584aa71738709bbbf984e) Thanks [@timleslie](https://github.com/timleslie)! - Updated internal error handling to use the `apollo-server-errors` package instead of `apollo-errors`.

* Updated dependencies [[`e9f3c42d5`](https://github.com/keystonejs/keystone/commit/e9f3c42d5b9d42872cecbd18fbe9bf9d7d53ed82), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`b696a9579`](https://github.com/keystonejs/keystone/commit/b696a9579b503db86f42776381e247c4e1a7409f), [`092df6678`](https://github.com/keystonejs/keystone/commit/092df6678cea18d639be16ad250ec4ecc9250f5a), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`c2bb6a9a5`](https://github.com/keystonejs/keystone/commit/c2bb6a9a596fc52a3c61ec5d91c79758e417e61d), [`4f4f0351a`](https://github.com/keystonejs/keystone/commit/4f4f0351a056dea9d1614aa2a3a4789d66bb402d), [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`56044e2a4`](https://github.com/keystonejs/keystone/commit/56044e2a425f4256b66475fd3b1a6342cd6c3bf9), [`874f2c405`](https://github.com/keystonejs/keystone/commit/874f2c4058c9cf006213e84b9ffcf39c5bf144e8), [`1030296d1`](https://github.com/keystonejs/keystone/commit/1030296d1f304dc44246e895089ac1f992e80590), [`3564b342d`](https://github.com/keystonejs/keystone/commit/3564b342d6dc2127ae591d7ac055af9eae90543c), [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda), [`8187ea019`](https://github.com/keystonejs/keystone/commit/8187ea019a212874f3c602573af3382c6f3bd3b2), [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e), [`f5e64af37`](https://github.com/keystonejs/keystone/commit/f5e64af37df2eb460c89d89fa3c8924fb34970ed)]:
  - @keystone-next/fields@14.0.0
  - @keystone-next/types@24.0.0
  - @keystone-ui/notice@4.0.1
  - @keystone-ui/toast@4.0.2
  - @keystone-next/admin-ui-utils@5.0.6
  - @keystone-next/utils@1.0.4

## 23.0.3

### Patch Changes

- [#6251](https://github.com/keystonejs/keystone/pull/6251) [`b5ceeaa3e`](https://github.com/keystonejs/keystone/commit/b5ceeaa3ecb44997e4c6cc241bdc24cb18663687) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - `@apollo/client` pinned at `3.3.21` until bug with `3.4.2` is resolved.

## 23.0.2

### Patch Changes

- [#6216](https://github.com/keystonejs/keystone/pull/6216) [`c176d9b3e`](https://github.com/keystonejs/keystone/commit/c176d9b3e46df289e1e376c4a327bf407b5bf211) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Resolved nav bug with isSelected state, add Dashboard route back to default Navigation.

## 23.0.1

### Patch Changes

- [#6205](https://github.com/keystonejs/keystone/pull/6205) [`9c7430ec3`](https://github.com/keystonejs/keystone/commit/9c7430ec31cbe162fabd10f3778c4240ffc760cc) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fix nav path bug in Admin-UI.

## 23.0.0

### Major Changes

- [#6153](https://github.com/keystonejs/keystone/pull/6153) [`7716315ea`](https://github.com/keystonejs/keystone/commit/7716315ea823dd91d17d54dcbb9155b5445cd956) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed implicit chunking from the lists API so that the lists API is a direct translation of the GraphQL API

* [#6105](https://github.com/keystonejs/keystone/pull/6105) [`e5f61ad50`](https://github.com/keystonejs/keystone/commit/e5f61ad50133a328fcb32299b838fd9eac574c3f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed unnecessary descriptions on GraphQL types.

- [#6165](https://github.com/keystonejs/keystone/pull/6165) [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `ui.searchFields` option to lists to allow searching by multiple fields in the Admin UI (the only current usage of this is in the select used in relationship fields) and to replace the usage of the `search` GraphQL argument which will be removed soon and should be replaced by using `contains` filters directly.

### Minor Changes

- [#6111](https://github.com/keystonejs/keystone/pull/6111) [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added the ability to customise the Navigation component in the Admin UI, and provided helper components to do so.

### Patch Changes

- [#6104](https://github.com/keystonejs/keystone/pull/6104) [`3f03b8c1f`](https://github.com/keystonejs/keystone/commit/3f03b8c1fa7005b37371e1cc401c3a03334a4f7a) Thanks [@timleslie](https://github.com/timleslie)! - Cosmetic changes to the core code in preparation for improvements to the error handling logic.

* [#6126](https://github.com/keystonejs/keystone/pull/6126) [`ea0712aa2`](https://github.com/keystonejs/keystone/commit/ea0712aa22487325bd898818ea4fbca543c9dcf1) Thanks [@borisno2](https://github.com/borisno2)! - Added `/` to `list.path` on HomePage ListCard to better allow custom `basePath`.

- [#6192](https://github.com/keystonejs/keystone/pull/6192) [`93f1e5d30`](https://github.com/keystonejs/keystone/commit/93f1e5d302701c610b6cba74e0c5c86a3ac8aacc) Thanks [@JedWatson](https://github.com/JedWatson)! - Added an optional `/_healthcheck` endpoint to Keystone's express server.

  You can enable it by setting `config.server.healthCheck: true`

  By default it will respond with `{ status: 'pass', timestamp: Date.now() }`

  You can also specify a custom path and JSON data:

  ```js
  config({
    server: {
      healthCheck: {
        path: '/my-health-check',
        data: { status: 'healthy' },
      },
    },
  });
  ```

  Or use a function for the `data` config to return real-time information:

  ```js
  config({
    server: {
      healthCheck: {
        path: '/my-health-check',
        data: () => ({
          status: 'healthy',
          timestamp: Date.now(),
          uptime: process.uptime(),
        }),
      },
    },
  });
  ```

* [#6180](https://github.com/keystonejs/keystone/pull/6180) [`a11e54d69`](https://github.com/keystonejs/keystone/commit/a11e54d692d3cec4ec2439cbf743b590688fb7d3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed issues with React hooks dependency arrays

- [#6116](https://github.com/keystonejs/keystone/pull/6116) [`dd7e811e7`](https://github.com/keystonejs/keystone/commit/dd7e811e7ce084c1e832acefc6ed773af371ac9e) Thanks [@timleslie](https://github.com/timleslie)! - Updated unique filter checking code to ensure it is always run before using the unique input filter.

* [#6139](https://github.com/keystonejs/keystone/pull/6139) [`587a8d0b0`](https://github.com/keystonejs/keystone/commit/587a8d0b074ccecb239d120275359f72779f306f) Thanks [@timleslie](https://github.com/timleslie)! - Refactored mutation validation handling into a single location.

- [#6119](https://github.com/keystonejs/keystone/pull/6119) [`597edbdd8`](https://github.com/keystonejs/keystone/commit/597edbdd81df80982dd3df3d9d600003ef8a15e9) Thanks [@timleslie](https://github.com/timleslie)! - Split the default value loop from the field-type input resolver loop to allow for more fine-grained error handling.

* [#6144](https://github.com/keystonejs/keystone/pull/6144) [`1172e1853`](https://github.com/keystonejs/keystone/commit/1172e18531064df6412c06412e74da3b85740b35) Thanks [@gautamsi](https://github.com/gautamsi)! - Changed symlink generation to use relative path instead of absolute. Solves running project in docker when mapping volume.

- [#6096](https://github.com/keystonejs/keystone/pull/6096) [`fbe698461`](https://github.com/keystonejs/keystone/commit/fbe6984616de7a302db7c2b0082851db89c2e314) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.27.0`.

* [#6123](https://github.com/keystonejs/keystone/pull/6123) [`32e9879db`](https://github.com/keystonejs/keystone/commit/32e9879db9cfee77f067eb8105262df65bca6c06) Thanks [@timleslie](https://github.com/timleslie)! - Simplified the internal implementation of nested mutations.

* Updated dependencies [[`93f1e5d30`](https://github.com/keystonejs/keystone/commit/93f1e5d302701c610b6cba74e0c5c86a3ac8aacc), [`a11e54d69`](https://github.com/keystonejs/keystone/commit/a11e54d692d3cec4ec2439cbf743b590688fb7d3), [`e5f61ad50`](https://github.com/keystonejs/keystone/commit/e5f61ad50133a328fcb32299b838fd9eac574c3f), [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523), [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4), [`2ef6fe82c`](https://github.com/keystonejs/keystone/commit/2ef6fe82cee6df7796935d35d1c12cab29aecc75)]:
  - @keystone-next/types@23.0.0
  - @keystone-ui/tooltip@4.0.1
  - @keystone-next/fields@13.0.0
  - @keystone-next/admin-ui-utils@5.0.5
  - @keystone-next/utils@1.0.3

## 22.0.0

### Major Changes

- [#6027](https://github.com/keystonejs/keystone/pull/6027) [`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependency to `2.26.0`.

### Patch Changes

- [#6087](https://github.com/keystonejs/keystone/pull/6087) [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951) Thanks [@JedWatson](https://github.com/JedWatson)! - Move source code from the `packages-next` to the `packages` directory.

* [#6094](https://github.com/keystonejs/keystone/pull/6094) [`279403cb0`](https://github.com/keystonejs/keystone/commit/279403cb0b4bffb946763c9a7ef71be57478eeb3) Thanks [@timleslie](https://github.com/timleslie)! - Refactored internal nested mutation input handler code.

- [#6045](https://github.com/keystonejs/keystone/pull/6045) [`253df44c2`](https://github.com/keystonejs/keystone/commit/253df44c2f8d6535a6425b2593eaed5380433d57) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Adjusted when `getAdminMeta` is called on fields so that they can see the metadata (excluding the results of `getAdminMeta` on fields) of other fields to do validation or etc.

* [#6093](https://github.com/keystonejs/keystone/pull/6093) [`f482db633`](https://github.com/keystonejs/keystone/commit/f482db6332e54a1d5cd469e2805b99b544208e83) Thanks [@JedWatson](https://github.com/JedWatson)! - Added generated types for KeystoneContext, KeystoneListsAPI and KeystoneDbAPI.

  You can now import these from `.keystone/types` (instead of `@keystone-next/types`) to get types that are pre-bound to your project's schema.

* Updated dependencies [[`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790), [`5f3d407d7`](https://github.com/keystonejs/keystone/commit/5f3d407d79171f04ae877e8eaed9a7f9d5671705), [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951), [`253df44c2`](https://github.com/keystonejs/keystone/commit/253df44c2f8d6535a6425b2593eaed5380433d57), [`c536b478f`](https://github.com/keystonejs/keystone/commit/c536b478fc89f2d933cddf8533e7d88030540a63)]:
  - @keystone-next/fields@12.0.0
  - @keystone-next/types@22.0.0
  - @keystone-ui/core@3.1.1
  - @keystone-next/admin-ui-utils@5.0.4
  - @keystone-next/utils@1.0.2

## 21.0.2

### Patch Changes

- [#6029](https://github.com/keystonejs/keystone/pull/6029) [`038cd09a2`](https://github.com/keystonejs/keystone/commit/038cd09a201081e3f56ffd75577e6b74a6eb19e5) Thanks [@bladey](https://github.com/bladey)! - Updated Keystone URL reference from next.keystonejs.com to keystonejs.com.

- Updated dependencies [[`038cd09a2`](https://github.com/keystonejs/keystone/commit/038cd09a201081e3f56ffd75577e6b74a6eb19e5), [`0988f08c2`](https://github.com/keystonejs/keystone/commit/0988f08c2a88a0da6b85a385caf48ff093e1f9e5)]:
  - @keystone-next/fields@11.0.3
  - @keystone-next/types@21.0.1

## 21.0.1

### Patch Changes

- [#6022](https://github.com/keystonejs/keystone/pull/6022) [`475307e0e`](https://github.com/keystonejs/keystone/commit/475307e0ef99e3ce137e976ecf7671e536facd91) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed error when loading the Admin UI due to the id field changes.

## 21.0.0

### Major Changes

- [#5947](https://github.com/keystonejs/keystone/pull/5947) [`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced the `idField` list configuration option with a more constrained option, `db.idField`, that accepts an object with a `kind` property with a value of `cuid`, `uuid` or `autoincrement`. `db.idField` can be set on either the top level `config` object, or on individual lists.

  The default behaviour has changed from using `autoincrement` to using cuids. To keep the current behaviour, you should set `{ kind: 'autoincrement' }` at `db.idField` in your top level config.

* [#5947](https://github.com/keystonejs/keystone/pull/5947) [`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Id field filters no longer allow `null` to be passed because ids can never be null. For the `in` and `not_in`, this is reflected in the GraphQL types

### Patch Changes

- Updated dependencies [[`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b)]:
  - @keystone-next/types@21.0.0
  - @keystone-next/fields@11.0.2
  - @keystone-next/admin-ui-utils@5.0.3
  - @keystone-next/utils@1.0.1

## 20.0.1

### Patch Changes

- [#5817](https://github.com/keystonejs/keystone/pull/5817) [`10b36551a`](https://github.com/keystonejs/keystone/commit/10b36551ac3a88da2cfeba3d065d6dd36041e769) Thanks [@bladey](https://github.com/bladey)! - Fixed the GraphQL playground accessed at `/api/graphql` from being accessible in production by default.

  Fixed the GraphQL playground incorrectly interpreting config options.

* [#5949](https://github.com/keystonejs/keystone/pull/5949) [`8afbab763`](https://github.com/keystonejs/keystone/commit/8afbab7636b4236c6604311819160d5f1420a90e) Thanks [@tjbp](https://github.com/tjbp)! - Fixed readonly property set in `format-error` of `createApolloServer`.

- [#5932](https://github.com/keystonejs/keystone/pull/5932) [`7a25925c3`](https://github.com/keystonejs/keystone/commit/7a25925c3dc5b2af2cf1209ee949563fb71a4a8c) Thanks [@timleslie](https://github.com/timleslie)! - Initial release of `@keystone-next/utils` package.

* [#5910](https://github.com/keystonejs/keystone/pull/5910) [`50ad1ce6b`](https://github.com/keystonejs/keystone/commit/50ad1ce6be90f5fb2481840dbd01328b6f629432) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed generated list types to allow passing a value directly when a GraphQL list of the value is expected

- [#5987](https://github.com/keystonejs/keystone/pull/5987) [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added assorted quality of life and screen reader improvements to Filter pills and dialogs in the admin-ui

* [#5920](https://github.com/keystonejs/keystone/pull/5920) [`123042b04`](https://github.com/keystonejs/keystone/commit/123042b047f3242ac95d2c5280de8c07f18a86be) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed Admin UI generation to allow files returned from `getAdditionalFiles` to overwrite the files generated by Keystone

- [#5848](https://github.com/keystonejs/keystone/pull/5848) [`4e5634b86`](https://github.com/keystonejs/keystone/commit/4e5634b86a26819cecec5b10c18f9d231b5434e2) Thanks [@renovate](https://github.com/apps/renovate)! - Updated TypeScript to 4.3.2

* [#5914](https://github.com/keystonejs/keystone/pull/5914) [`006afd108`](https://github.com/keystonejs/keystone/commit/006afd1082b474bac2499bed57bcaccf1e1d6138) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.25.0`.

- [#5922](https://github.com/keystonejs/keystone/pull/5922) [`3be09ea54`](https://github.com/keystonejs/keystone/commit/3be09ea548861b490dad8b50e58980580d366434) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed reset-to-default button, broken due to next patch update.

* [#5921](https://github.com/keystonejs/keystone/pull/5921) [`eab130f30`](https://github.com/keystonejs/keystone/commit/eab130f30d79b82c18b3cce0bc054abe2c1b58fd) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added more helpful aria-label and aria-description to filter, sort and column popover.

* Updated dependencies [[`de0a5c19e`](https://github.com/keystonejs/keystone/commit/de0a5c19e656360ea3febc7e0240543c7817253e), [`7a25925c3`](https://github.com/keystonejs/keystone/commit/7a25925c3dc5b2af2cf1209ee949563fb71a4a8c), [`50ad1ce6b`](https://github.com/keystonejs/keystone/commit/50ad1ce6be90f5fb2481840dbd01328b6f629432), [`0df3734d5`](https://github.com/keystonejs/keystone/commit/0df3734d52a89df30f1d555d003002cb79ad9e9a), [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c), [`4e5634b86`](https://github.com/keystonejs/keystone/commit/4e5634b86a26819cecec5b10c18f9d231b5434e2), [`0afacf621`](https://github.com/keystonejs/keystone/commit/0afacf621f922b5f47f7314ead9be94960b9859a), [`40a44d20d`](https://github.com/keystonejs/keystone/commit/40a44d20d2eda2bcfb311fc3ce05936623230205), [`eab130f30`](https://github.com/keystonejs/keystone/commit/eab130f30d79b82c18b3cce0bc054abe2c1b58fd), [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c), [`543154bc0`](https://github.com/keystonejs/keystone/commit/543154bc081dde33ea29b8a2bff1d3033d538077), [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c)]:
  - @keystone-next/fields@11.0.1
  - @keystone-next/utils@1.0.0
  - @keystone-next/types@20.0.1
  - @keystone-ui/popover@4.0.2
  - @keystone-ui/fields@4.1.2
  - @keystone-ui/options@4.0.1
  - @keystone-ui/toast@4.0.1
  - @keystone-ui/pill@5.0.0

## 20.0.0

### Major Changes

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The ordering of types in the generated `schema.graphql` has changed due to the re-implementation of the core of Keystone, you will need to run `keystone-next dev`/`keystone-next postinstall --fix` to update it.

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `createSystem` no longer accepts a Prisma client directly and it returns `getKeystone` which accepts the generated Prisma client and returns `connect`, `disconnect` and `createContext` instead of returning a `keystone` instance object.

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The core of Keystone has been re-implemented to make implementing fields and new features in Keystone easier. While the observable changes for most users should be minimal, there could be breakage. If you implemented a custom field type, you will need to change it to the new API, see fields in the `@keystone-next/fields` package for inspiration on how to do this.

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The ordering of relationships fields in the generated Prisma schema has changed so that it aligns with the order specified in the list config with the opposites to one-sided relationships added at the end. The name of one-to-one and one-to-many relationships has also changed to include `_` between the list key and field key to align with many-to-many relationships. Note that these changes do **not require a migration**, only your `schema.prisma` file will need to be updated with `keystone-next dev`/`keystone-next postinstall --fix`.

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `id` field on the item returned from `context.db.lists` functions/passed to hooks/field type resolvers is now whatever the actual id field returned from Prisma is rather than a stringified version of it.

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `graphql.itemQueryName` with always using the list key as the singular name in GraphQL and renamed `graphql.listQueryName` to `graphql.plural`

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `KeystoneContext` type no longer has the `keystone` object or functions to run access control.

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - List level create, update and delete access control is now called for each operation in a many operation rather than on all of the operations as a whole. This means that rather than recieving originalInput as an array with itemIds, your access control functions will always be called with just an itemId and/or originalInput(depending on which access control function it is). If your access control functions already worked with creating/updating/deleting one item, they will continue working (though you may get TypeScript errors if you were previously handling itemIds and originalInput as an array, to fix that, you should stop handling that case).

- [#5891](https://github.com/keystonejs/keystone/pull/5891) [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for filtering uniquely by `text` and `integer` fields that have `isUnique: true` like this:

  ```graphql
  query {
    Post(where: { slug: "something-something-something" }) {
      id
      title
      content
    }
  }
  ```

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Filters returned from access control now go through GraphQL validation and coercion like filters that you pass in through the GraphQL API, this will produce better errors when you return invalid values.

### Minor Changes

- [#5854](https://github.com/keystonejs/keystone/pull/5854) [`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Replaced the types `FileMode` and `ImageMode` with `AssetMode`.

  Added internal experimental Keystone Cloud integration capabilities for images.

* [#5868](https://github.com/keystonejs/keystone/pull/5868) [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added experimental support for the integration with keystone cloud files

### Patch Changes

- [#5870](https://github.com/keystonejs/keystone/pull/5870) [`5227234a0`](https://github.com/keystonejs/keystone/commit/5227234a08edd99cd2795c8d888fbb3022810f54) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.24.1`.

* [#5885](https://github.com/keystonejs/keystone/pull/5885) [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `BaseGeneratedListTypes` to have `orderBy` be readonly like the generated types

* Updated dependencies [[`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4), [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947), [`e4c19f808`](https://github.com/keystonejs/keystone/commit/e4c19f8086cc14f7f4a8ef390f1f4e1263004d40), [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`4c90c0d3c`](https://github.com/keystonejs/keystone/commit/4c90c0d3c8e75c6a58910c4bd563b3b80e61e801), [`881c9ffb7`](https://github.com/keystonejs/keystone/commit/881c9ffb7c5941e9fb214ed955148d8ea567e65f), [`ef14e77ce`](https://github.com/keystonejs/keystone/commit/ef14e77cebc9420db8c7d29dfe61f02140f4a705), [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`8958704ec`](https://github.com/keystonejs/keystone/commit/8958704ec9819cd27ad1cae251628ad38dad1c79), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7)]:
  - @keystone-next/fields@11.0.0
  - @keystone-next/types@20.0.0
  - @keystone-next/utils-legacy@12.0.0
  - @keystone-ui/fields@4.1.1
  - @keystone-ui/core@3.1.0
  - @keystone-next/admin-ui-utils@5.0.2

## 19.0.0

### Major Changes

- [#5806](https://github.com/keystonejs/keystone/pull/5806) [`0eadba2ba`](https://github.com/keystonejs/keystone/commit/0eadba2badb13fc6a17f7e525d429494ca953481) Thanks [@list({](https://github.com/list({), [@list({](https://github.com/list({)! - Removed `withItemData` in favour of a `sessionData` option to the `createAuth()` function.

  Previously, `withItemData` would be used to wrap the `config.session` argument:

  ```typescript
  import { config, createSchema, list } from '@keystone-next/keystone/schema';
  import { statelessSessions, withAuthData } from '@keystone-next/keystone/session';
  import { text, password, checkbox } from '@keystone-next/fields';
  import { createAuth } from '@keystone-next/auth';

  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
  });

  const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

  export default withAuth(
    config({
      lists: createSchema({

          fields: {
            email: text({ isUnique: true }),
            password: password(),
            isAdmin: checkbox(),
          },
        }),
        session: withItemData(session, { User: 'id isAdmin' }),
      }),
    })
  );
  ```

  Now, the fields to populate are configured on `sessionData` in `createAuth`, and `withItemData` is completely removed.

  ```typescript
  import { config, createSchema, list } from '@keystone-next/keystone/schema';
  import { statelessSessions } from '@keystone-next/keystone/session';
  import { text, password, checkbox } from '@keystone-next/fields';
  import { createAuth } from '@keystone-next/auth';

  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    sessionData: 'id isAdmin',
  });

  const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

  export default withAuth(
    config({
      lists: createSchema({

          fields: {
            email: text({ isUnique: true }),
            password: password(),
            isAdmin: checkbox(),
          },
        }),
        session,
      }),
    })
  );
  ```

* [#5772](https://github.com/keystonejs/keystone/pull/5772) [`f52079f0b`](https://github.com/keystonejs/keystone/commit/f52079f0bffc4cf2ab5e26e4c3654127b59d6078) Thanks [@timleslie](https://github.com/timleslie)! - Fixed the behaviour of `createItems`, `updateItems`, and `deleteItems` mutations to be consistent and predictable.

  Previously, these mutations could return items in an arbitrary order. They now return items in the same order they were provided to the mutation.

  Previously, if there was an error, say a validation error, on one or more of the items then the return value would be `null` and a single top level error would be returned. The state of the database in this case was non-deterministic.

  The new behaviour is to return values for all items created, with `null` values for those that had errors. These errors are returned in the `errors` array and have paths which correctly point to the `null` values in the returned array. All the valid operations will be completed, leaving the database in a deterministic state.

  Previously, if items were filtered out by declarative access control, then no error would be returned, and only those accessible items would be returned. Now the returned data will contain `null` values for those items which couldn't accessed, and the `errors` array will contain errors with paths which correctly point to the `null` values in the returned array.

  Previously, if static access control denied access to the mutation, then `null` was returned, and a single `error` was returned. Now, an array of `null`s is returned, with a separate error for each object. This makes the behaviour of static and declarative access control consistent.

- [#5777](https://github.com/keystonejs/keystone/pull/5777) [`74bc77854`](https://github.com/keystonejs/keystone/commit/74bc778547623fe4ed3db97ed09384d9dc076372) Thanks [@timleslie](https://github.com/timleslie)! - Updated the type of the `skip` argument to `allItems` from `Int` to `Int! = 0`.

* [#5792](https://github.com/keystonejs/keystone/pull/5792) [`319c19bd5`](https://github.com/keystonejs/keystone/commit/319c19bd5f8e8c261a1aefb1997d66b2a136ae28) Thanks [@timleslie](https://github.com/timleslie)! - Changed the type of the `where` argument to `allItems` to `_allItemsMeta` from type `ItemWhereInput` to `ItemWhereInput! = {}`.

- [#5832](https://github.com/keystonejs/keystone/pull/5832) [`195d4fb12`](https://github.com/keystonejs/keystone/commit/195d4fb1218517d7b9a40d3bba1a087d40e6d1d6) Thanks [@timleslie](https://github.com/timleslie)! - Updated the functions `getCommittedArtifacts`, `validateCommittedArtifacts`, `generateCommittedArtifacts`, and `generateNodeModulesArtifacts` exported from `artifacts.ts` to accept a `KeystoneConfig` argument rather than a `BaseKeystone` object.

* [#5850](https://github.com/keystonejs/keystone/pull/5850) [`5b02e8625`](https://github.com/keystonejs/keystone/commit/5b02e8625e18c8e79547d5caf8cacb5014ffee9d) Thanks [@timleslie](https://github.com/timleslie)! - The `AND` and `OR` operators of `ItemWhereInput` now accept non-null values, e.g. `[ItemWhereInput!]`, rather than `[ItemWhereInput]`.

- [#5767](https://github.com/keystonejs/keystone/pull/5767) [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a) Thanks [@timleslie](https://github.com/timleslie)! - Deprecated the `sortBy` GraphQL filter. Updated the `orderBy` GraphQL filter with an improved API.

  Previously a `User` list's `allUsers` query would have the argument:

  ```graphql
  orderBy: String
  ```

  The new API gives it the argument:

  ```graphql
  orderBy: [UserOrderByInput!]! = []
  ```

  where

  ```graphql
  input UserOrderByInput {
    id: OrderDirection
    name: OrderDirection
    score: OrderDirection
  }

  enum OrderDirection {
    asc
    desc
  }
  ```

  Rather than writing `allUsers(orderBy: "name_ASC")` you now write `allUsers(orderBy: { name: asc })`. You can also now order by multiple fields, e.g. `allUsers(orderBy: [{ score: asc }, { name: asc }])`. Each `UserOrderByInput` must have exactly one key, or else an error will be returned.

* [#5791](https://github.com/keystonejs/keystone/pull/5791) [`9de71a9fb`](https://github.com/keystonejs/keystone/commit/9de71a9fb0d3b7f5f05c0d908bebdb818723fd4b) Thanks [@timleslie](https://github.com/timleslie)! - Changed the return type of `allItems(...)` from `[User]` to `[User!]`, as this API can never have `null` items in the return array.

- [#5802](https://github.com/keystonejs/keystone/pull/5802) [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b) Thanks [@timleslie](https://github.com/timleslie)! - Changed `config.session` to access a `SessionStrategy` object, rather than a `() => SessionStrategy` function. You will only need to change your configuration if you're using a customised session strategy.

* [#5828](https://github.com/keystonejs/keystone/pull/5828) [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `keystone` argument from the `ExtendGraphqlSchema` type. This will only impact you if you were directly constructing this function. Users of the `graphQLSchemaExtension` function will not be impacted.

- [#5787](https://github.com/keystonejs/keystone/pull/5787) [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `req, session, createContext` args to `config.ui.pageMiddleware` with a `context` arg.

### Minor Changes

- [#5774](https://github.com/keystonejs/keystone/pull/5774) [`107eeb037`](https://github.com/keystonejs/keystone/commit/107eeb0374e214b69be3727ca955a9f76e1468bb) Thanks [@jonowu](https://github.com/jonowu)! - Added `sameSite` option to session options for cookies

* [#5769](https://github.com/keystonejs/keystone/pull/5769) [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394) Thanks [@timleslie](https://github.com/timleslie)! - The GraphQL query `_all<Items>Meta { count }` generated for each list has been deprecated in favour of a new query `<items>Count`, which directy returns the count.

  A `User` list would have the following query added to the API:

  ```graphql
  usersCount(where: UserWhereInput! = {}): Int
  ```

### Patch Changes

- [#5780](https://github.com/keystonejs/keystone/pull/5780) [`29075e580`](https://github.com/keystonejs/keystone/commit/29075e58074672d90cfca84aba8dcedeecf243ca) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed schema type printer to make arguments that have default values be optional

* [#5825](https://github.com/keystonejs/keystone/pull/5825) [`c6cd0a6bd`](https://github.com/keystonejs/keystone/commit/c6cd0a6bdc7ccb000c39fba0da31819e33d9e056) Thanks [@timleslie](https://github.com/timleslie)! - Updated the Admin UI to use the `itemsCount` GraphQL API.

- [#5826](https://github.com/keystonejs/keystone/pull/5826) [`1fe4753f3`](https://github.com/keystonejs/keystone/commit/1fe4753f3af28aa851e1f90d55937c940be5af1a) Thanks [@timleslie](https://github.com/timleslie)! - Updated the list page of the Admin UI to use `orderBy` rather than `sortBy` to order items.

* [#5849](https://github.com/keystonejs/keystone/pull/5849) [`76cdb791b`](https://github.com/keystonejs/keystone/commit/76cdb791b1ab36d015e43b87deff52be2ea6b629) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.24.0`.

- [#5768](https://github.com/keystonejs/keystone/pull/5768) [`762f17823`](https://github.com/keystonejs/keystone/commit/762f1782334c9b7174c320182c753c215834ff7f) Thanks [@timleslie](https://github.com/timleslie)! - Updated `context.db.lists` API to correctly apply GraphQL defaults to query arguments.

* [#5784](https://github.com/keystonejs/keystone/pull/5784) [`38a177d61`](https://github.com/keystonejs/keystone/commit/38a177d6140874b29d3c09b5852dbfd787d5c429) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependency to `2.23.0`.

* Updated dependencies [[`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`a6a444acd`](https://github.com/keystonejs/keystone/commit/a6a444acd23f2590d9812872441cafb5d088c48e), [`59421c039`](https://github.com/keystonejs/keystone/commit/59421c0399368e56e46537c1c687daa27f5912d0), [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0), [`0617c81ea`](https://github.com/keystonejs/keystone/commit/0617c81eacc88e40bdd21bacab285d674b171a4a), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`3a7acc2c5`](https://github.com/keystonejs/keystone/commit/3a7acc2c5114fbcbde994d1f4c6cc0b21c572ec0), [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394), [`fe5b463ed`](https://github.com/keystonejs/keystone/commit/fe5b463ed07c2a524a3cde554ac07575d31e6712), [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b), [`590bb1fe9`](https://github.com/keystonejs/keystone/commit/590bb1fe9254c2f8feff7e3a0e2e964610116f95), [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0), [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba), [`19a756496`](https://github.com/keystonejs/keystone/commit/19a7564964d9dcdc94ecdda9c0a0e92c539eb309)]:
  - @keystone-next/fields@10.0.0
  - @keystone-next/types@19.0.0
  - @keystone-next/adapter-prisma-legacy@8.0.0
  - @keystone-ui/fields@4.1.0
  - @keystone-ui/popover@4.0.1
  - @keystone-next/admin-ui-utils@5.0.1
  - @keystone-next/utils-legacy@11.0.1

## 18.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

* [#5677](https://github.com/keystonejs/keystone/pull/5677) [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the `@keystone-next/admin-ui` package into `@keystone-next/keystone`.

  If you were directly importing from `@keystone-next/admin-ui` you can now import the same items from `@keystone-next/keystone/admin-ui`.
  If you have `@keystone-next/admin-ui` in your `package.json` you should remove it.

### Minor Changes

- [#5758](https://github.com/keystonejs/keystone/pull/5758) [`8da79e71a`](https://github.com/keystonejs/keystone/commit/8da79e71abb005eb755620fb3c8f82a3a2952152) Thanks [@timleslie](https://github.com/timleslie)! - Added a `SKIP_PROMPTS` environment variable to explicitly disable prompts in the CLI.

### Patch Changes

- [#5759](https://github.com/keystonejs/keystone/pull/5759) [`016ccad82`](https://github.com/keystonejs/keystone/commit/016ccad82ed73898a64310506117c1cbae60a512) Thanks [@timleslie](https://github.com/timleslie)! - Suppresed migration console output when running tests.

- Updated dependencies [[`d40c2a590`](https://github.com/keystonejs/keystone/commit/d40c2a5903f07e5a1e80d116ec4cea00289bbf6a), [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d), [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab)]:
  - @keystone-next/adapter-prisma-legacy@7.0.0
  - @keystone-ui/button@5.0.0
  - @keystone-ui/core@3.0.0
  - @keystone-ui/fields@4.0.0
  - @keystone-ui/icons@4.0.0
  - @keystone-ui/loading@4.0.0
  - @keystone-ui/modals@4.0.0
  - @keystone-ui/notice@4.0.0
  - @keystone-ui/options@4.0.0
  - @keystone-ui/pill@4.0.0
  - @keystone-ui/popover@4.0.0
  - @keystone-ui/toast@4.0.0
  - @keystone-ui/tooltip@4.0.0
  - @keystone-next/admin-ui-utils@5.0.0
  - @keystone-next/fields@9.0.0
  - @keystone-next/types@18.0.0
  - @keystone-next/access-control-legacy@11.0.0
  - @keystone-next/utils-legacy@11.0.0

## 17.2.0

### Minor Changes

- [#5143](https://github.com/keystonejs/keystone/pull/5143) [`1ef9986dd`](https://github.com/keystonejs/keystone/commit/1ef9986ddc5a4a881a3fc6fae3d1420447174fdb) Thanks [@timleslie](https://github.com/timleslie)! - Added `graphql.cacheHint` configuration for lists and fields.

### Patch Changes

- [#5727](https://github.com/keystonejs/keystone/pull/5727) [`737b3e6e5`](https://github.com/keystonejs/keystone/commit/737b3e6e53d0948de8f1419709ece5648ff4529a) Thanks [@cameronbraid](https://github.com/cameronbraid)! - Fixed a bug in `storedSessions` not correctly identifying the current `sessionId`.

* [#5686](https://github.com/keystonejs/keystone/pull/5686) [`62e68c8e5`](https://github.com/keystonejs/keystone/commit/62e68c8e5b4964785a173ab05ff89cba9cc685f2) Thanks [@timleslie](https://github.com/timleslie)! - Reduced the explicit dependence on the internal Keystone object when creating context objects.

- [#5673](https://github.com/keystonejs/keystone/pull/5673) [`deb7f9504`](https://github.com/keystonejs/keystone/commit/deb7f9504573da67b0cd76d3f53dc0fcceaf1021) Thanks [@timleslie](https://github.com/timleslie)! - Refactored code to parse `config.db`. No functional changes.

- Updated dependencies [[`62e68c8e5`](https://github.com/keystonejs/keystone/commit/62e68c8e5b4964785a173ab05ff89cba9cc685f2), [`deb7f9504`](https://github.com/keystonejs/keystone/commit/deb7f9504573da67b0cd76d3f53dc0fcceaf1021), [`1ef9986dd`](https://github.com/keystonejs/keystone/commit/1ef9986ddc5a4a881a3fc6fae3d1420447174fdb), [`669f0d8ac`](https://github.com/keystonejs/keystone/commit/669f0d8acfce5d6b7eaaa972ab354597c53c2568)]:
  - @keystone-next/types@17.1.0
  - @keystone-next/admin-ui@14.1.3

## 17.1.1

### Patch Changes

- [#5613](https://github.com/keystonejs/keystone/pull/5613) [`85dfdfb1e`](https://github.com/keystonejs/keystone/commit/85dfdfb1ea236bb1515ac6df43f974b30d0bf89a) Thanks [@timleslie](https://github.com/timleslie)! - Improved the types of `withItemData`.

- Updated dependencies [[`3aea3b12f`](https://github.com/keystonejs/keystone/commit/3aea3b12fd0047e54671ead796fca15b625ade66), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`b0a72a112`](https://github.com/keystonejs/keystone/commit/b0a72a112dae7857defc8b745e674d55a29be766), [`79a0844b9`](https://github.com/keystonejs/keystone/commit/79a0844b9d5125891e3eaad4dc3999b232cefaa2), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`2b3efc8a8`](https://github.com/keystonejs/keystone/commit/2b3efc8a883e1e5832ed5111a6e0e4d3ee59f162), [`fc9c3d55d`](https://github.com/keystonejs/keystone/commit/fc9c3d55d5a2e6a87bcb9e9ed50a19a503290457), [`400d88257`](https://github.com/keystonejs/keystone/commit/400d88257a3383595cf76c9399848b356dd51a11), [`dbe831976`](https://github.com/keystonejs/keystone/commit/dbe831976eeee876f3722d4b96e1b752b67cb945), [`53225b0ef`](https://github.com/keystonejs/keystone/commit/53225b0efcf33810c1c91a0a4ec3e2369733ab0a), [`79d092afc`](https://github.com/keystonejs/keystone/commit/79d092afca565abe780e84d917299ecb749752f1), [`bb8920843`](https://github.com/keystonejs/keystone/commit/bb8920843a1e0d803b8238bd17e9d65802698685)]:
  - @keystone-next/admin-ui@14.1.2
  - @keystone-next/fields@8.2.0

## 17.1.0

### Minor Changes

- [#5609](https://github.com/keystonejs/keystone/pull/5609) [`1c0265171`](https://github.com/keystonejs/keystone/commit/1c0265171db2e334c25d014d855ec919c3d4782c) Thanks [@renovate](https://github.com/apps/renovate)! - Upgraded Primsa dependency to `2.22.0`.

### Patch Changes

- [#5601](https://github.com/keystonejs/keystone/pull/5601) [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.2.0`.

* [#5592](https://github.com/keystonejs/keystone/pull/5592) [`1043243ff`](https://github.com/keystonejs/keystone/commit/1043243ff5a22bb067cf4aa6e46d28a529203121) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed uncaught exception in file stream.

* Updated dependencies [[`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9), [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b)]:
  - @keystone-next/fields@8.1.0
  - @keystone-next/adapter-prisma-legacy@6.1.0
  - @keystone-next/admin-ui@14.1.1

## 17.0.0

### Major Changes

- [#5582](https://github.com/keystonejs/keystone/pull/5582) [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Changed image ref to now be `${mode}:image:${id}`.

### Minor Changes

- [#5570](https://github.com/keystonejs/keystone/pull/5570) [`2df2fa021`](https://github.com/keystonejs/keystone/commit/2df2fa0213146adab79e5e17c60d43259041093d) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added `maxFileSize` property to keystone config.

### Patch Changes

- [#5547](https://github.com/keystonejs/keystone/pull/5547) [`18ae28bde`](https://github.com/keystonejs/keystone/commit/18ae28bde943c140332ad5e0cd0b5238555fb1b8) Thanks [@timleslie](https://github.com/timleslie)! - Consolidate the code from the `@keystone-next/server-side-graphql-client-legacy` package into the main package.

* [#5518](https://github.com/keystonejs/keystone/pull/5518) [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5) Thanks [@timleslie](https://github.com/timleslie)! - Updated the list item and db item APIs to include an empty default for `.findMany()` and `.count()`.

- [#5522](https://github.com/keystonejs/keystone/pull/5522) [`fbf5f77c5`](https://github.com/keystonejs/keystone/commit/fbf5f77c515b2413c4019b4a521dd4f4aa965276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the call to `createImagesContext` into `makeCreateContext()`.

* [#5514](https://github.com/keystonejs/keystone/pull/5514) [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6) Thanks [@timleslie](https://github.com/timleslie)! - The field hooks API has deprecated the `addFieldValidationError` argument. It has been replaced with the argument `addValidationError`, and will be removed in a future release.

- [#5523](https://github.com/keystonejs/keystone/pull/5523) [`91e603d7a`](https://github.com/keystonejs/keystone/commit/91e603d7a686185c145bcbc445a27939f94aafa8) Thanks [@timleslie](https://github.com/timleslie)! - Moved internal code into subdirectories for easier navigation.

* [#5517](https://github.com/keystonejs/keystone/pull/5517) [`a6cdf3da8`](https://github.com/keystonejs/keystone/commit/a6cdf3da8a9b2ca943048fee6cacd376ea4aae50) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug using the items API to create/update `image` field items.

- [#5552](https://github.com/keystonejs/keystone/pull/5552) [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc) Thanks [@timleslie](https://github.com/timleslie)! - Update `context.lists.<list>.count()` to use the GraphQL API rather than directly calling the resolver.

* [#5524](https://github.com/keystonejs/keystone/pull/5524) [`ddf51724a`](https://github.com/keystonejs/keystone/commit/ddf51724ab2043f395d1d197213748c06a5300b7) Thanks [@timleslie](https://github.com/timleslie)! - Removed un-implemented export `singleton` from `schema/`.

- [#5569](https://github.com/keystonejs/keystone/pull/5569) [`d216fd04c`](https://github.com/keystonejs/keystone/commit/d216fd04c92ec594fb9b448025fc3e23fe6dfdad) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Refactored implementation of db lists API

* [#5515](https://github.com/keystonejs/keystone/pull/5515) [`f76938ac2`](https://github.com/keystonejs/keystone/commit/f76938ac223194ce401179fd9fa1226e11077277) Thanks [@timleslie](https://github.com/timleslie)! - Simplified the implementation of the images context API.

* Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee), [`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`dbc62ff7c`](https://github.com/keystonejs/keystone/commit/dbc62ff7c71ca4d4db1fab76f3e0ab729af5b80c), [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6), [`05d4883ee`](https://github.com/keystonejs/keystone/commit/05d4883ee19bcfdfcbff7f80693a3fa85cf81aaa), [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e), [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351)]:
  - @keystone-next/admin-ui@14.1.0
  - @keystone-next/fields@8.0.0
  - @keystone-next/types@17.0.1
  - @keystone-next/adapter-prisma-legacy@6.0.1
  - @keystone-next/utils-legacy@10.0.0
  - @keystone-next/access-control-legacy@10.0.1

## 16.0.0

### Major Changes

- [#5467](https://github.com/keystonejs/keystone/pull/5467) [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc) Thanks [@timleslie](https://github.com/timleslie)! - Removed the deprecated `context.executeGraphQL`. Identical functionality is available via `context.graphql.raw`.

* [#5478](https://github.com/keystonejs/keystone/pull/5478) [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed) Thanks [@timleslie](https://github.com/timleslie)! - Improved types for `BaseKeystoneList`.

- [#5404](https://github.com/keystonejs/keystone/pull/5404) [`d9e1acb30`](https://github.com/keystonejs/keystone/commit/d9e1acb30e384ce88e6681ba9d299d917dea97d9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Started formatting GraphQL schema written to `schema.graphql` with Prettier

* [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

- [#5420](https://github.com/keystonejs/keystone/pull/5420) [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2) Thanks [@timleslie](https://github.com/timleslie)! - Updated core fields implementation to expect an internal option `type.adapter` rather than `type.adapters.prisma`.

* [#5463](https://github.com/keystonejs/keystone/pull/5463) [`309596591`](https://github.com/keystonejs/keystone/commit/3095965915adbb93ff6879d4e9bf3f0dd504708c) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `_listMeta` type from the generated GraphQL API.

### Minor Changes

- [#5451](https://github.com/keystonejs/keystone/pull/5451) [`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624) Thanks [@JedWatson](https://github.com/JedWatson)! - With the goal of making the Lists API (i.e `context.lists.{List}`) more intuitive to use, the `resolveFields` option has been deprecated in favor of two new methods:

  (1) You can specify a string of fields to return with the new `query` option, when you want to query for resolved field values (including querying relationships and virtual fields). This replaces the `resolveFields: false` use case.

  For example, to query a Post you would now write:

  ```js
  const [post] = await context.lists.Post.findMany({
    where: { slug },
    query: `
      title
      content
      image {
        src
        width
        height
      }`,
  });
  ```

  (2) Alternatively, there is a new set of APIs on `context.db.lists.{List}` which will return the unresolved item data from the database (but with read hooks applied), which can then be referenced directly or returned from a custom mutation or query in the GraphQL API to be handled by the Field resolvers. This replaces the `resolveFields: boolean` use case.

  For example, to query for the raw data stored in the database, you would write:

  ```js
  const [post] = await context.db.lists.Post.findMany({
    where: { slug },
  });
  ```

* [#5325](https://github.com/keystonejs/keystone/pull/5325) [`3d3fb860f`](https://github.com/keystonejs/keystone/commit/3d3fb860faa303cbfe75eeb0855a8a575113320c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated to Prisma 2.20

- [#5378](https://github.com/keystonejs/keystone/pull/5378) [`6861ecb40`](https://github.com/keystonejs/keystone/commit/6861ecb40345434f8d070950a3c8fb85f3d59994) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma to 2.21

* [#5396](https://github.com/keystonejs/keystone/pull/5396) [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added create-image-context, logic for parsing, storing and retrieving image data in keystone core.

### Patch Changes

- [#5452](https://github.com/keystonejs/keystone/pull/5452) [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124) Thanks [@timleslie](https://github.com/timleslie)! - Removed the legacy `defaultAccess` argument from the `Keystone` constructor.

* [#5402](https://github.com/keystonejs/keystone/pull/5402) [`588f31ddc`](https://github.com/keystonejs/keystone/commit/588f31ddce15ab752a987a1dc1429fa1d6f03d7c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Refactored to make testing the cli easier

- [#5444](https://github.com/keystonejs/keystone/pull/5444) [`781b3e5ab`](https://github.com/keystonejs/keystone/commit/781b3e5abcf9a8b6d29c86d6470adfd08b4413c8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed an error being printed to the console when the Prisma CLI exited with a non-zero exit code when running `keystone-next prisma`

* [#5429](https://github.com/keystonejs/keystone/pull/5429) [`49025d1ad`](https://github.com/keystonejs/keystone/commit/49025d1ad0d85c4f80e5430a365c4fc78db96c92) Thanks [@timleslie](https://github.com/timleslie)! - Removed the internal `_label_` field which is no longer used.

- [#5445](https://github.com/keystonejs/keystone/pull/5445) [`24e62e29c`](https://github.com/keystonejs/keystone/commit/24e62e29c51c04448a272a25292251fc13e06d7a) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused and inaccessible code from the core.

* [#5428](https://github.com/keystonejs/keystone/pull/5428) [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed printing the incorrect migrations directory to the console

- [#5426](https://github.com/keystonejs/keystone/pull/5426) [`202d362f3`](https://github.com/keystonejs/keystone/commit/202d362f38d0c8827263e6cd2d286d8dcbdd22ad) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated CLI help message to match documentation

* [#5403](https://github.com/keystonejs/keystone/pull/5403) [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Moved core logic in keyToLabel to the @keystone-next/utils-legacy package.

- [#5458](https://github.com/keystonejs/keystone/pull/5458) [`962cde7e3`](https://github.com/keystonejs/keystone/commit/962cde7e32ec7ce23d15180f315549f4f34069ee) Thanks [@timleslie](https://github.com/timleslie)! - Set PRISMA_HIDE_UPDATE_MESSAGE=1 to silence Prisma update messages, since these are out of the hands of the developer.

* [#5443](https://github.com/keystonejs/keystone/pull/5443) [`f67497c1a`](https://github.com/keystonejs/keystone/commit/f67497c1a9dd7462e7d6564250712f5456dc5cb0) Thanks [@timleslie](https://github.com/timleslie)! - Removed legacy support for auxilliary lists.

- [#5460](https://github.com/keystonejs/keystone/pull/5460) [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the core code from the `@keystone-next/keystone-legacy` package into `@keystone-next/keystone`.

* [#5466](https://github.com/keystonejs/keystone/pull/5466) [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78) Thanks [@timleslie](https://github.com/timleslie)! - Improved the `BaseKeystone` type to be more correct.

- [#5407](https://github.com/keystonejs/keystone/pull/5407) [`76692d266`](https://github.com/keystonejs/keystone/commit/76692d26642eabf23d2ef038dec35d35d4e35d31) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug where `context.prisma` was `undefined` in the `onConnect()` function.

* [#5400](https://github.com/keystonejs/keystone/pull/5400) [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the `Implementation` base class from the `fields-legacy` package into the `fields` package.

- [#5390](https://github.com/keystonejs/keystone/pull/5390) [`ad1776b74`](https://github.com/keystonejs/keystone/commit/ad1776b7418b7a0d1c8e5def8d82051752c01aa9) Thanks [@timleslie](https://github.com/timleslie)! - Silenced logging when running CI tests.

* [#5428](https://github.com/keystonejs/keystone/pull/5428) [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed casing of GraphQL in message logged in `keystone-next dev`

- [#5366](https://github.com/keystonejs/keystone/pull/5366) [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.1.3`.

* [#5393](https://github.com/keystonejs/keystone/pull/5393) [`a73aea7d7`](https://github.com/keystonejs/keystone/commit/a73aea7d78d4c520856f06f9d1b79efe4b36993b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed reading config file to be local to the passed directory instead of `process.cwd()`

* Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`b0db0a7a8`](https://github.com/keystonejs/keystone/commit/b0db0a7a8d3aa46a8034022c456ea5100b129dc0), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`8ab2c9bb6`](https://github.com/keystonejs/keystone/commit/8ab2c9bb6633c2f85844e658f534582c30a39a57), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`5f2673704`](https://github.com/keystonejs/keystone/commit/5f2673704e997710a088c45e9d95d22e1195b2da), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`ea708559f`](https://github.com/keystonejs/keystone/commit/ea708559fbd19914fe7eb52f519937e5fe50a143), [`49ecca74d`](https://github.com/keystonejs/keystone/commit/49ecca74d2f550df9f7be630c577ad7e6cca573c), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85), [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853)]:
  - @keystone-next/admin-ui@14.0.0
  - @keystone-next/types@17.0.0
  - @keystone-next/fields@7.0.0
  - @keystone-next/adapter-prisma-legacy@6.0.0
  - @keystone-next/utils-legacy@9.0.0
  - @keystone-next/access-control-legacy@10.0.0
  - @keystone-next/server-side-graphql-client-legacy@4.0.0

## 15.0.0

### Major Changes

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `deploy`, `reset` and `generate` commands with `keystone-next prisma`. You can use these commands as replacements for the old commands:

  - `keystone-next deploy` -> `keystone-next prisma migrate deploy`
  - `keystone-next reset` -> `keystone-next prisma migrate reset`
  - `keystone-next generate` -> `keystone-next prisma migrate dev`

* [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `migrationAction` argument to `createSystem` and require that the PrismaClient is passed to `createSystem` to be able to connect to the database.

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next build` command to validate that the GraphQL and Prisma schemas are up to date.

* [#5287](https://github.com/keystonejs/keystone/pull/5287) [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `getDbSchemaName` and `getPrismaPath` database adapter options. To change the database schema that Keystone uses, you can add `?schema=whatever` to the database url.

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved generated `schema.prisma` to the root of the project directory. Note that this also moves the location of migrations from `.keystone/prisma/migrations` to `migrations` at the root of the project.

* [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `dotKeystonePath` argument from `createSystem`

- [#5256](https://github.com/keystonejs/keystone/pull/5256) [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for the `knex` and `mongoose` database adapters. We now only support `prisma_postgresql` and `prisma_sqlite`.

* [#5285](https://github.com/keystonejs/keystone/pull/5285) [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `dropDatabase` method and config option

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved generated GraphQL schema to `schema.graphql` to the root of the project. We recommend that you commit this file to your repo.

### Minor Changes

- [#5344](https://github.com/keystonejs/keystone/pull/5344) [`901817fed`](https://github.com/keystonejs/keystone/commit/901817fedf4bcfb269416c3c68093ae0263f4d00) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added prompt before dropping the database or applying a change to the database that could lose data when `db.useMigrations` is set to false in `keystone-next dev`

* [#5276](https://github.com/keystonejs/keystone/pull/5276) [`1a4db6c87`](https://github.com/keystonejs/keystone/commit/1a4db6c87c17706c8e5db2816e0a6b1b8f79e217) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `artifacts` entrypoint.

- [#5368](https://github.com/keystonejs/keystone/pull/5368) [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8) Thanks [@timleslie](https://github.com/timleslie)! - The config option `db.adapter` is now deprecated. It has been repaced with `db.provider` which can take the values `postgresql` or `sqlite`.

* [#5321](https://github.com/keystonejs/keystone/pull/5321) [`5c4b48636`](https://github.com/keystonejs/keystone/commit/5c4b4863638cffa794dd1b02c445a87655a4178c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `--reset-db` flag to `keystone-next dev` to reset the database before starting Keystone

- [#5283](https://github.com/keystonejs/keystone/pull/5283) [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b) Thanks [@timleslie](https://github.com/timleslie)! - The flag `{ experimental: { prismaSqlite: true } }` is no longer required to use the SQLite adapter.

* [#5341](https://github.com/keystonejs/keystone/pull/5341) [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `generateNextGraphqlAPI` and `generateNodeAPI` experimental options

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `keystone-next postinstall` command which verifies that the Prisma and GraphQL schemas are up to date with a `--fix` flag to automatically update them without a prompt.

* [#5341](https://github.com/keystonejs/keystone/pull/5341) [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `withKeystone` in `next` entrypoint

- [#5302](https://github.com/keystonejs/keystone/pull/5302) [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `migrations` entrypoint with `pushPrismaSchemaToDatabase` export.

### Patch Changes

- [#5280](https://github.com/keystonejs/keystone/pull/5280) [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `adapters-mongoose-legacy` packages dependency.

- Updated dependencies [[`1261c398b`](https://github.com/keystonejs/keystone/commit/1261c398b94ffef2737226cceaebaed1b3c04c72), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`955787055`](https://github.com/keystonejs/keystone/commit/955787055a54fb33eb45c80dd39fa86a9ff632a0), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`fda82869c`](https://github.com/keystonejs/keystone/commit/fda82869c376d05fd007bec22d7bde2604db445b), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b), [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca), [`4f0abec0b`](https://github.com/keystonejs/keystone/commit/4f0abec0b19c3495c1ae6d7dac49fb46253cf7b3), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`bc21855a7`](https://github.com/keystonejs/keystone/commit/bc21855a7ff6dd4dbc278b3e15c9157de765e6ba)]:
  - @keystone-next/adapter-prisma-legacy@5.0.0
  - @keystone-next/keystone-legacy@23.0.0
  - @keystone-next/types@16.0.0
  - @keystone-next/admin-ui@13.0.0
  - @keystone-next/fields@6.0.0
  - @keystone-next/server-side-graphql-client-legacy@3.0.1

## 14.0.1

### Patch Changes

- [#5229](https://github.com/keystonejs/keystone/pull/5229) [`fe4b48907`](https://github.com/keystonejs/keystone/commit/fe4b48907fc002711640bfdf4644eb6d2d8643b6) Thanks [@raveling](https://github.com/raveling)! - Updated command line output emojis to be more friendly

* [#5198](https://github.com/keystonejs/keystone/pull/5198) [`b36758a12`](https://github.com/keystonejs/keystone/commit/b36758a121c096e8776420949c77a5304957a969) Thanks [@timleslie](https://github.com/timleslie)! - Removed the legacy `cookieSecret`, `cookie`, and `sessionStore` arguments from the `Keystone` constructor.

* Updated dependencies [[`0e01f471d`](https://github.com/keystonejs/keystone/commit/0e01f471dc669e46c88233cb8ce698749ddcf4fa), [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21), [`f73cc9377`](https://github.com/keystonejs/keystone/commit/f73cc93779c9fce1f86730e065c02ede92016ad2), [`e944b1ebb`](https://github.com/keystonejs/keystone/commit/e944b1ebbede95500b06028c591ee8947278a479), [`db6cb59dc`](https://github.com/keystonejs/keystone/commit/db6cb59dc0d32e3700c5aa0202428b627c40503d), [`ca1be4156`](https://github.com/keystonejs/keystone/commit/ca1be415663dd822b3adda1e073bd7a1d4a9b97b), [`7ae452ad1`](https://github.com/keystonejs/keystone/commit/7ae452ad144d1186225e94ff39be0eaf9983f585), [`45272d0b1`](https://github.com/keystonejs/keystone/commit/45272d0b1dc68e6ae8dbc4cfda790b3a50cf1b25), [`ade638de0`](https://github.com/keystonejs/keystone/commit/ade638de07142e8ecd0c3bf6c805eed76fd89878), [`2a1fc416e`](https://github.com/keystonejs/keystone/commit/2a1fc416e8f0a83e108a72fcec81b380c601f3ef), [`5510ae33f`](https://github.com/keystonejs/keystone/commit/5510ae33fb18d42e378a00f1f78b803fb01b3fad), [`da900777a`](https://github.com/keystonejs/keystone/commit/da900777a27264595a68fe1ed0e7a689944eb372), [`4d405390c`](https://github.com/keystonejs/keystone/commit/4d405390c0f8dcc37e6fe4da7ce3866c699088f3), [`34dd809ee`](https://github.com/keystonejs/keystone/commit/34dd809eef2368bba1e50ed613b36c5dac7262d1), [`0b679b742`](https://github.com/keystonejs/keystone/commit/0b679b742fb0d5d4c19db4498e327c44dd68b963), [`b36758a12`](https://github.com/keystonejs/keystone/commit/b36758a121c096e8776420949c77a5304957a969), [`fe9fc5e0d`](https://github.com/keystonejs/keystone/commit/fe9fc5e0de8cefb889624e43bc281ac408bcd3b8), [`b8cd13fdf`](https://github.com/keystonejs/keystone/commit/b8cd13fdfcec645140a06b0331b240583eace061), [`32578f01e`](https://github.com/keystonejs/keystone/commit/32578f01e70ea972d438a29fa1e3793c1e02750b)]:
  - @keystone-next/fields@5.4.0
  - @keystone-next/server-side-graphql-client-legacy@3.0.0
  - @keystone-next/keystone-legacy@22.0.0
  - @keystone-next/types@15.0.1
  - @keystone-next/adapter-knex-legacy@13.2.3
  - @keystone-next/adapter-mongoose-legacy@11.1.3
  - @keystone-next/adapter-prisma-legacy@4.0.1

## 14.0.0

### Major Changes

- [#5168](https://github.com/keystonejs/keystone/pull/5168) [`343b74246`](https://github.com/keystonejs/keystone/commit/343b742468e01a6cf9003ee47ee2d2a6d9dbd011) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `withItemData` returning sessions that don't match an item rather than treating them as invalid

### Patch Changes

- Updated dependencies []:
  - @keystone-next/admin-ui@12.0.1

## 13.0.0

### Major Changes

- [#5087](https://github.com/keystonejs/keystone/pull/5087) [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `createKeystone` and `createSystem` to accept a migration mode rather than script

* [#5135](https://github.com/keystonejs/keystone/pull/5135) [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next dev` with the Prisma adapter so that it interactively prompts for creating and applying a migration

- [#5163](https://github.com/keystonejs/keystone/pull/5163) [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `db.useMigrations` option to replace using `keystone-next dev` and `keystone-next prototype` depending on what kind of migration strategy you want to use. If you were previously using `keystone-next dev`, you should set `db.useMigrations` to true in your config and continue using `keystone-next dev`. If you were previously using `keystone-next prototype`, you should now use `keystone-next dev`.

* [#5155](https://github.com/keystonejs/keystone/pull/5155) [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `createOnly` migration mode

- [#5163](https://github.com/keystonejs/keystone/pull/5163) [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `MigrationMode` type with `MigrationAction` that `createSystem` and `createKeystone` now accept.

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

* [#5102](https://github.com/keystonejs/keystone/pull/5102) [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `none-skip-client-generation` migrationMode

- [#5148](https://github.com/keystonejs/keystone/pull/5148) [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next deploy` to use Prisma's programmatic APIs to apply migrations

* [#5155](https://github.com/keystonejs/keystone/pull/5155) [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed `keystone-next generate` so that it uses Prisma's programmatic APIs to generate migrations and it accepts the following options as command line arguments or as prompts:

  - `--name` to set the name of the migration
  - `--accept-data-loss` to allow resetting the database when it is out of sync with the migrations
  - `--allow-empty` to create an empty migration when there are no changes to the schema

- [#5084](https://github.com/keystonejs/keystone/pull/5084) [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b) Thanks [@timleslie](https://github.com/timleslie)! - Updated `context.sudo()` to provide access to all operations, including those excluded by `{ access: false }` in the public schema.

* [#5152](https://github.com/keystonejs/keystone/pull/5152) [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next reset` to use Prisma's programmatic APIs to reset the database.

- [#4912](https://github.com/keystonejs/keystone/pull/4912) [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.graphql.apolloConfig` option to allow developers to configure the `ApolloServer` object provided by Keystone.

### Patch Changes

- [#5099](https://github.com/keystonejs/keystone/pull/5099) [`bfeb927be`](https://github.com/keystonejs/keystone/commit/bfeb927be5c80fac2dadd800295fd4789c53f1ce) Thanks [@timleslie](https://github.com/timleslie)! - Updated `context.graphql.raw` and `context.graphql.run` to use the GraphQL function `graphql` rather than `execute`. This function performs more rigorous query validation before executing the query.

* [#5096](https://github.com/keystonejs/keystone/pull/5096) [`b7ce464a2`](https://github.com/keystonejs/keystone/commit/b7ce464a261321fe3344898fa4f4a91e6fa8dbb1) Thanks [@timleslie](https://github.com/timleslie)! - Updated items API to handle static `false` access control.

- [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

* [#5152](https://github.com/keystonejs/keystone/pull/5152) [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `keystone-next reset` saying that it is not a command that keystone-next accepts

* Updated dependencies [[`1eeac4722`](https://github.com/keystonejs/keystone/commit/1eeac4722da174307152dad9b5adf5062e4b6403), [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d), [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`ec6f9b601`](https://github.com/keystonejs/keystone/commit/ec6f9b601ea6fdbfb2335a5e81b7ec3f1b0e4d4d), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`2bccf71b1`](https://github.com/keystonejs/keystone/commit/2bccf71b152a9be65a2df6a9751f1d7a382041ae), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`a4002b045`](https://github.com/keystonejs/keystone/commit/a4002b045b3e783971c382f9373159c04845beeb), [`4ac9148a0`](https://github.com/keystonejs/keystone/commit/4ac9148a0fa5b302d50e0ca4293206e2ef3616b7), [`2ff93692a`](https://github.com/keystonejs/keystone/commit/2ff93692aaef70474449f30fb249eae8aa33a64a), [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02), [`bafdcb7bd`](https://github.com/keystonejs/keystone/commit/bafdcb7bdcba641bb8a00689a2bcefed10f4d890), [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91), [`543232c3f`](https://github.com/keystonejs/keystone/commit/543232c3f151f2294cf63e0944d1724b7b0ac33e)]:
  - @keystone-next/fields@5.3.0
  - @keystone-next/types@15.0.0
  - @keystone-next/adapter-prisma-legacy@4.0.0
  - @keystone-next/keystone-legacy@21.0.0
  - @keystone-next/admin-ui@12.0.0
  - @keystone-next/adapter-mongoose-legacy@11.1.2
  - @keystone-next/adapter-knex-legacy@13.2.2

## 12.0.0

### Major Changes

- [#5082](https://github.com/keystonejs/keystone/pull/5082) [`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1) Thanks [@timleslie](https://github.com/timleslie)! - Updated `createApolloServerMicro` to take system arguments rather than a `KeystoneConfig` object.

### Minor Changes

- [#5085](https://github.com/keystonejs/keystone/pull/5085) [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added an option to pass in the prisma client to use instead of attempting to generate one and `require()`ing it to fix the experimental `enableNextJsGraphqlApiEndpoint` option not working on Vercel

* [#5085](https://github.com/keystonejs/keystone/pull/5085) [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed experimental `enableNextJsGraphqlApiEndpoint` option so that it doesn't use the API Route when running through Keystone's CLI

### Patch Changes

- Updated dependencies [[`c45cbb9b1`](https://github.com/keystonejs/keystone/commit/c45cbb9b14010b3ced7ea012f3502998ba2ec393), [`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1), [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761), [`b4b276cf6`](https://github.com/keystonejs/keystone/commit/b4b276cf66f90dce2d711c144c0d99c4752f1f5e), [`ab14e7043`](https://github.com/keystonejs/keystone/commit/ab14e70435ef89cf702d407c90396eca53bc3f4d), [`7ad7430dc`](https://github.com/keystonejs/keystone/commit/7ad7430dc377f79f7ad4024879ec2966ba0d185f)]:
  - @keystone-next/keystone-legacy@20.0.0
  - @keystone-next/admin-ui@11.0.0
  - @keystone-next/adapter-prisma-legacy@3.3.0
  - @keystone-next/app-graphql-legacy@7.0.0
  - @keystone-next/adapter-knex-legacy@13.2.1
  - @keystone-next/adapter-mongoose-legacy@11.1.1
  - @keystone-next/fields@5.2.1

## 11.0.2

### Patch Changes

- [#5079](https://github.com/keystonejs/keystone/pull/5079) [`57c98c90e`](https://github.com/keystonejs/keystone/commit/57c98c90ee4220bcc59925a154a231989d25de51) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@hapi/iron` to `^6.0.0`.

* [#5068](https://github.com/keystonejs/keystone/pull/5068) [`ed3c98839`](https://github.com/keystonejs/keystone/commit/ed3c988392bce981ef7d81c1eb14a045c6198da8) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Fixed issue where createKeystone would call prisma migrate dev when the build script was run

* Updated dependencies [[`3eabc35e0`](https://github.com/keystonejs/keystone/commit/3eabc35e0d41b60449ff456e9a0ec3eabf360508)]:
  - @keystone-next/adapter-knex-legacy@13.2.0

## 11.0.1

### Patch Changes

- [`9b202b31a`](https://github.com/keystonejs/keystone/commit/9b202b31a7d4944b709fe0ce58d6ca7ec1523a02) [#5033](https://github.com/keystonejs/keystone/pull/5033) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added `experimental` config namespace and `enableNextJsGraphqlApiEndpoint` property to support the GraphQL API being served from a Next.js API route rather than Express

- Updated dependencies [[`7bb173018`](https://github.com/keystonejs/keystone/commit/7bb173018afc6d8af4c602dc86c5c4b471277b97), [`aba7c45d7`](https://github.com/keystonejs/keystone/commit/aba7c45d7645aa71b50de070d37896b73248751a), [`9b202b31a`](https://github.com/keystonejs/keystone/commit/9b202b31a7d4944b709fe0ce58d6ca7ec1523a02)]:
  - @keystone-next/adapter-prisma-legacy@3.2.0
  - @keystone-next/fields@5.2.0
  - @keystone-next/admin-ui@10.0.1
  - @keystone-next/types@14.0.1

## 11.0.0

### Major Changes

- [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a) [#4923](https://github.com/keystonejs/keystone/pull/4923) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed isAccessAllowed default so that if a session strategy is not used, access is always allowed to the Admin UI rather than never allowing access

* [`562cccbe1`](https://github.com/keystonejs/keystone/commit/562cccbe12f257a4ee13d23ed64b5ef4b325c1b1) [#4935](https://github.com/keystonejs/keystone/pull/4935) Thanks [@timleslie](https://github.com/timleslie)! - Removed `itemId` from `FieldAccessArgs` and no longer pass this value into field level imperative access control rules.

- [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3) [#4945](https://github.com/keystonejs/keystone/pull/4945) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `context` argument from `KeystoneContext.graphql.raw` and `KeystoneContext.graphql.run`.

* [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f) [#4832](https://github.com/keystonejs/keystone/pull/4832) Thanks [@timleslie](https://github.com/timleslie)! - Replaced the function `implementSession` with `createSessionContext`.

- [`6469362a1`](https://github.com/keystonejs/keystone/commit/6469362a15bdee579937e17527a6c31e5411312a) [#4936](https://github.com/keystonejs/keystone/pull/4936) Thanks [@timleslie](https://github.com/timleslie)! - Removed `itemIds` from `FieldAccessArgs` and no longer pass this value into field level imperative access control rules.

* [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e) [#4839](https://github.com/keystonejs/keystone/pull/4839) Thanks [@timleslie](https://github.com/timleslie)! - Removed `context.graphql.createContext` from `KeystoneContext`.

### Minor Changes

- [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d) [#4866](https://github.com/keystonejs/keystone/pull/4866) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.ui.isDisabled` option to completely disable the Admin UI.

* [`0cd5acb82`](https://github.com/keystonejs/keystone/commit/0cd5acb82b2e640821c092eb429401eb9d7e8e9a) [#5017](https://github.com/keystonejs/keystone/pull/5017) Thanks [@timleslie](https://github.com/timleslie)! - Added an `isVerbose` flag to `createExpressServer` to allow it to be run silently during tests.

- [`f895a2671`](https://github.com/keystonejs/keystone/commit/f895a2671d410c4faa2f354d080d8ee6cc4761f2) [#4860](https://github.com/keystonejs/keystone/pull/4860) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated the require hook used to compile code in development to use Next's Babel preset when no Babel config is present in the user's config to mirror how Keystone is built for production with Next.

* [`7ae67b857`](https://github.com/keystonejs/keystone/commit/7ae67b857745985061700b0477c3f585b3b8efbf) [#4874](https://github.com/keystonejs/keystone/pull/4874) Thanks [@timleslie](https://github.com/timleslie)! - Exported the `createExpressServer` function to support running isolated unit tests against the GraphQL API.

- [`880fd5f92`](https://github.com/keystonejs/keystone/commit/880fd5f92881796d40e994d5b64dc3cc5c61e5e6) [#4951](https://github.com/keystonejs/keystone/pull/4951) Thanks [@yannick1691](https://github.com/yannick1691)! - Added `domain` option to session options for cookies.

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985) [#4835](https://github.com/keystonejs/keystone/pull/4835) Thanks [@timleslie](https://github.com/timleslie)! - Removed the unused `connect` and `disconnect` properties of `SessionStrategy`.

- [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914) [#4867](https://github.com/keystonejs/keystone/pull/4867) Thanks [@timleslie](https://github.com/timleslie)! - Removed generation of compiled configuration file from `generateAdminUI`. This is now handled by the `keystone-next build` command directly.

* [`fdb9d9abb`](https://github.com/keystonejs/keystone/commit/fdb9d9abbe1ea24a2dbb9ce6f755c713966601aa) [#4834](https://github.com/keystonejs/keystone/pull/4834) Thanks [@timleslie](https://github.com/timleslie)! - Updated `withItemData` to still return the rest of the `session` object if no item was found.

- [`ceab7dc69`](https://github.com/keystonejs/keystone/commit/ceab7dc6904df20f581d4693657043f156c2e8c9) [#5004](https://github.com/keystonejs/keystone/pull/5004) Thanks [@timleslie](https://github.com/timleslie)! - Moved session handling GraphQL schema code into the sessions module.

* [`c8cf7fb1f`](https://github.com/keystonejs/keystone/commit/c8cf7fb1fb7484d46a7e8b7c6c0b638ceae70d1a) [#4854](https://github.com/keystonejs/keystone/pull/4854) Thanks [@timleslie](https://github.com/timleslie)! - Added more specific types to implementation of access control validators.

* Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`f32316e6d`](https://github.com/keystonejs/keystone/commit/f32316e6deafdb9001874b08e3f4203250728676), [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a), [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985), [`9a9276eb7`](https://github.com/keystonejs/keystone/commit/9a9276eb7acded979b703b4f3ed8bce781e0718a), [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914), [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d), [`6f985acc7`](https://github.com/keystonejs/keystone/commit/6f985acc775d6037ac69a01215f962285de78c75), [`4eb4753e4`](https://github.com/keystonejs/keystone/commit/4eb4753e45e5a6ca37bdc756aef7adda7f551da4), [`53b8b659f`](https://github.com/keystonejs/keystone/commit/53b8b659ffc7db41e0e0d9ad7393e6a821187340), [`29e787983`](https://github.com/keystonejs/keystone/commit/29e787983bdc26b147d6b5f476e70768bbc5318c), [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f), [`0e265f6c1`](https://github.com/keystonejs/keystone/commit/0e265f6c10eadd37f75e5551b22b50236e830086), [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3), [`45ea93421`](https://github.com/keystonejs/keystone/commit/45ea93421f9a6cf9b7ccbd983e0c9cbd687ff6af), [`6c949dbf2`](https://github.com/keystonejs/keystone/commit/6c949dbf262350e280072d82cd48fdd31ff5ba6d), [`891cd490a`](https://github.com/keystonejs/keystone/commit/891cd490a17026f4af29f0ed9b9ca411747d1d63), [`bea9008f8`](https://github.com/keystonejs/keystone/commit/bea9008f82efea7fcf1cb547f3841915cd4689cc), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`a16d2cbff`](https://github.com/keystonejs/keystone/commit/a16d2cbffd9aa57d0cbdd783ff5ff0c699ff2d8b), [`c63e5d75c`](https://github.com/keystonejs/keystone/commit/c63e5d75cd77cf26f8762bda8143d1c1db6d0e3e), [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e), [`f826f15c6`](https://github.com/keystonejs/keystone/commit/f826f15c6e00fcfcef6d9153b261e8977f5117f1), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc)]:
  - @keystone-next/admin-ui@10.0.0
  - @keystone-next/fields@5.1.0
  - @keystone-next/types@14.0.0
  - @keystone-next/adapter-knex-legacy@13.1.0
  - @keystone-next/adapter-mongoose-legacy@11.1.0
  - @keystone-next/adapter-prisma-legacy@3.1.0
  - @keystone-next/app-graphql-legacy@6.2.2
  - @keystone-next/keystone-legacy@19.3.0
  - @keystone-next/server-side-graphql-client-legacy@2.0.1

## 10.0.0

### Major Changes

- [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee) [#4783](https://github.com/keystonejs/keystone/pull/4783) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced views hashes with indexes so that if the path to a view is different between the build and the running instance, the Admin UI does not break

* [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3) [#4818](https://github.com/keystonejs/keystone/pull/4818) Thanks [@timleslie](https://github.com/timleslie)! - Added `context.exitSudo()` and `context.withSession(session)` methods. Removed `context.createContext()`.

### Minor Changes

- [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d) [#4512](https://github.com/keystonejs/keystone/pull/4512) Thanks [@renovate](https://github.com/apps/renovate)! - Upgraded dependency `apollo-server-express` to `^2.21.0`. Apollo Server can now be installed with `graphql@15` without causing peer dependency errors or warnings.

* [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0) [#4815](https://github.com/keystonejs/keystone/pull/4815) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.sudo()` method to `context` objects, which is equivalent to the common operation `context.createContext({ skipAccessControl: true })`.

### Patch Changes

- [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765) [#4799](https://github.com/keystonejs/keystone/pull/4799) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improve type-safety of admin meta GraphQL API implementation

* [`a418fd535`](https://github.com/keystonejs/keystone/commit/a418fd5351b0070aab05380b658065be7916fb2a) [#4820](https://github.com/keystonejs/keystone/pull/4820) Thanks [@timleslie](https://github.com/timleslie)! - Updated `storedSessions` to internally manage store connection state.

- [`250daa2a2`](https://github.com/keystonejs/keystone/commit/250daa2a2c2693f415d9499a531095f3caf2a1d5) [#4808](https://github.com/keystonejs/keystone/pull/4808) Thanks [@timleslie](https://github.com/timleslie)! - Updated types of session functions.

- Updated dependencies [[`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf), [`208722a42`](https://github.com/keystonejs/keystone/commit/208722a4234434e116846756bab18f7e11674ec8), [`ad75e3d61`](https://github.com/keystonejs/keystone/commit/ad75e3d61c73ba1239fd21b58f175aac01d9f302), [`a0931858e`](https://github.com/keystonejs/keystone/commit/a0931858e499d9504e4e822b850dcf89c3cdac60), [`d8f64887f`](https://github.com/keystonejs/keystone/commit/d8f64887f2aa428ea8ac35d0efa50ce05534f40b), [`45b047ad0`](https://github.com/keystonejs/keystone/commit/45b047ad015fc9d72cf8c2b85529ffe3abbc189e), [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765), [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`954350389`](https://github.com/keystonejs/keystone/commit/9543503894c3e78a9b69a75cbfb3ca6b85ae34e8), [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3), [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystone-next/admin-ui@9.0.0
  - @keystone-next/fields@5.0.0
  - @keystone-next/types@13.0.0
  - @keystonejs/adapter-mongoose@11.0.1
  - @keystonejs/adapter-prisma@3.0.1
  - @keystonejs/adapter-knex@13.0.1
  - @keystonejs/keystone@19.2.0
  - @keystonejs/server-side-graphql-client@2.0.0

## 9.3.1

### Patch Changes

- [`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0) [#4770](https://github.com/keystonejs/keystone/pull/4770) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded Next.js dependency to `10.0.5`.

- Updated dependencies [[`6ecd2a766`](https://github.com/keystonejs/keystone/commit/6ecd2a766c868d46f84291bc1611eadef79e6100), [`777981069`](https://github.com/keystonejs/keystone/commit/7779810691c4154e1344ced4fb94c5bb9524a71f), [`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0), [`4d808eaa5`](https://github.com/keystonejs/keystone/commit/4d808eaa5aa1593ad1e54000d80f674f7c4d12bd)]:
  - @keystone-next/types@12.0.1
  - @keystone-next/admin-ui@8.0.2

## 9.3.0

### Minor Changes

- [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652) [#4669](https://github.com/keystonejs/keystone/pull/4669) Thanks [@MurzNN](https://github.com/MurzNN)! - Added the ability to set the server port number via `config.server.port`.

### Patch Changes

- [`26543bd07`](https://github.com/keystonejs/keystone/commit/26543bd0752c470e336d61644c14e6a5333f65c0) [#4758](https://github.com/keystonejs/keystone/pull/4758) Thanks [@timleslie](https://github.com/timleslie)! - Improved help message of the `keystone-next` CLI.

* [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33) [#4756](https://github.com/keystonejs/keystone/pull/4756) Thanks [@timleslie](https://github.com/timleslie)! - Added correct types for `config.server.cors`.

* Updated dependencies [[`1744c5f05`](https://github.com/keystonejs/keystone/commit/1744c5f05c9a13e680aaa1ed151f23f1d015ed9c), [`d9675553b`](https://github.com/keystonejs/keystone/commit/d9675553b33f39e2c7ada7eb6555d16e9fccb37e), [`3c1fa3203`](https://github.com/keystonejs/keystone/commit/3c1fa3203a6a9eeb2525c256f858f2e6cebea804), [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652), [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5), [`fb8bcff91`](https://github.com/keystonejs/keystone/commit/fb8bcff91ef487730164c3330e0742ab13d9b3d7), [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33)]:
  - @keystone-next/types@12.0.0
  - @keystonejs/keystone@19.1.0
  - @keystone-next/admin-ui@8.0.1
  - @keystone-next/fields@4.1.1

## 9.2.0

### Minor Changes

- [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099) [#4728](https://github.com/keystonejs/keystone/pull/4728) Thanks [@timleslie](https://github.com/timleslie)! - Added new CLI options to support migrations in the Prisma adapter: `prototype`, `reset`, `generate`, and `deploy`.

### Patch Changes

- [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9) [#3222](https://github.com/keystonejs/keystone/pull/3222) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for multiple database adapters in a single `Keystone` system. The `adapters` and `defaultAdapter` config options were removed from the `Keystone()` constructor. If you were accessing the adapter object via `keystone.adapters.KnexAdapter` or `keystone.adapters.MongooseAdapter` you should now simply access `keystone.adapter`.

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9)]:
  - @keystonejs/adapter-prisma@3.0.0
  - @keystone-next/types@11.0.2
  - @keystonejs/adapter-knex@13.0.0
  - @keystonejs/adapter-mongoose@11.0.0
  - @keystonejs/keystone@19.0.0

## 9.1.0

### Minor Changes

- [`fe0c228b1`](https://github.com/keystonejs/keystone/commit/fe0c228b12530f6d384fa5eed9d5086768a24782) [#4676](https://github.com/keystonejs/keystone/pull/4676) Thanks [@timleslie](https://github.com/timleslie)! - Prisma artefacts are now generated in the `.keystone/prisma` directory.

### Patch Changes

- [`ac3db9561`](https://github.com/keystonejs/keystone/commit/ac3db95613093de83e2369f624ce9b6c77bb8eda) [#4690](https://github.com/keystonejs/keystone/pull/4690) Thanks [@timleslie](https://github.com/timleslie)! - Factored out `createKeystone` into a separate module.

* [`f162a9d72`](https://github.com/keystonejs/keystone/commit/f162a9d72859ae7f2932bf0859c712861918b9e6) [#4675](https://github.com/keystonejs/keystone/pull/4675) Thanks [@timleslie](https://github.com/timleslie)! - Identified static paths required to locate configuration files.

* Updated dependencies [[`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464), [`a96c24cca`](https://github.com/keystonejs/keystone/commit/a96c24ccab8dadc9e8f0131fe6509abd64a776f5), [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed), [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63)]:
  - @keystonejs/adapter-prisma@2.0.0
  - @keystone-next/types@11.0.1

## 9.0.2

### Patch Changes

- [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e) [#4665](https://github.com/keystonejs/keystone/pull/4665) Thanks [@timleslie](https://github.com/timleslie)! - Added a `projectAdminPath` argument to `buildAdminUI`, `createAdminUIServer`, and `generateAdminUI`, which replaces the hard-coded `.keystone/admin`.

* [`e11b111c7`](https://github.com/keystonejs/keystone/commit/e11b111c7e4a87c7a31108b9f5adbc546caaac35) [#4663](https://github.com/keystonejs/keystone/pull/4663) Thanks [@timleslie](https://github.com/timleslie)! - Cleaned up CLI script code.

- [`283a6694a`](https://github.com/keystonejs/keystone/commit/283a6694ac461d0be980d7796f88efadd4fe108e) [#4656](https://github.com/keystonejs/keystone/pull/4656) Thanks [@timleslie](https://github.com/timleslie)! - Updated calls to `keystone.connect()` with a `{ context }` argument to be used by `config.db.onConnect`.

* [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b) [#4662](https://github.com/keystonejs/keystone/pull/4662) Thanks [@timleslie](https://github.com/timleslie)! - Remove type `KeystoneSystem`.

- [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9) [#4657](https://github.com/keystonejs/keystone/pull/4657) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `system` argument to `createAdminUIServer` with `createContext`.

* [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719) [#4661](https://github.com/keystonejs/keystone/pull/4661) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `system` arg to `generateAdminUI` with `graphQLSchema, keystone`.

* Updated dependencies [[`49eec4dea`](https://github.com/keystonejs/keystone/commit/49eec4dea522c6a043b3eaf93fc8be8256b00aa6), [`3b7a056bb`](https://github.com/keystonejs/keystone/commit/3b7a056bb835482ceb408a70bf97300741552d19), [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e), [`0d9404768`](https://github.com/keystonejs/keystone/commit/0d94047686d1bb1308fd8c47b769c999390d8f6d), [`b81a11c17`](https://github.com/keystonejs/keystone/commit/b81a11c171f3627f6cecb66bd2faeb89a68a009e), [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b), [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9), [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719), [`177cbd530`](https://github.com/keystonejs/keystone/commit/177cbd5303b814d1acaa8ded98e3d114c770bdba), [`74a8528ea`](https://github.com/keystonejs/keystone/commit/74a8528ea0dad739f4f16af32fe4f8926a188b61), [`831db7c2b`](https://github.com/keystonejs/keystone/commit/831db7c2b7a9bced87acf76e3f431ca88a8880b0), [`a36bcf847`](https://github.com/keystonejs/keystone/commit/a36bcf847806ca0739f7b44d49a9bf6ac26a38d4), [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490)]:
  - @keystonejs/adapter-prisma@1.1.2
  - @keystonejs/keystone@18.1.0
  - @keystone-next/types@11.0.0
  - @keystone-next/admin-ui@8.0.0
  - @keystone-next/fields@4.1.0
  - @keystonejs/adapter-knex@12.0.4
  - @keystonejs/adapter-mongoose@10.1.2
  - @keystonejs/app-graphql@6.2.1

## 9.0.1

### Patch Changes

- Updated dependencies [[`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a)]:
  - @keystone-next/admin-ui@7.0.1
  - @keystone-next/fields@4.0.3
  - @keystone-next/types@10.0.0

## 9.0.0

### Major Changes

- [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368) [#4586](https://github.com/keystonejs/keystone/pull/4586) Thanks [@timleslie](https://github.com/timleslie)! - Removed `adminMeta` from `KeystoneSystem`. `getAdminMetaSchema` now takes a `BaseKeystone` argument `keystone` rather than `adminMeta`.

* [`abc5440dc`](https://github.com/keystonejs/keystone/commit/abc5440dc5ee8d8cdd6ddddb32cf21bd2c3fc324) [#4573](https://github.com/keystonejs/keystone/pull/4573) Thanks [@timleslie](https://github.com/timleslie)! - Updated `initConfig` to return a copy of the `config` object, rather than modifying the object.

### Minor Changes

- [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95) [#4588](https://github.com/keystonejs/keystone/pull/4588) Thanks [@timleslie](https://github.com/timleslie)! - Updated graphql server to use the `graphql-upload` package directly to support uploads, rather than the built-in support provided by Apollo Server.

### Patch Changes

- [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5) [#4587](https://github.com/keystonejs/keystone/pull/4587) Thanks [@timleslie](https://github.com/timleslie)! - Use `keystone.getTypeDefs` and `keystone.getResolvers` when creating the graphQL schema.

- Updated dependencies [[`1236f5f40`](https://github.com/keystonejs/keystone/commit/1236f5f4024f1698b5a39343b4e5dbfa42c5fc9c), [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5), [`f559e680b`](https://github.com/keystonejs/keystone/commit/f559e680bad7a7c948a317adfb91a3b024b486c4), [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`cf2819544`](https://github.com/keystonejs/keystone/commit/cf2819544426def260ada5eb18fdc9b8a01e9438), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`17519bf64`](https://github.com/keystonejs/keystone/commit/17519bf64f277ad154fad1b0d5a423048e1336e0)]:
  - @keystone-next/admin-ui@7.0.0
  - @keystone-next/types@9.0.0
  - @keystonejs/keystone@18.0.0
  - @keystonejs/app-graphql@6.2.0
  - @keystonejs/adapter-mongoose@10.1.1
  - @keystone-next/fields@4.0.2
  - @keystonejs/adapter-knex@12.0.3
  - @keystonejs/adapter-prisma@1.1.1

## 8.0.0

### Major Changes

- [`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da) [#4547](https://github.com/keystonejs/keystone/pull/4547) Thanks [@timleslie](https://github.com/timleslie)! - Removed `allViews` from `KeystoneSystem` type. `createAdminMeta` no longer returns `allViews`.

### Patch Changes

- Updated dependencies [[`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da)]:
  - @keystone-next/admin-ui@6.0.0
  - @keystone-next/types@8.0.0
  - @keystone-next/fields@4.0.1

## 7.0.0

### Major Changes

- [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409) [#4533](https://github.com/keystonejs/keystone/pull/4533) Thanks [@timleslie](https://github.com/timleslie)! - Renamed to `SessionImplementation.createContext` to `createSessionContext`.

### Minor Changes

- [`44c78319e`](https://github.com/keystonejs/keystone/commit/44c78319ed8cfb1000eb4b1aca5eb361376584b4) [#4535](https://github.com/keystonejs/keystone/pull/4535) Thanks [@timleslie](https://github.com/timleslie)! - Exported the `initConfig` function.

* [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035) [#4523](https://github.com/keystonejs/keystone/pull/4523) Thanks [@timleslie](https://github.com/timleslie)! - Added support for all database adapter configuration options.

- [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4) [#4548](https://github.com/keystonejs/keystone/pull/4548) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `build` and `start` command

* [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05) [#4527](https://github.com/keystonejs/keystone/pull/4527) Thanks [@timleslie](https://github.com/timleslie)! - Added an optional `req` property to the `KeystoneContext` type.

### Patch Changes

- [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956) [#4495](https://github.com/keystonejs/keystone/pull/4495) Thanks [@timleslie](https://github.com/timleslie)! - Removed `cwd` argument from `generateAdminUI`. Refactored and simplified implementation of `generateAdminUI`.

* [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2) [#4532](https://github.com/keystonejs/keystone/pull/4532) Thanks [@timleslie](https://github.com/timleslie)! - Moved `templates/adminMetaSchemaExtension.ts` to `system/getAdminMetaSchema.ts`.

- [`fd5daefb4`](https://github.com/keystonejs/keystone/commit/fd5daefb4966b10cf8047386d19db14d325ef8c5) [#4530](https://github.com/keystonejs/keystone/pull/4530) Thanks [@timleslie](https://github.com/timleslie)! - Updated `printGeneratedTypes` to accept explicit `keystone` and `graphQLSchema` arguments.

* [`a3908a675`](https://github.com/keystonejs/keystone/commit/a3908a675614fa8690ea641a124cc57c9f963618) [#4524](https://github.com/keystonejs/keystone/pull/4524) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed an issue where invalid items would crash session initialisation

- [`c1e8def9a`](https://github.com/keystonejs/keystone/commit/c1e8def9a4204d685a796e267edc50f6ef2e8c51) [#4531](https://github.com/keystonejs/keystone/pull/4531) Thanks [@timleslie](https://github.com/timleslie)! - Updated `addApolloServer` to accept explicit `createContext` and `graphQLSchema` arguments.

* [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0) [#4545](https://github.com/keystonejs/keystone/pull/4545) Thanks [@timleslie](https://github.com/timleslie)! - Moved `createAdminMeta` into the `@keystone-next/admin-ui` package.

* Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956), [`6912c7b9d`](https://github.com/keystonejs/keystone/commit/6912c7b9dc3d786e61e6f657b0886b258d942c30), [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2), [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79), [`5c75534f6`](https://github.com/keystonejs/keystone/commit/5c75534f6e9e0f10a6556a1f1dc87b5fdd986dd4), [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d), [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da), [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da), [`dab8121a6`](https://github.com/keystonejs/keystone/commit/dab8121a6a8eae4c42a5a9ecbdb72a3e8b1eeda4), [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409), [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0), [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`f2c7675fb`](https://github.com/keystonejs/keystone/commit/f2c7675fb51ed41e6df8248c76b9322d6de5ee0d)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystone-next/fields@4.0.0
  - @keystone-next/admin-ui@5.0.0
  - @keystonejs/adapter-prisma@1.1.0
  - @keystone-next/types@7.0.0

## 6.0.0

### Major Changes

- [`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13) [#4493](https://github.com/keystonejs/keystone/pull/4493) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `SerializedFieldMeta.views` to `SerializedFieldMeta.viewsIndex` to makes it clear that this is the index, not the views object itself.

* [`c89b43d07`](https://github.com/keystonejs/keystone/commit/c89b43d076f157041c154473221785e41589936f) [#4453](https://github.com/keystonejs/keystone/pull/4453) Thanks [@timleslie](https://github.com/timleslie)! - `context.createContext()` now inherits the argument values for `sessionContext` and `skipAccessControl` from `context` as defaults.

  This means, for example, that

  ```js
  context.createContext({ skipAccessControl: true });
  ```

  will create a new context with the same `sessionContext` that the original `context` object had.

- [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9) [#4473](https://github.com/keystonejs/keystone/pull/4473) Thanks [@timleslie](https://github.com/timleslie)! - Added a `resolveFields: false | string` argument to the items API methods.

  This function controls the return type of the methods on the items API.
  If a `string` value is provided, it will be interpreted as a graphQL field specification fragment.
  The method will construct and run a graphQL operation and return the values specified by `resolveFields`.
  The default value for `resolveFields` is `id`.

  For example, to find the title and author name for all posts in our system we would run:

  ```js
  const posts = await context.lists.Post.findMany({ resolveFields: 'id title author { id name }' });
  ```

  If `resolveFields: false` is provided, this indicates to the method that no field-resolving is desired.
  Instead, the method will return the result of the item-level resolver for the corresponding operation.
  These objects are the internal data representation of the items in the system which would normally be passed to the field resolvers.

  This flag is most useful in two specific scenarios. Firstly, if you need to inspect data which isn't generally available as a graphQL field, such as password hash values.

  Secondly, if you are writing a custom mutation which returns a list item type, such as `Post`. For example

  ```js
  export const extendGraphqlSchema = graphQLSchemaExtension({
    typeDefs: `
      type Mutation {
        topPost(userId: ID): Post
      }
    `,
    resolvers: {
      Mutation: {
        topPost: (root, { userId }: { userId: string }, context) => {
          return context.lists.Post.findMany({
            where: { user: { id: userId } },
            first: 1,
            sortBy: ['stars_DESC'],
            resolveFields: false,
          });
        },
      },
    },
  });
  ```

* [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95) [#4501](https://github.com/keystonejs/keystone/pull/4501) Thanks [@timleslie](https://github.com/timleslie)! - Removed `sessionImplementation` from `KeystoneSystem` and instead pass it explicitly where needed.

- [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62) [#4494](https://github.com/keystonejs/keystone/pull/4494) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `KeystoneSystem.views` to `KeystoneSystem.allViews`.

* [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27) [#4477](https://github.com/keystonejs/keystone/pull/4477) Thanks [@timleslie](https://github.com/timleslie)! - Changed the type `SessionContext` to have parameters `startSession` and `endSession` as required. This type also takes a type parameter `T` which corresponds to the data type of the `data` argument to `startSession`.

- [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab) [#4482](https://github.com/keystonejs/keystone/pull/4482) Thanks [@timleslie](https://github.com/timleslie)! - Removed `config` from type `KeystoneSystem`. The config object is now explicitly passed around where needed to make it clear which code is consuming it.
  Type `KeystoneAdminUIConfig.getAdditionalFiles` now takes a `config` parameter.

* [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b) [#4458](https://github.com/keystonejs/keystone/pull/4458) Thanks [@timleslie](https://github.com/timleslie)! - Removed `createContextFromRequest` and `createSessionContext` from `KeystoneSystem` and replaced them with `sessionImplementation`, which provides the same core functionality.

- [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180) [#4492](https://github.com/keystonejs/keystone/pull/4492) Thanks [@timleslie](https://github.com/timleslie)! - Replaced the `system` argument on `SessionStrategy.start`, '.end`, and`.get`with`createContext`.

* [`c9c96cf71`](https://github.com/keystonejs/keystone/commit/c9c96cf718fce657ed15a75ae8e836dcedcf5326) [#4452](https://github.com/keystonejs/keystone/pull/4452) Thanks [@timleslie](https://github.com/timleslie)! - The items API (`context.lists.Post.findOne()`, etc) now use the `context` object they are bound to, rather than creating a new context object with `{ skipAccessControl: true }` when executing the operation.

  If you were relying on this behaviour you should change your code from:

  ```js
  context.lists.Post.findOne(...)
  ```

  to

  ```js
  context.createContext({ skipAccessControl: true }).lists.Post.findOne(...)
  ```

### Minor Changes

- [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b) [#4467](https://github.com/keystonejs/keystone/pull/4467) Thanks [@timleslie](https://github.com/timleslie)! - Added type for `BaseKeystone.createApolloServer()`.

### Patch Changes

- [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d) [#4456](https://github.com/keystonejs/keystone/pull/4456) Thanks [@timleslie](https://github.com/timleslie)! - Refactored code to use the original `config` object, rather than `system.config`.

* [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a) [#4499](https://github.com/keystonejs/keystone/pull/4499) Thanks [@timleslie](https://github.com/timleslie)! - Updated and renamed `adminMetaSchemaExtension` to no longer perform the schema merge operation. It now simply returns `{ typeDefs, resolvers }` and allows the calling function to merge them as required, and is renamed to `getAdminMetaSchema`.

- [`e78d837b1`](https://github.com/keystonejs/keystone/commit/e78d837b18fba820d3e42cb163420426e2cd3c38) [#4460](https://github.com/keystonejs/keystone/pull/4460) Thanks [@timleslie](https://github.com/timleslie)! - Renamed helper function `sessionStrategy` to `asSessionStrategy` to avoid naming clashes.

* [`914beac0e`](https://github.com/keystonejs/keystone/commit/914beac0ed8e702b1dcd606e2f67c940b053310b) [#4471](https://github.com/keystonejs/keystone/pull/4471) Thanks [@timleslie](https://github.com/timleslie)! - Simplified session and system creation code now that `SessionStrategy.end` and `.start` are required fields.

- [`554917760`](https://github.com/keystonejs/keystone/commit/554917760cc76209c034b96452781c61c60d94d0) [#4454](https://github.com/keystonejs/keystone/pull/4454) Thanks [@timleslie](https://github.com/timleslie)! - Decoupled DB connection from Admin UI server setup.

* [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6) [#4475](https://github.com/keystonejs/keystone/pull/4475) Thanks [@timleslie](https://github.com/timleslie)! - Use `SerializedAdminMeta` in `createGraphQLSchema` and `FieldType<...>.getAdminMeta?`.

- [`340253f14`](https://github.com/keystonejs/keystone/commit/340253f14235084265c6a02fe5958e476f8554ef) [#4455](https://github.com/keystonejs/keystone/pull/4455) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `createAdminUIServer` to `createExpressServer` to better capture what this module is doing.

* [`224aeb859`](https://github.com/keystonejs/keystone/commit/224aeb859ef30dbea57587efbc54d03074175fba) [#4451](https://github.com/keystonejs/keystone/pull/4451) Thanks [@timleslie](https://github.com/timleslie)! - Factored out item API argument processing functions.

- [`ebc9ad096`](https://github.com/keystonejs/keystone/commit/ebc9ad0962cb15ac9863268cf857216e51d51b98) [#4500](https://github.com/keystonejs/keystone/pull/4500) Thanks [@timleslie](https://github.com/timleslie)! - Removed dependency on `adminMeta` object for generating schema types.

* [`7f571dc7d`](https://github.com/keystonejs/keystone/commit/7f571dc7d7c481942ee9d390736e4ea2c083c81c) [#4459](https://github.com/keystonejs/keystone/pull/4459) Thanks [@timleslie](https://github.com/timleslie)! - Refactored dev script to apply `applyIdFieldDefaults` before sending `config` object to `createSystem`.

- [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98) [#4498](https://github.com/keystonejs/keystone/pull/4498) Thanks [@timleslie](https://github.com/timleslie)! - Removed usage of `keystone as any`.

* [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c) [#4487](https://github.com/keystonejs/keystone/pull/4487) Thanks [@timleslie](https://github.com/timleslie)! - Remove argument `isAccessAllowed` from `adminMetaSchemaExtension`. This value is now calculated internally.

- [`3a0e59832`](https://github.com/keystonejs/keystone/commit/3a0e59832b8d910b9cd24c62aab36d2dfa600737) [#4461](https://github.com/keystonejs/keystone/pull/4461) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `SessionStrategy<unknown>` with `SessionStrategy<T>` in `implementSession`.

* [`5de960512`](https://github.com/keystonejs/keystone/commit/5de960512241e421f72eca496252a9091b9e50c8) [#4468](https://github.com/keystonejs/keystone/pull/4468) Thanks [@timleslie](https://github.com/timleslie)! - Optimised `createContext` by precomputing arg-parsing functions at system initialisation.

- [`0be537426`](https://github.com/keystonejs/keystone/commit/0be537426bf11b182b1c4387f26357e2ba3e08a5) [#4466](https://github.com/keystonejs/keystone/pull/4466) Thanks [@timleslie](https://github.com/timleslie)! - Added an explicit return type for `statelessSessions`.

* [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77) [#4484](https://github.com/keystonejs/keystone/pull/4484) Thanks [@timleslie](https://github.com/timleslie)! - Moved `generateAdminUI` and `createAdminUIServer` into the `@keystone-next/admin-ui` package.

- [`202767d72`](https://github.com/keystonejs/keystone/commit/202767d721719f1ed4455db5a3b5824e9cd8de70) [#4476](https://github.com/keystonejs/keystone/pull/4476) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `any` with more specific types in internal code.

- Updated dependencies [[`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13), [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9), [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95), [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62), [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d), [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a), [`2338ed731`](https://github.com/keystonejs/keystone/commit/2338ed73185cd3d33c62fac69064c8a4950dc3fd), [`57092b7c1`](https://github.com/keystonejs/keystone/commit/57092b7c13845fffd1f3767bb609d203afbc2776), [`dbfef6256`](https://github.com/keystonejs/keystone/commit/dbfef6256b11d94250885f5f3a11d0ba81ad3b08), [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27), [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab), [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6), [`4b019b8cf`](https://github.com/keystonejs/keystone/commit/4b019b8cfcb7bea6f800609da5d07e8c8abfc80a), [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b), [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b), [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98), [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c), [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180), [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4), [`6a364a664`](https://github.com/keystonejs/keystone/commit/6a364a664ce16f741408111054f0f3437a63a194), [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77)]:
  - @keystone-next/admin-ui@4.0.0
  - @keystone-next/types@6.0.0
  - @keystone-next/fields@3.2.2

## 5.0.0

### Major Changes

- [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a) [#4440](https://github.com/keystonejs/keystone/pull/4440) Thanks [@JedWatson](https://github.com/JedWatson)! - Changed the `config.db.onConnect` argument to accept a `KeystoneContext` instance, created with `{ skipAccessControl: true }`, rather than a `BaseKeystone` instance.

  Added database APIs `{ knex?, mongoose?, prisma? }" to`KeystoneContext`.

### Patch Changes

- [`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd) [#4427](https://github.com/keystonejs/keystone/pull/4427) Thanks [@timleslie](https://github.com/timleslie)! - Added a `BaseKeystone` type to replace usage of `any` in all instances.

* [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5) [#4426](https://github.com/keystonejs/keystone/pull/4426) Thanks [@timleslie](https://github.com/timleslie)! - Used the `KeystoneContext` type rather than `any` where appropriate.

* Updated dependencies [[`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd), [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5), [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a)]:
  - @keystone-next/types@5.0.0
  - @keystone-next/admin-ui@3.1.2
  - @keystone-next/fields@3.2.1

## 4.1.1

### Patch Changes

- [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567) [#4414](https://github.com/keystonejs/keystone/pull/4414) Thanks [@JedWatson](https://github.com/JedWatson)! - Typed keystone context

* [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a) [#4378](https://github.com/keystonejs/keystone/pull/4378) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to consistently use `context` rather than `ctx` for graphQL context variables.

* Updated dependencies [[`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567), [`a3a58bcca`](https://github.com/keystonejs/keystone/commit/a3a58bcca56943f2240104dae3c816188eead6f1), [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4), [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a), [`b8c2c48ec`](https://github.com/keystonejs/keystone/commit/b8c2c48ec3746809894af7347c205f6a95329e8d)]:
  - @keystone-next/fields@3.2.0
  - @keystone-next/admin-ui@3.1.1
  - @keystone-next/types@4.1.1
  - @keystonejs/keystone@17.1.2

## 4.1.0

### Minor Changes

- [`add3f67e3`](https://github.com/keystonejs/keystone/commit/add3f67e379caebbcf0880b4ce82cf6a1e89020b) [#4316](https://github.com/keystonejs/keystone/pull/4316) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.server.cors` option to allow configuration of the cors middleware. Updated the Apollo server middleware to not override cors options.

### Patch Changes

- [`ad10994d2`](https://github.com/keystonejs/keystone/commit/ad10994d271cff6f95e9e412a7e6830742a6d949) [#4317](https://github.com/keystonejs/keystone/pull/4317) Thanks [@timleslie](https://github.com/timleslie)! - Added a function `createGraphQLSchema` to `createSystem` to isolate schema generation code.

* [`d2ebd1c39`](https://github.com/keystonejs/keystone/commit/d2ebd1c3922f1090bcc8e89c9c70ae880f6a24d9) [#4308](https://github.com/keystonejs/keystone/pull/4308) Thanks [@timleslie](https://github.com/timleslie)! - Fixed `itemAPI` `count()` function.

* Updated dependencies [[`add3f67e3`](https://github.com/keystonejs/keystone/commit/add3f67e379caebbcf0880b4ce82cf6a1e89020b), [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213), [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213)]:
  - @keystone-next/types@4.1.0
  - @keystone-next/fields@3.1.0
  - @keystone-next/admin-ui@3.1.0

## 4.0.0

### Major Changes

- [`c60b229ec`](https://github.com/keystonejs/keystone/commit/c60b229ec38b4845ac606ee83b9787a97834baf3) [#4299](https://github.com/keystonejs/keystone/pull/4299) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `createKeystone` to `createSystem` to make it consistent with the type names.

* [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `KeystoneAdminUIConfig.getAdditionalFiles()` and `KeystoneAdminUIConfig.pageMiddleware()` to `system`.
  Renamed `keystone` argument of `SessionStrategy.start`, `SessionStrategy.end` and `SessionStrategy.get` to `system`.

### Minor Changes

- [`c858a05fe`](https://github.com/keystonejs/keystone/commit/c858a05fee6dc3ed3d80db9fdf50944217bee072) [#4246](https://github.com/keystonejs/keystone/pull/4246) Thanks [@timleslie](https://github.com/timleslie)! - Added `executeGraphQL` and `gqlNames` to the `context` object. This provides the compatibility required to use `@keystonejs/server-side-graphql-client` in projects using the new interfaces.

### Patch Changes

- [`96a1d5226`](https://github.com/keystonejs/keystone/commit/96a1d52263db625cd117ab85cb6a4a5c3888fdca) [#4286](https://github.com/keystonejs/keystone/pull/4286) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed behaviour in withItemData when session listKey and itemId aren't valid

* [`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46) [#4263](https://github.com/keystonejs/keystone/pull/4263) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the type `Keystone` to `KeystoneSystem` to avoid confusion with the core `Keystone` class.

- [`5866cb81f`](https://github.com/keystonejs/keystone/commit/5866cb81fd462b86851deb0a88e5034f1934ac84) [#4268](https://github.com/keystonejs/keystone/pull/4268) Thanks [@timleslie](https://github.com/timleslie)! - Refactored `createKeystone` to isolate admin UI related setup.

* [`d1ea5e667`](https://github.com/keystonejs/keystone/commit/d1ea5e66750175e907f41a58c15fce86a4b4ea77) [#4264](https://github.com/keystonejs/keystone/pull/4264) Thanks [@timleslie](https://github.com/timleslie)! - Factored out a `_createKeystone` function to allow for backwards compatibility.

- [`9fddeee41`](https://github.com/keystonejs/keystone/commit/9fddeee41b7e0dbb3854e5ce6abea4cdeeaa81d0) [#4300](https://github.com/keystonejs/keystone/pull/4300) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused `connect()` and `disconnect()` functions from the object returned by `implementSession()`.

* [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `writeAdminFiles()` to `system`.

* Updated dependencies [[`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46), [`cbf11a69b`](https://github.com/keystonejs/keystone/commit/cbf11a69b8f2c428e2c0a08dd568b3bc0e0d80f4), [`81a140ee3`](https://github.com/keystonejs/keystone/commit/81a140ee3badc9c032ab02a233a21d011278e173), [`b2de22941`](https://github.com/keystonejs/keystone/commit/b2de229419cc93b69ee4027c387cab9c8d701488), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882), [`60e061246`](https://github.com/keystonejs/keystone/commit/60e061246bc35b76031f43ff6c07446fe6ad3c6b), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882)]:
  - @keystone-next/admin-ui@3.0.0
  - @keystone-next/types@4.0.0
  - @keystone-next/fields@3.0.1

## 3.0.0

### Major Changes

- [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3) [#4200](https://github.com/keystonejs/keystone/pull/4200) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed CRUD API to Items API and changed property on context from `crud` to `lists`

* [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Uses the new `field.getBackingTypes()` method on core field objects to generate types.

### Minor Changes

- [`d2cfd6106`](https://github.com/keystonejs/keystone/commit/d2cfd6106b44b13254ff1e18601ef943c4211faf) [#4183](https://github.com/keystonejs/keystone/pull/4183) Thanks [@JedWatson](https://github.com/JedWatson)! - Always load the session item in withItemData. The second argument to `withItemData` is now optional.

* [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad) [#4239](https://github.com/keystonejs/keystone/pull/4239) Thanks [@timleslie](https://github.com/timleslie)! - Added support for `config.db.onConnect` in the new APIs. This is passed through as `Keystone{ onConnect }` to the core object.

- [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d) [#4201](https://github.com/keystonejs/keystone/pull/4201) Thanks [@JedWatson](https://github.com/JedWatson)! - New internal graphql api

* [`b89377c9c`](https://github.com/keystonejs/keystone/commit/b89377c9c668c6a4b1be742a177cfb50568d48bf) [#4230](https://github.com/keystonejs/keystone/pull/4230) Thanks [@JedWatson](https://github.com/JedWatson)! - Add Cross-Origin Resource Support to the dev server

### Patch Changes

- [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed) [#4212](https://github.com/keystonejs/keystone/pull/4212) Thanks [@JedWatson](https://github.com/JedWatson)! - Rename KeystoneItemAPI to KeystoneListsAPI

* [`bc198775e`](https://github.com/keystonejs/keystone/commit/bc198775ed27d356017b4a0c6aadeba47e37ce2e) [#4241](https://github.com/keystonejs/keystone/pull/4241) Thanks [@JedWatson](https://github.com/JedWatson)! - Expanded the defaults for labelField to include "label" and "title"

- [`b9e93cb66`](https://github.com/keystonejs/keystone/commit/b9e93cb66e8559858ecfbfee3244a761f821b9ec) [#4236](https://github.com/keystonejs/keystone/pull/4236) Thanks [@timleslie](https://github.com/timleslie)! - Removed unnecessary intermediate functions from initialisation step.

* [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b) [#4242](https://github.com/keystonejs/keystone/pull/4242) Thanks [@timleslie](https://github.com/timleslie)! - Removed `name` field from `KeystoneConfig` type, as it doesn't actually do anything.

- [`dce39ca1b`](https://github.com/keystonejs/keystone/commit/dce39ca1be682647b05a2b59710f05e421b140a1) [#4235](https://github.com/keystonejs/keystone/pull/4235) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused utils code and applied internal cosmetic changes.

- Updated dependencies [[`fd4b0d04c`](https://github.com/keystonejs/keystone/commit/fd4b0d04cd9ab8ba12653f1e64fdf08d8cb0c4db), [`c103cde7d`](https://github.com/keystonejs/keystone/commit/c103cde7da198cd7e9adefa763c51e433680e800), [`84e651c3f`](https://github.com/keystonejs/keystone/commit/84e651c3f08fdfc11628490c9d55229dc360f52a), [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed), [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad), [`549a9a06d`](https://github.com/keystonejs/keystone/commit/549a9a06d9dbeb514aad724ece603a3fa7fc8cb6), [`400a6e50c`](https://github.com/keystonejs/keystone/commit/400a6e50cba643f4b142858bb1cac83a50ab020d), [`302afe226`](https://github.com/keystonejs/keystone/commit/302afe226162452c91d9e2f11f5c29552df70c6a), [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3), [`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400), [`8291187de`](https://github.com/keystonejs/keystone/commit/8291187de347784f21e4d856ed1eefbc5b8a103b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`36cf9b0a9`](https://github.com/keystonejs/keystone/commit/36cf9b0a9f6c9c2cd3c823146135f86d4152718b), [`6eb4def9a`](https://github.com/keystonejs/keystone/commit/6eb4def9a1be293872e59bcf6472866c0981b45f), [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d), [`2a2a7c00b`](https://github.com/keystonejs/keystone/commit/2a2a7c00b74028b758006219781cbbd22909be85), [`8e77254a2`](https://github.com/keystonejs/keystone/commit/8e77254a262a4c892263e30044803b463750c3e9), [`28e2b43d4`](https://github.com/keystonejs/keystone/commit/28e2b43d4a5a4624b3ad6683e5f4f0116a5971f4), [`b9e643dc6`](https://github.com/keystonejs/keystone/commit/b9e643dc6c66f75bc6d5b6ced74d91ba3ee7533d), [`cfa0d8275`](https://github.com/keystonejs/keystone/commit/cfa0d8275c89f09b89643c801b208161348b4f65), [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b), [`0e65409c7`](https://github.com/keystonejs/keystone/commit/0e65409c7416d285fdc4f9da4a7dfb0f652c6cb2)]:
  - @keystone-next/fields@3.0.0
  - @keystone-next/admin-ui@2.0.2
  - @keystone-next/types@3.0.0

## 2.0.0

### Major Changes

- [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797) [#4132](https://github.com/keystonejs/keystone/pull/4132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add CardValue export from field views

### Patch Changes

- [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec) [#4138](https://github.com/keystonejs/keystone/pull/4138) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Handle non-builtin GraphQL scalar types when generating types

- Updated dependencies [[`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`71b74161d`](https://github.com/keystonejs/keystone/commit/71b74161dfc9d7f0b918a3451cf545935afce94d), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`f3c0f79e3`](https://github.com/keystonejs/keystone/commit/f3c0f79e3005aa6a8e867efef4431b83bbdf9898), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797)]:
  - @keystone-next/types@2.0.0
  - @keystone-next/fields@2.0.0
  - @keystone-next/admin-ui@2.0.0

## 1.0.0

### Major Changes

- [`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c) [#4106](https://github.com/keystonejs/keystone/pull/4106) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`3dd5c570a`](https://github.com/keystonejs/keystone/commit/3dd5c570a27d0795a689407d96fc9623c90a66df)]:
  - @keystone-next/admin-ui@1.0.0
  - @keystone-next/fields@1.0.0
  - @keystone-next/types@1.0.0
  - @keystonejs/adapter-mongoose@10.0.1
  - @keystonejs/keystone@17.1.1
