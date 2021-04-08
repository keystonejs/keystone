# @keystone-next/keystone

Part of Keystone's [new interfaces project](https://www.keystonejs.com/blog/roadmap-update). This is a preview release, and not yet documented.

You can find example projects and usage [on GitHub](https://github.com/keystonejs/keystone/tree/master/examples-next)

For updates, [follow @keystonejs on Twitter](https://twitter.com/keystonejs) and check out [our Blog](https://www.keystonejs.com/blog)

## CLI

The `@keystone-next/keystone` package provides a CLI command `keystone-next` which is used to run and manage your Keystone project.

The CLI supports commands in three categories, `Run`, `Build` and `Migrate`.

### Run

**Note**: The `prototype` CLI option is still under development and should be considered as a preview feature.

The **run** commands are used to prepare and then start your Keystone server.
Keystone can be run in three different modes, _prototyping_, _dev_ and _production_. These different modes support different phases of your project life-cycle. The different modes differ in how they interact with your database and with your Admin UI application.

`keystone-next prototype` (_prototyping_): In prototyping mode, Keystone will try its hardest to put your database into a state which is consistent with your schema.
This might require Keystone to delete data in your database.
This mode of operation should only be used when you are first getting started with Keystone and are not yet working with real data.
In prototyping mode you can quickly change your schema and immediately see the changes reflected in your database and Admin UI when you restart.

Artefacts:

- `.keystone/schema.graphql` (commit me)

- `.keystone/schema-types.ts` (commit me)

- `.keystone/admin/` (.gitignore)

- `.keystone/prisma/schema.prisma` (commit me)

- `.keystone/prisma/generated-client/` (.gitignore)

  Database changes:

- Database force synced with `.keystone/prisma/schema.prisma`

`keystone-next dev` (_dev_): In dev mode Keystone will use Prisma's migration framework to generate and locally apply migrations when you start your system.

Artefacts:

- `.keystone/schema.graphql` (commit me)

- `.keystone/schema-types.ts` (commit me)

- `.keystone/admin/` (.gitignore)

- `.keystone/prisma/schema.prisma` (commit me)

- `.keystone/prisma/generated-client/` (.gitignore)

- `.keystone/prisma/migrations/` (commit me)

  Database changes:

- All migrations in `.keystone/prisma/migrations/` are applied.

`keystone-next start` (_production_): In production mode Keystone will not apply or generate any database migrations. It will use the pre-built version of the Admin UI, and a pre-built Prisma client. If database migrations have not been applied, the Prisma client is outdated or missing, or the Admin UI has not been built, then the server will not start.

Artefacts:

- None

  Database changes:

- None

### Build

`keystone-next build`: The build command is used to generate a built version of Admin UI and the Prisma client which can be used when running the system in production mode (`keystone-next start`).

Artefacts:

- `.keystone/schema.graphql` (commit me)

- `.keystone/schema-types.ts` (commit me)

- `.keystone/admin/` (.gitignore)

- `.keystone/admin/.next` (.gitignore)

- `.keystone/prisma/schema.prisma` (commit me)

- `.keystone/prisma/generated-client/` (.gitignore)

  Database changes:

- None

### Migrate (Preview)

**Note**: The migration CLI API is still under development and may change.

`keystone-next reset`: This command invokes `prisma migrate reset` to reset your local database to a state consistent with the migrations directory. Use this command before running `keystone-next generate` to ensure that a valid migration is created.

Artefacts:

- None

  Database changes:

- Database is dropped, then recreated to be consistent with `.keystone/prisma/migrations/`.

`keystone-next generate`. This command will generate a migration schema based on the current state of your database and your Keystone schema. This command should be run after running `keystone-next reset` and the generated migration artefact should be added to your repository so that it can be shared with other developers and deployed in production.

Artefacts:

- `.keystone/schema.graphql` (commit me)

- `.keystone/schema-types.ts` (commit me)

- `.keystone/prisma/schema.prisma` (commit me)

- `.keystone/prisma/generated-client/` (.gitignore)

- `.keystone/prisma/migrations/` (commit me)

  Database changes:

- None

`keystone-next deploy`. This command will apply any migrations in the migrations directory. It should be used in production to apply migrations before starting the server.

Artefacts:

- None

Database changes:

- All migrations in `.keystone/prisma/migrations/` are applied.
