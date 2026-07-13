---
title: 'Database Migration'
description: 'How to manage and apply database migrations in Keystone.'
---

For rapid local development, `keystone dev` uses Prisma [`db push`](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema) to make the connected database match Keystone's generated Prisma schema.

For production and collaborative development, manage migration files by using the Prisma CLI directly. Keystone does not create migrations, apply migrations, or deploy migrations during startup.

## Prerequisites

Configure the datasource and migrations directory in the `prisma.config.ts`:

```ts
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'schema.prisma',
  migrations: { path: 'migrations' },
  datasource: { url: process.env.DATABASE_URL },
})
```

Keystone creates this file when it doesn't exist, but doesn't update or read an existing file. Keystone uses it's own `config.db.prismaSchemaPath` to define where the Prisma schema is written.

When your provider requires a shadow database, configure it according to the [Prisma shadow database documentation](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database).

## Creating migrations in development

First build the current Keystone schema, then ask Prisma to create and apply a development migration:

```sh
keystone build --no-ui
prisma migrate dev --name add-example
```

Prisma compares the generated schema, migration history, and development database. Review the generated `migrations/<timestamp>_add-example/migration.sql` and commit the migration directory with your schema changes.

To create a migration without applying it immediately, use Prisma's `--create-only` option:

```sh
prisma migrate dev --name add-example --create-only
```

Because `keystone dev` runs `db push`, it can make the development database drift from migration history. When actively developing migrations, either apply pending migrations before starting Keystone or disable automatic schema push:

```sh
prisma migrate dev
keystone dev --no-db-push
```

If the database does not match the generated schema, Prisma Client and GraphQL operations may fail because expected tables or columns are missing.

## Applying migrations in production

Apply committed migrations with Prisma's non-interactive deployment command:

```sh
prisma migrate deploy
keystone start
```

Run `migrate deploy` as a distinct release or deployment step before starting new application instances. Do not run production migrations from preview or staging builds that point at a production database.

For example:

```json
{
  "scripts": {
    "migrate": "prisma migrate deploy",
    "start": "keystone start"
  }
}
```

## Inspecting and resolving migration state

Use Prisma's other migration commands directly:

```sh
prisma migrate status
prisma migrate resolve --rolled-back "<migration_name>"
```

See the [Prisma Migrate documentation](https://www.prisma.io/docs/orm/prisma-migrate) for baselining existing databases, resolving failed migrations, generating down migrations, and handling migration conflicts.

## Resetting a development database

Prisma can reset a development database and reapply its migration history:

```sh
prisma migrate reset
```

For schema prototyping without migration files, you can instead force `db push` to recreate the database:

```sh
prisma db push --force-reset
```

{% hint kind="error" %}
Both reset workflows destroy data. Never run them against a production database.
{% /hint %}

## Related Resources

{% related-content %}
{% well
heading="Database Configuration"
href="/docs/config/config#db" %}
Configure Keystone's database provider and Prisma driver adapter.
{% /well %}
{% well
heading="Keystone CLI"
href="/docs/guides/cli#using-the-prisma-cli" %}
Learn how Keystone's CLI fits alongside the Prisma CLI.
{% /well %}
{% /related-content %}
