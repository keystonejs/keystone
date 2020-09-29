<!--[meta]
section: blog
title: Keystone + Prisma
date: 2020-09-29
author: Tim Leslie
order: 0.4
[meta]-->

Drumroll please 🥁...

Today we're pleased to announce the first release of the [Prisma database adapter for Keystone](/docs/guides/prisma.md)!

This adapter will let you build your application with Keystone, while having access to [Prisma's powerful database client](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client) for all your server-side data interaction needs.

We're excited to be giving our community the chance to experiment with Prisma + Keystone while we work in parallel with Prisma to make the complete system production-ready for all your headless CMS needs.

## What is Prisma?

[Prisma](http://prisma.io) is an open source database toolkit, which provides an auto-generated and type-safe query builder which is customised specifically for your database. It includes support for PostgreSQL, MySQL, and SQLite, with more backends in the pipeline.

Prisma v2 [was released](https://www.prisma.io/blog/announcing-prisma-2-n0v98rzc8br1/) in June of 2020, and we've been working hard since then to integrate it with Keystone so you can make the most of its powerful features.

As well as providing basic read and write interfaces, Prisma also provides support for features such as transactions, aggregations, and migration.

## Why Prisma?

Databases are hard 🤷. Over the last two years we've made a huge effort to keep our database interactions correct and safe, and we're very proud of our `knex` and `mongoose` adapters, which are both production ready.

This effort has given us an appreciation of just how challenging it is to solve all the problems surrounding automatic query generation. The Prisma team have decided they are going to focus on _this exact problem_, putting all their energy into building a world class database toolkit.

We believe the Prisma team are better placed than us to make significant advances in this problem space, so we're backing them and building on top of the great work they're doing. By doing so, we're keeping our focus on what we're great at - crafting a powerful, easy to use headless CMS system.

## Where to next?

This first release of the Prisma adapter is just the beginning of the Keystone + Prisma journey, and we still have a long way to go.

- **Support for MySQL and SQLite**: The current implementation only supports `PostgreSQL`. We plan to include support for all backends supported by Prisma.
- **Complete support for all field types:** The Prisma adapter currently supports all field types except `Decimal`. There are some minor known issues with `Json` based fields, which we're working with the Prisma team to solve.
- **Make the out of the box experience seamless:** We want to make getting started with Keystone + Prisma as simple as possible. We'll be working on the DX of the getting started experience so that you can get up and running as quickly as possible.
- **Have production-ready migrations:** When getting started with Keystone the database is the last thing you want to worry about, but when you're running in production you need to have control over how and when your database migrations take place. We'll be establishing guidelines you can follow to make production migrations a breeze.

You can read more about the current support in our [Prisma Adapter - Production Ready Checklist](/docs/discussions/prisma.md)

> **Tip:** Want to get started with Keystone + Prisma? [Follow the guide](/docs/guides/prisma.md)!

## How can I help?

We would love to get feedback on the Prisma adapter while we work towards being production ready. [Give it a try](/docs/guides/prisma.md) and if you have any feedback, please open an issue or PR on [Github](https://github.com/keystonejs/keystone) 🙏

## Q&A

- **Can I still use the `knex` or `mongoose` database adapter?**
  Yes! These adapters continue to be the recommended database adapters for production systems.
- **What do you mean by "not production ready"?**
  The Prisma adapter currently takes advantage of [Prisma Migrate](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate), which is the Prisma tool for generating and applying migrations. This tool is still in an experimental state, and so we won't recommend the Keystone Prisma adapter for production use until Prisma Migrate is production ready.
- **I'm using the `knex` adapter, can I switch over to the Prisma adapter?**
  Not yet. While the `knex` and Prisma adapters generate very similar database schemas, there are some differences that make them incompatible. Before the Prisma adapter is production ready we will make sure there is an automatic migration script which will allow you to convert your `knex` based database into a form that can be used by Prisma.
