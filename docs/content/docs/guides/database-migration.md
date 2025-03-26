---
title: "Database Migration"
description: "How to manage and apply database migrations in Keystone."
---

If you are working on a local project, you can use `keystone dev` for rapid development and prototyping, automatically applying database schema changes as you go.
However, when moving to production or collaborating with a team, you typically want to use database migrations to manage schema changes reliably, and keep your database rebased on top of your team's work.

## Overview
Keystone provides tooling to help manage data migrations in your project.
This tooling supports you in tracking and applying schema changes safely in development and production environments without needing to understand the intrinsics of how `Prisma` and `Keystone` interact.

If you don't need to manage migrations, you can continue using `keystone dev` which uses [`db push`](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push) to apply changes automatically as you make them.
However, **be aware that `db push` modifies the connected database's schema immediately and may lead to frequent data loss and or database resets.**

## Creating and Applying migrations in development
Before running `keystone start` with a production database, your database schema should be up to date with your Keystone schema.
Keystone can help you manage this process by generating migration files, which can then be committed with your code and used in a production environment.

### Pre-requisites
If you haven't configured a shadow database, `keystone migrate` will attempt to use a derivative of your `db.url` to make a random temporary database.
Alternatively, you can add a `shadowDatabaseUrl` in your Keystone configuration.

If you don't know what a shadow database is, please see the [Prisma documentation](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database).

{% hint kind="warn" %}
The current state of your database schema is **NOT** taken into account by `keystone migrate create`, only the current state of your Keystone schema and database migration history.
This is an intentional feature to help the process stay deterministic when there are changes that may have been pushed to your local development database using `db push`.
{% /hint %}

Please ensure the state of your Keystone schema (`.schema` in `keystone.ts`) is up to date with the changes you want to generate a migration for.

### Creating a migration in development

Follow the following steps to create a migration in your local development environment:

1. Run the following command to create a migration file:

   ```sh
   keystone migrate create
   ```

1. You should be shown any changes that part of your migration, and additionally asked to name the migration, for example

   ``` sh
   [+] Added tables
     - Example
   
   [*] Changed the `Example` table
     [+] Added unique index on columns (name)
   
   ✔ Name of migration … test
   ✨ Generated SQL migration at migrations/20250306120000_test/migration.sql
    ```

1. As needed, open the generated files in `migrations/*` to review and modify them to your needs

You are now ready to apply your migration in development for testing, and when satisfied with the result, apply the migration in production using `--with-migrations`.

### Testing your migration in development
{% hint kind="warn" %}
`keystone migrate apply` is an interactive process, and is *not* intended for unattended migrations.
If you want to migrate a database in production please read [Applying migrations in production](#applying_migrations_in_production).
{% /hint %}

{% hint kind="warn" %}
If your database has had changes using `keystone dev`, you may be asked to delete data
{% /hint %}

Follow the following steps to apply any pending migrations in your local development environment:

   ```sh
   keystone migrate apply
   ```

You can now continue development using Keystone.

### Applying other migrations in development
If you need to rebase your work and apply pending migrations, always run `keystone migrate apply` _before_ using `keystone dev`.
If you run `keystone dev` first, keystone will `db push`, which can result in unnecessary schema updates and may be asked to delete data.

Your workflow should be:
```sh
keystone migrate apply
keystone dev
# ...
```

If you do not want `keystone dev` to update your database schema during development, you can opt out of `db push` behaviour by using the flag `--no-db-push`:

```sh
keystone dev --no-db-push
```

This prevents automatic schema updates, leaving you responsible for applying migrations before testing changes.
If the database schema is outdated agaist your Keystone schema, GraphQL and Prisma runtime errors may occur as result of missing columns or tables.

### Applying migrations in production
Unlike development, how exactly you apply migrations to your production environment will vary depending on your infrastructure.
The process is non-interactive by nature.

To apply migrations as part of the startup of your Keystone server, you can use the `--with-migrations` flag on your `keystone start`:

```sh
keystone start --with-migrations
```

If you want to run your migrations without starting a server, you can use the `--no-server` flag.

```sh
keystone start --with-migrations --no-server
```

## Troubleshooting Common Problems

### "I ran `keystone dev` before applying migrations. What should I do?"
Prisma will likely suggest resetting your database before applying migrations.
In most cases, resetting is the best option and is recommended.

If you want to avoid losing your local development database, follow these steps:

1. Try rolling back your local branch to match the expected state of the migration.
2. Use `keystone dev` to bring your database closer to the expected schema.

You may still be prompted to delete data, and avoiding this completely can be difficult depending on what has changed.

### "How do I roll back a migration?"
Prisma provides tools for rolling back migrations. To revert a migration, use:

```sh
prisma migrate resolve --rolled-back "<migration_name>"
```

For more details, see [Prisma's documentation](https://www.prisma.io/docs/orm/prisma-migrate/workflows/generating-down-migrations).

### "I'm getting a shadow database error in CI."
Ensure that the `shadowDatabaseUrl` is correctly set in your Keystone configuration.

## Using Prisma Migrate for Advanced Workflows
For more complex migration workflows, refer to the official [Prisma Migrate documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate).
Prisma provides additional commands for resolving conflicts, checking migration history, and handling manual migration steps.

## Related Resources
{% related-content %}
{% well
heading="Getting Started with Keystone"
href="/docs/getting-started" %}
Learn how to create a new Keystone project with an Admin UI and GraphQL Playground.
{% /well %}
{% well
heading="How Keystone Uses Prisma"
href="/docs/guides/prisma-integration" %}
Understand Keystone’s integration with Prisma and how migrations work.
{% /well %}
{% well
heading="Deploying Keystone with a Database"
href="/docs/guides/deploying-keystone" %}
Learn best practices for handling Keystone migrations in production.
{% /well %}
{% /related-content %}
