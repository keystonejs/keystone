---
title: "Choosing the right Database"
description: "How to choose the right database for your Keystone project"
---

Keystone supports [Postgres](https://www.postgresql.org), [MySQL](https://www.mysql.com) and [SQLite](https://www.sqlite.org/index.html) database [providers](/docs/config/config#db). This guide highlights the differences between these providers to help you choose the right one for your project.

{% hint kind="tip" %}
**Note:** SQLite is not recommended in production except for scenarios like the [Embedded Keystone](/blog/embedded-mode-with-sqlite-nextjs) example
{% /hint %}

## Case Sensitivity

By default, Postgres is case sensitive, while MySQL is not case sensitive, and SQLite is not case sensitive for `contains`, `startsWith` and `endsWith`. This means when filtering and sorting the results will differ depending on the database type and collation used.
When using `StringFilter` in a GraphQL query the `mode` defaults to case sensitive for the database. You can make a query case insensitive in Postgres by using `mode: insensitive`.

See the [Case Sensitivity Prisma Docs](https://www.prisma.io/docs/concepts/components/prisma-client/case-sensitivity) for more information.

{% hint kind="tip" %}
**Note:** `mode: insensitive` is not supported in MySQL or SQLite
{% /hint %}

## Default Types

Prisma has different default types for each database used, for example, the Keystone `text` field type uses the Prisma type of `String`,
for Postgres, Prisma uses the `text` column type, and for MySQL, it uses the `varchar(191)` column type. For more details on the `field` type differences
see [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model-field-scalar-types).

The Keystone `text` field supports the `db.nativeType` option, allowing you to override this - [Fields API](/docs/fields/overview). Over time this option will be added to other field types.

## Auto Increment Integer Fields

When using an [Integer field](/docs/fields/integer) with the `defaultValue: { kind: 'autoincrement' }` MySQL also requires this field to be indexed using the `isIndexed: true` or `isIndexed: 'unique'`.

## Supported Database Versions

For supported database provider versions for Postgres and MySQL see [Prisma Supported Databases](https://www.prisma.io/docs/reference/database-reference/supported-databases)

## Related resources

{% related-content %}
{% well
heading="Fields API"
href="/docs/fields/overview" %}
Documentation for the Fields API
{% /well %}
{% well
heading="DB Config API"
href="/docs/config/config#db" %}
Documentation for the DB Config API
{% /well %}
{% /related-content %}
