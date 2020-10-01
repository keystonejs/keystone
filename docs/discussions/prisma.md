<!--[meta]
section: discussions
title: Prisma Adapter - Production Ready Checklist
[meta]-->

# Prisma Adapter - Production Ready Checklist

The Prisma adapter is currently in not yet production ready.
This document outlines the aspects of the adapter which we believe still need improvement before the adapter should be used in production system.

> **Tip:** Looking for how to get started with Keystone + Prisma? [Follow the guide](/docs/guides/prisma.md)!

## Database Support

The Prisma adapter currently only supports PostgreSQL databases. Future releases will enable support for all database backends which are [supported by Prisma](https://www.prisma.io/docs/more/supported-databases).

## Migrations

[Prisma Migrate](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate) is currently considered experimental.
The Prisma adapter will not be considered production ready until Prisma Migrate is also production ready.

## Field types

The Prisma adapter currently has either full or partial support for almost all Keystone field types.
We would like to have full support for all Keystone field types, and are working on the adapter itself as well as with the Prisma team to address the remaining issues.

### Unsupported field types

- `Decimal`: The Decimal field type requires the use of a native type at the database level which is not currently supported by Prisma. See [Prisma:#3374](https://github.com/prisma/prisma/issues/3374) and [Prisma:#3579](https://github.com/prisma/prisma/issues/3579).

### Partially supported field types

- `File`, `CloudinaryImage`, `GoogleLocation`, `OEmbed`, `Unsplash`: These field types use the Prisma `Json` type. These field types do not currently support filtering against `null`. See [Prisma:#3579](https://github.com/prisma/prisma/issues/3579).
- `Password`: The `password_is_set` query does not perform a test to check is the stored value is a valid hash, as Prisma does not currently support regex filtering.
- `Uuid`: We do not yet support using `Uuid` as a `primaryKey` field, but it can be used as a non-primary key field.

## Keystone - Prisma field type mapping

| Keystone Type        |         Prisma Type         |
| :------------------- | :-------------------------: |
| **Core fields**      |                             |
| `CalendarDay`        |          `DateTime`         |
| `Checkbox`           |          `Boolean`          |
| `DateTime`           |    `DateTime` + `String`    |
| `DateTimeUtc`        |          `DateTime`         |
| `Decimal`            |            `N/A`            |
| `File`               |            `Json`           |
| `Float`              |           `Float`           |
| `Integer`            |            `Int`            |
| `Password`           |           `String`          |
| `Relationship`       |         `@relation`         |
| `Select`             | `Enum` \| `Int` \| `String` |
| `Slug`               |           `String`          |
| `Text`               |           `String`          |
| `Url`                |           `String`          |
| `Uuid`               |           `String`          |
| `Virtual`            |            `N/A`            |
| **Extra fields**     |                             |
| `Color`              |           `String`          |
| `Content`            |         `@relation`         |
| `AuthedRelationship` |         `@relation`         |
| `AutoIncrement`      |            `Int`            |
| `CloudinaryImage`    |            `Json`           |
| `GoogleLocation`     |            `Json`           |
| `Markdown`           |           `String`          |
| `MongoId`            |           `String`          |
| `OEmbed`             |            `Json`           |
| `Unsplash`           |            `Json`           |
| `Wysiwyg`            |           `String`          |
