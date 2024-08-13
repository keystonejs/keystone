---
title: A year of releases in review
description: >-
  Over the past year, Keystone has received numerous updates, new features, and
  essential bug fixes. Here’s a snapshot of the key improvements over the past
  12 months.
publishDate: 2024-08-07
authorName: The Keystone Team
authorHandle: https://twitter.com/keystonejs
---
Over the past year, Keystone has received numerous updates, new features, and essential bug fixes. Here’s a snapshot of the key improvements over the past 12 months.

## Major Enhancements

### Enhanced Database Integration

One of the standout improvements this year is the update to Prisma `v5.13.0`. This update brings better performance and more robust features for database interactions. Alongside this, Keystone now supports extending the `PrismaClient`, providing more flexibility and control over database operations.

### Interactive Transactions

Keystone introduced `context.transaction`, allowing for interactive transactions within the `context`. This feature simplifies managing transactions, ensuring data integrity and consistency across operations.

### Improved Migration Commands

New migration commands like `keystone migrate create` and `keystone migrate apply` were added, making database migrations more straightforward and user-friendly.

### Validation and Hooks

A significant update was the overhaul of validation hooks for fields and lists.

Hooks like`{field|list}.hooks.validate.[create|update|delete]` provide developers with more granular control over data validation, enhancing data integrity and application reliability.

## Breaking Changes and Cleanups

### Identifier Overhaul

Keystone made a substantial change by switching file and image identifiers to random 128-bit `base64url` by default, replacing the older UUID system. This change improves security and performance.

### Type and Parameter Cleanup

Several deprecated types and parameters were removed, streamlining the codebase and improving overall efficiency. Notable removals include the old `AdminUIConfig`, `DatabaseConfig`, `GraphQLConfig`, and `ServerConfig` types, among others.

### Prisma and GraphQL Schema Handling

The handling of Prisma and GraphQL schemas saw improvements, with configurations now more centralised and consistent. This includes moving schema-related configurations to more intuitive locations within the setup.

## New Features

### Prisma Error Logging

Server-side Prisma errors are now logged with `console.error`, making debugging easier and ensuring that critical issues are more visible during development.

### Async HTTP Server Extension

Support for asynchronous operations during HTTP server startup was added, allowing for more complex and dynamic server initialization processes.

### GraphQL Error Messages

Improved error messaging for GraphQL errors in the Admin UI list view helps developers quickly identify and resolve issues.

### Admin UI Enhancements

The Admin UI saw multiple enhancements, including a responsive menu for smaller devices, better handling of field omissions, and consistent sub-field ordering for image fields.

## Bug Fixes

Keystone JS addressed numerous bugs throughout the year, improving stability and performance. Some key fixes include:

- Resolving issues with session strategies in the auth package.
- Fixing default values and ordering for various field types.
- Addressing Prisma migration errors in non-interactive environments.
- Correcting access and overflow issues in the AdminUI.

## Keystatic-powered docs & blog

A growing portion of the Keystone documentation (as well as this blog!) is now content-editable via [Keystatic](https://keystatic.com), another [Thinkmill](https://thinkmill.com.au) product.

Keystatic shares common DNA with Keystone, but operates without a database. Instead, it stores content in Markdown/YAML/JSON/Markdoc/MDX on the local file system, and syncs it with the GitHub API.

The content can be edited via a world-class Admin UI (powered by [Keystar UI](https://github.com/Thinkmill/keystatic/tree/main/design-system) and coming to Keystone soon!), but also directly from the [codebase's content files](https://github.com/keystonejs/keystone/tree/main/docs/content).

## Community Contributions

Keystone JS has a vibrant community that continually contributes to its growth ❤️

This year, we saw first-time contributions from several developers, helping to enhance the platform with new features and fixes.

We’d like to extend our heartfelt thanks to all the contributors who have dedicated their time and effort to make Keystone JS better.

### Acknowledgements

A special acknowledgment goes to some of our key community contributors who have made significant impacts:

- [@renovate](https://github.com/renovate) for consistent contributions and improvements across various packages.
- [@borisno2](https://github.com/borisno2) for significant enhancements and bug fixes.
- [@iamandrewluca](https://github.com/iamandrewluca) for introducing new capabilities and extending functionality.

Additionally, we’d like to highlight a few first-time contributors who have joined the community and made valuable contributions:

{% hint kind="tip" %}
[@ggpwnkthx](https://github.com/ggpwnkthx), [@dagrinchi](https://github.com/dagrinchi), [@Grumaks](https://github.com/Grumaks), [@PaulAroo](https://github.com/PaulAroo), [@leopoldkristjansson](https://github.com/leopoldkristjansson), [@ScottAgirs](https://github.com/ScottAgirs), [@lahirurane-rau](https://github.com/lahirurane-rau), [@MarcelMalik](https://github.com/MarcelMalik), [@TweededBadger](https://github.com/TweededBadger)
{% /hint %}

## Looking Ahead

The Keystone JS team remains committed to delivering high-quality updates and features. We are excited about the future and look forward to continuing to enhance the platform, making it even more powerful and user-friendly.

Thank you to all the community members and contributors for your ongoing support and contributions! Here’s to another year of innovation and improvement with Keystone!
