---
title: 'Migrate to @keystone-6/core@8.0.0'
description: 'Upgrade an existing Keystone project to @keystone-6/core@8.0.0'
---

`@keystone-6/core@8.0.0` and the related package versions introduce breaking changes across Keystone's configuration, Prisma, access control, auth and Admin UI. This guide explains how those changes affect
an existing project and how to update.

You can use this guide to upgrade from `@keystone-6/core@6` or
`@keystone-6/core@7` because the breaking changes in `@keystone-6/core@7` were limited to
upgrading to `next@15` and `react@19`.

## Update packages

### Runtime requirements

Make sure you are using Node.js 20.19 or newer.

### Keystone packages

```bash
pnpm add @keystone-6/core@^8
# only upgrade the packages that you are using
pnpm add @keystone-6/auth@^10
pnpm add @keystone-6/fields-document@^11
pnpm add @keystone-6/cloudinary@^10
pnpm add @keystone-6/document-renderer@^2
```

### Required framework peers

`@keystone-6/core@8.0.0` requires projects to declare `next`, `react` and `react-dom` as
dependencies directly:

```sh
pnpm add next@^16 react@^19 react-dom@^19
```

### Dependencies used directly by your project

Several dependencies used internally by `@keystone-6/core@8.0.0` have also moved to new
major or minimum versions. Only update these packages when you already declare them in your `package.json`.

- `graphql@^16.14.2`
- `express@^5`
- `@apollo/client@^4`
- `@apollo/server@^5`
- `@graphql-ts/schema@^1`
- `@graphql-ts/extend@^2`

### Prisma 7

Install both Prisma packages:

```sh
pnpm add @prisma/client@^7.9
pnpm add --save-dev prisma@^7.9
```

Then install the adapter/driver pair for each database provider the project
builds or tests against:

| Provider   | Install                                                             |
| ---------- | ------------------------------------------------------------------- |
| SQLite     | `pnpm add @prisma/adapter-better-sqlite3@^7.9 better-sqlite3@^12.6` |
| PostgreSQL | `pnpm add @prisma/adapter-pg@^7.9 pg@^8.16`                         |
| MySQL      | `pnpm add @prisma/adapter-mariadb@^7.9 mariadb@^3.4`                |

### Custom Admin UI dependencies

Projects with custom Admin UI code must replace `@keystone-ui/*` with `@keystar/ui`.

```bash
pnpm add @keystar/ui@0.9.1
```

If you recieve a peer dependency warning, you should use the newer version

### Storage implementation dependencies

Keystone no longer supplies named local or S3 storage strategies. If your existing
configuration has a top-level `storage` property or an image/file field, install the libraries needed to implement that strategy in application
code.

For example, an S3 implementation can use:

```sh
pnpm add @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
```

A local filesystem implementation can use Node's built-in `node:fs` APIs and needs no
storage package.

## Breaking changes

### Configure `prisma@7`

#### Add the runtime adapter

Replace Keystone's removed runtime connection options:

```ts
// before
db: {
  provider: 'postgresql',
  url: process.env.DATABASE_URL!,
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  enableLogging: true,
}
```

with the adapter for the configured provider:

```ts
import { PrismaPg } from '@prisma/adapter-pg'

db: {
  provider: 'postgresql',
  prismaClientOptions: () => ({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    log: ['query'],
  }),
}
```

SQLite:

```ts
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

db: {
  provider: 'sqlite',
  prismaClientOptions: () => ({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
  }),
}
```

MySQL:

```ts
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

db: {
  provider: 'mysql',
  prismaClientOptions: () => ({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
  }),
}
```

#### Add Prisma CLI configuration

Create or update `prisma.config.ts`:

```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'schema.prisma',
  migrations: { path: 'migrations' },
  datasource: {
    url: env('DATABASE_URL'),
    // only necessary if you want to use a specific shadow database
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
```

The runtime adapter and `prisma.config.ts` are separate:

- Keystone uses `db.prismaClientOptions()`.
- The `prisma` CLI uses `prisma.config.ts`.

#### Update the generated client path

Keystone now generates Prisma Client into `generated/prisma` by default:

```ts
// before
import { PrismaClient } from '@prisma/client'

// after
import { PrismaClient } from './generated/prisma/client'
```

The default generated Keystone types path has also changed to `generated/keystone/types`:

```ts
// before
import type { Lists } from '.keystone/types'

// after
import type { Lists } from './generated/keystone/types'
```

Update `.gitignore` to ignore the generated directory.

#### Replace removed commands

Update scripts:

| Before                             | After                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `keystone prisma <args>`           | `prisma <args>`                                                        |
| `keystone migrate ...`             | an explicit Prisma migration command                                   |
| `keystone start --with-migrations` | a separate `prisma migrate deploy` release step, then `keystone start` |

Remove `keystone postinstall --fix`, the `--fix` flag no longer exists.

### Update Keystone configuration

#### Move field labels and descriptions

- `field.label` becomes `field.ui.label`
- `list.description` and `list.ui.description` are removed
- a description intended for the GraphQL type becomes `list.graphql.description`

#### Move default field modes

Move list and field-group defaults:

```ts
// before
ui: {
  itemView: { defaultFieldMode: 'read' },
}

// after
fieldDefaults: {
  ui: {
    itemView: { fieldMode: 'read' },
  },
}
```

Apply the same change for `createView` and `itemView`.

#### Flatten `getAdditionalFiles`

Replace an array of functions/nested arrays with one function that returns a flat array:

```ts
// before
ui: {
  getAdditionalFiles: [filesFromA, filesFromB],
}

// after
ui: {
  getAdditionalFiles: async () => [
    ...(await filesFromA()),
    ...(await filesFromB()),
  ],
}
```

#### Handle count-mode relationships and nullable items

For every relationship using `ui.displayMode: 'count'`, set:

```ts
ui: {
  displayMode: 'count',
  itemView: { fieldMode: 'read' },
}
```

A dynamic mode may return only `'read'` or `'hidden'`.

Custom field-view functions must also handle a nullable `item` argument in create or
missing-item states.

#### Move storage strategies onto fields

If the old Keystone configuration has top-level named storage:

```ts
export default config({
  storage: {
    uploads: {
      kind: 's3',
      type: 'file',
      // provider options
    },
  },
  // ...
})

attachment: file({ storage: 'uploads' })
```

remove the top-level `storage` property and give each `file()` or `image()` field a
strategy object:

```ts
attachment: file({
  storage: {
    async put(key, stream, meta, context) {
      // Upload the stream with the provider SDK.
    },
    async delete(key, context) {
      // Delete the object with the provider SDK.
    },
    url(key, context) {
      // Return a public or signed URL.
    },
  },
})
```

The new `StorageStrategy` consists directly of `put`, `delete` and `url`. It does not
accept the old `kind`, `type`, bucket or local path configuration. Reuse a shared
strategy object when several fields intentionally have identical behaviour.

See the [local](https://github.com/keystonejs/keystone/tree/main/examples/assets-local) and [s3](https://github.com/keystonejs/keystone/tree/main/examples/assets-s3) examples for more details on how you could implement this.

### Update hooks and password fields

#### Replace deprecated hooks

Replace `validateInput` and `validateDelete` with operation-specific `validate` hooks:

```ts
hooks: {
  validate: {
    create: createOrUpdateValidation,
    update: createOrUpdateValidation,
    delete: deleteValidation,
  },
}
```

#### Replace password options with a KDF

Replace `bcrypt` and `workFactor`:

```ts
import bcryptjs from 'bcryptjs'

password({
  kdf: {
    hash: secret => bcryptjs.hash(secret, 12),
    compare: (secret, hash) => bcryptjs.compare(secret, hash),
  },
})
```

If neither old option was set, omit `kdf`; Keystone defaults to bcrypt with work factor 10. Existing bcrypt hashes remain compatible with that default.

The default bcrypt KDF now rejects inputs longer than 72 UTF-8 bytes where previously they were silently truncated by bcrypt.

### Update access control

#### Field `access.read` now applies to filtering and ordering

In `@keystone-6/core@8.0.0`, a single field `access.read` function applies to item reads,
filtering and ordering. Previously, field read access did not affect filtering or
ordering, which were controlled separately by `isFilterable` and `isOrderable`.

In most projects, the new behavior is the better default: if someone cannot read a
field, they usually should not be able to infer information about it by filtering or
ordering. When that matches what you want, keep the read function as is:

```ts
access: {
  read: canReadItem,
},
```

| Old value        | New `access`                                       | New `graphql.omit`                     |
| ---------------- | -------------------------------------------------- | -------------------------------------- |
| absent or `true` | `allowAll`                                         | not omitted                            |
| `false`          | `denyAll`                                          | `graphql.omit.read.filter/order: true` |
| function         | the same function under `access.read.filter/order` | not omitted                            |

For example, this preserves an explicit filtering rule and removes ordering from the
GraphQL schema:

```ts
// before
text({
  access: { read: canReadItem },
  isFilterable: canFilter,
  isOrderable: false,
})

// after
text({
  access: {
    read: {
      item: canReadItem,
      filter: canFilter,
      order: denyAll,
    },
  },
  graphql: {
    omit: {
      read: {
        item: false,
        filter: false,
        order: true,
      },
    },
  },
})
```

#### Translate list defaults

Move `defaultIsFilterable` and `defaultIsOrderable` into `fieldDefaults.access.read` and
`fieldDefaults.graphql.omit.read` using the same mapping.

#### Review `sudo` and internal scope

`context.sudo()` bypasses access control and `graphql.omit`.
`context.internal()` bypasses `graphql.omit` but retains access control.

The `context.sudo().graphql.schema` shape now retains access-control instrumentation.
Code that inspected a schema extension changes from:

```ts
schema.extensions.sudo
```

to:

```ts
schema.extensions.scope === 'internal'
```

### Update auth configuration

#### Remove unsupported auth options

`@keystone-6/auth` removes:

- `magicAuthLink`;
- `passwordResetLink`;
- `initFirstItem`;
- the `/init` Admin UI page; and
- the generated `createInitial*` mutation.

See the [magic link example](https://github.com/keystonejs/keystone/tree/main/examples/auth-magic-link) for how you could implement magic link & password reset flows in your own project.

#### Initial-user creation

`db.onConnect` can seed development data to replace `initFirstItem`:

```ts
db: {
  async onConnect(context) {
    const sudo = context.sudo()
    if (await sudo.db.User.count()) return
    // Create a development-only account with a random password
  },
}
```

This pattern is only suitable for development seeding.

#### Review `endSession`

`@keystone-6/core` no longer adds `endSession` when `context.session.end` exists.
`@keystone-6/auth` adds it when required. If you're not using `@keystone-6/auth` and want to keep the `endSession` operation, add a schema extension for it.

### Update GraphQL and generated metadata

#### Replace `graphql` with a context-bound `g`

The `graphql` export from `@keystone-6/core` has been renamed to `g`. The old name is
still exported as a deprecated alias, but new and migrated code should use
`gWithContext` so resolvers receive the project's generated context type:

```ts
import { gWithContext } from '@keystone-6/core'
import type { Context } from './generated/keystone/types'

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>
```

Rename runtime calls such as `graphql.object`, `graphql.field` and `graphql.arg` to
`g.object`, `g.field` and `g.arg`.

The type-level migration is not a direct namespace rename. Types such as
`graphql.ObjectType<Source>` are replaced by the `g<T>` inference helper applied
to the corresponding builder:

```ts
// before
type Result = graphql.ObjectType<Source>

// after
type Result = g<typeof g.object<Source>>
```

Use the same pattern for other functions where the old code referred to a type
through the `graphql` namespace. See [graphql-ts.com](https://graphql-ts.com) for more details on this API.

#### Preserve or accept list names

Computed GraphQL plurals now preserve original casing. A new `list.graphql.singular`
option can set singular output and operation names.

After generating `schema.graphql`, compare it with the pre-upgrade version. For each
changed public name either:

- set `list.graphql.singular` or `list.graphql.plural` to preserve an existing API when
  preserving it is an explicit project rule; or
- keep the new name and update usages to use the new name.

#### Update enum names

`select({ type: 'enum' })` and `multiselect({ type: 'enum' })` no longer singularise
derived enum names. This affects fields with plural keys. For example:

```ts
User: list({
  fields: {
    roles: select({
      type: 'enum',
      options: ['admin', 'editor'],
    }),
  },
})
```

Previously, Keystone singularised the `roles` field key when generating its enum name:

```graphql
enum UserRoleType {
  admin
  editor
}
```

It now preserves the plural field key:

```graphql
enum UserRolesType {
  admin
  editor
}
```

The field key, column name and enum values are unchanged. Only the generated enum type
identifier changes from `UserRoleType` to `UserRolesType`.

Both field types use the new name in the GraphQL schema. Update checked-in GraphQL
operations and generated types to the new name, or report the API decision.

For `select({ type: 'enum' })`, the same name is used for the generated Prisma enum on
PostgreSQL and MySQL:

```prisma
// before
enum UserRoleType {
  admin
  editor
}

// after
enum UserRolesType {
  admin
  editor
}
```

On PostgreSQL this also changes the name of a database enum type and requires a migration.
MySQL uses the Prisma enum name when generating the client, but stores the
enum values directly in the column definition without a named database type, so this
change produces no database migration. SQLite continues to store an enum select in a
string column.

`multiselect({ type: 'enum' })` continues to use Prisma `Json` storage on every provider,
so its enum-name change affects GraphQL only.

#### Update Prisma error handling

Direct `context.prisma` operations now throw Prisma errors instead of Keystone-wrapped
`GraphQLError` values.

Uncaught Prisma errors returned through GraphQL are masked with
`code: 'KS_PRISMA_ERROR'` and `message: 'Prisma error'`. A custom formatter belongs
under `graphql.apolloConfig.formatError`:

```ts
graphql: {
  apolloConfig: {
    formatError(formattedError, error) {
      // Report the original error only to a trusted server-side service.
      return formattedError
    },
  },
}
```

### Update custom Admin UI code

#### Replace `@keystone-ui/*` with `@keystar/ui`

All usages of `@keystone-ui/*` should be replaced with `@keystar/ui`. The new package exports are not directly equivalent with the old one, so you will need to update imports and usage accordingly. See [keystar.design](https://keystar.design) for information on the new package and its usage. Note if you have a large amount of custom Admin UI code, this will likely be the most time-consuming part of the upgrade.

Remove imports from `@keystone-6/fields-document/primitives`, those internals are no
longer exported.

### Update test utilities

Replace the generic import with the provider-specific helper:

```ts
import { resetDatabase } from '@keystone-6/core/testing/sqlite'

await resetDatabase({ filename: databasePath }, migrationsDirectory)
```

PostgreSQL uses `@keystone-6/core/testing/postgresql`; MySQL uses
`@keystone-6/core/testing/mysql`.

The new helpers destroy the target test database and apply `migration.sql`
files.

## Database updates

### Review upstream `prisma@7` changes

Compare direct Prisma usage with the
[official `prisma@7` upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

### Migrations

No database change is expected for most Keystone configuration migrations but you should review these
specific cases:

#### SQLite

##### JSON fields

SQLite projects using `json`, `multiselect`, document, cloudinary or a custom
`jsonFieldTypePolyfilledForSQLite` field change from Prisma `String` storage to Prisma
`Json`.

##### Existing SQLite timestamps

An existing SQLite database created through Prisma's former native driver may need:

```ts
adapter: new PrismaBetterSqlite3(
  { url: process.env.DATABASE_URL! },
  { timestampFormat: 'unixepoch-ms' }
)
```

#### PostgreSQL

##### Enum select names

For a plural `select({ type: 'enum' })` field, Prisma may interpret the changed generated
enum identifier as replacing both the enum and its column. For example, changing
`UserRoleType` to `UserRolesType` can generate SQL equivalent to:

```sql
CREATE TYPE "UserRolesType" AS ENUM ('admin', 'editor');
ALTER TABLE "User" DROP COLUMN "roles";
ALTER TABLE "User" ADD COLUMN "roles" "UserRolesType" NOT NULL;
DROP TYPE "UserRoleType";
```

When only the generated enum type name changed, replace the generated operations
with a PostgreSQL enum rename:

```sql
ALTER TYPE "UserRoleType" RENAME TO "UserRolesType";
```

Adjust the identifiers to match the generated Prisma schema and verify that the enum
values and column definition are otherwise unchanged. MySQL requires no database
migration for this since MySQL does not use named enum types.

{% related-content %}
{% well
heading="Database Migration"
href="/docs/guides/database-migration" %}
Create, review and deploy Prisma migration files after completing the source upgrade.
{% /well %}
{% well
heading="System Configuration"
href="/docs/config/config" %}
Review the current Keystone configuration API.
{% /well %}
{% well
heading="Auth and Access Control"
href="/docs/guides/auth-and-access-control" %}
Verify migrated access-control policy with a database.
{% /well %}
{% /related-content %}
