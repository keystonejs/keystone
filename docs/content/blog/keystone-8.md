---
title: '@keystone-6/core@8.0.0'
description: >-
  @keystone-6/core@8.0.0 is a major release that modernises the runtime and
  database stack, expands access-control capabilities, and introduces new ways
  to manage content and relationships through the Admin UI.
publishDate: 2026-07-28
authorName: The Keystone Team
authorHandle: https://twitter.com/keystonejs
---

`@keystone-6/core@8.0.0` is a major release that modernises the runtime and database stack, expands access-control capabilities, and introduces new ways to manage content and relationships through the Admin UI.

The release adds support for Prisma 7 and Next.js 16, OpenTelemetry tracing, and improvements across authentication, storage, and document fields.

It also includes several breaking changes, so most applications will need some migration work. Here are the main changes.

## A redesigned Admin UI

The Admin UI has had a major refresh in this release.

It is now built on `@keystar/ui`, replacing the previous `@keystone-ui/*` design system with a new look and a more modern component foundation.

![Keystone list page](/assets/blog/images/keystone-8/list-page.webp)

Relationship fields can now be displayed as tables, showing multiple fields from each related item in one place, with support for sorting and filtering.

![Relationship table on Keystone item page](/assets/blog/images/keystone-8/relationship-table.webp)

Actions add custom operations to lists.

![Action on Keystone item page](/assets/blog/images/keystone-8/action.webp)

The release also introduces client-side conditional field modes so a field can be hidden, read-only, or editable based on the values of other fields in the same item.

![Keystone item page with a reason field that's only shown when the priority is high](/assets/blog/images/keystone-8/client-side-conditional-filters.webp)

Applications with custom Admin UI components will need to migrate them to `@keystar/ui`, using the exact version listed in the peer dependencies of `@keystone-6/core`.

## More precise access control

Field-level read access is now also used for defining whether a field can be filtered or ordered in `access.read` :

- `access.read.item`
- `access.read.filter`
- `access.read.order`

These replace the previous `isFilterable` and `isOrderable` options which were easy to miss and accidentally expose data you didn’t intend to.

Query access can also be configured separately through:

- `access.operation.query.one`
- `access.operation.query.many`
- `access.operation.query.count`

The release includes further improvements to schema exposure, internal contexts, error handling, and relationship filters. The lower-level API details are covered in the changelog.

## A modernised runtime and database stack

`@keystone-6/core@8.0.0` upgrades several major dependencies:

- Prisma 7
- Next.js 16
- Apollo Server 5
- Apollo Client 4
- Express 5

Applications now need to install Prisma, Prisma Client, the relevant database adapter, Next.js, React, and React DOM directly.

Database configuration is now defined in `db.prismaClientOptions`. The previous `keystone prisma` and `keystone migrate` commands have been removed, use the `prisma` CLI directly instead.

Prisma Client now generates into `generated/prisma` by default.

To align with the Prisma Client in `generated/prisma`, Keystone’s generated types are now generated in `generated/keystone/types.ts` by default.

The `graphql` export has also been renamed to `g`, with `gWithContext` available for binding it to an application’s context type. You can find more details about this API at [graphql-ts.com](https://graphql-ts.com).

## Other highlights

`@keystone-6/core@8.0.0` also introduces:

- OpenTelemetry tracing for Keystone operations
- CUID2, UUID v7, ULID, and Nano ID support
- A new storage strategy for image and file fields
- Improved many-to-many relationship updates
- Unique filters for one-to-one relationships
- Better filtering and sorting for document-field relationships

## What to review before upgrading

Several deprecated APIs and configuration options have been removed or replaced.

You may need additional migration work if your application uses:

- Custom Admin UI components
- Keystone’s previous database commands
- Magic link auth or password-reset flows
- Database testing helpers
- Field-level filtering or ordering access
- Deprecated validation hooks
- Image or file storage

The `@keystone-ui/*` design system has also been removed. Custom Admin UI components should move to `@keystar/ui`, using the exact version listed in the peer dependencies of `@keystone-6/core`.

For step-by-step instructions, see the [Migrate to `@keystone-6/core` 8.0.0 guide](../guides/migrate-to-8).

The complete list of breaking changes, renamed properties, and lower-level API updates is available in the [GitHub release](https://github.com/keystonejs/keystone/releases/tag/2026-07-28).
