---
'@keystone-next/keystone': minor
'@keystone-next/adapter-prisma-legacy': minor
---

Changed `keystone-next generate` so that it uses Prisma's programmatic APIs to generate migrations and it accepts the following options as command line arguments or as prompts:

- `--name` to set the name of the migration
- `--accept-data-loss` to allow resetting the database when it is out of sync with the migrations
- `--allow-empty` to create an empty migration when there are no changes to the schema
