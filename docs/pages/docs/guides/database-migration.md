---
title: "Database Migration"
description: "Learn how to get your production database ready using Keystone's migration"
---

Before running `keystone start` with a production database, you will first need to ensure the database has all the tables and fields that keystone requires. To make this easier keystone can generate the required migration files to store alongside your code, and then run these migrations against your production database.

## Prisma Migrate

Keystone uses Prisma's built-in migration feature, this works by generating `.sql` files into a `./migrations` at the root of your project (ie beside your `keystone.ts` file) and then running those migration files against your production database. For detailed information on how Prisma Migrate works see the [Prisma Migrate docs](https://www.prisma.io/docs/concepts/components/prisma-migrate). 

## Running `keystone dev`

By default running `keystone dev` will force push your schema to the database set using `db.url` in your `keystone.ts` file. You can change the behaviour of `keystone dev` by setting `db.useMigrations` to `true`, this will automatically generate your migrations if your schema has changed each time you run `keystone dev`.

{% if $nextRelease %}
## Skipping dev DB push

If you want to look after all migrations, including in dev, yourself you can run `keystone dev --skip-db-push` this will not perform the default force push in dev leaving you to perform migrations as you like. This flag has no effect if `db.useMigrations` is set to `true`.

{% hint kind="tip" %}
Running `keystone dev --skip-db-push` will return GraphQL runtime errors if tables and/or columns that Keystone requires are not present in the database.  
{% /hint %}

## Keystone Migrate CLI

Keystone offers the following three commonly used commands to help manage your migrations.
- `keystone migrate generate` - Generates the migration files to run to set up your production database - these files should be committed to source control and accessible by the `deploy` step. This command is helpful if you want to either leave `keystone dev` as the default behaviour for rapid schema iteration and generate the migrations once you are ready to submit a PR.
- `keystone migrate deploy` - Runs the generated migrations - this command can only be run after a `build` step, and is generally run in the deploy step of your app or before running `keystone start`.
- `keystone migrate check` - Runs a check between the generated migrations and your schema, command will return an Error Code 1 if your migrations are not up to date - this needs to be run after a build step, and requires access to a non-production database.
{% /if %}
## Prisma CLI

The primary reason you'll need to use the Prisma CLI in your Keystone project is to work with Prisma Migrate.

As you start working with more sophisticated migration scenarios, you'll probably also need to use the [`migrate resolve`](https://www.prisma.io/docs/reference/api-reference/command-reference/#migrate-resolve) and [`migrate status`](https://www.prisma.io/docs/reference/api-reference/command-reference/#migrate-status) commands.

While Keystone abstracts much of the Prisma workflow for you, we strongly recommend you familiarise yourself with the Prisma Migrate CLI commands when you are managing your application in production.


{% related-content %}
{% well
heading="Getting Started with create-keystone-app"
href="/docs/getting-started" %}
How to use Keystone's CLI app to standup a new local project with an Admin UI & the GraphQL Playground.
{% /well %}
{% well
heading="Command Line Guide"
href="/docs/guides/cli" %}
Learn how to use Keystone's command line interface (CLI) to develop, build, and deploy your Keystone projects.
{% /well %}
{% /related-content %}