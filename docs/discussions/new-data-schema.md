<!--[meta]
section: discussions
title: A new data schema
[meta]-->

# Arcade - A new data schema for Keystone

> **Note:** This document refers to a set of package releases which are all part of one Keystone release.
> These package releases are collectively known as the `Arcade` release of Keystone. The packages included are:
>
> - `@keystonejs/adapter-knex`: `9.0.0`
> - `@keystonejs/adapter-mongoose`: `8.0.0`
> - `@keystonejs/fields`: `9.0.0`
> - `@keystonejs/keystone`: `8.0.0`
> - `@keystonejs/mongo-join-builder`: `7.0.0`

We are excited to announce a **new and improved data schema** for Keystone.
The new data schema simplifies the way your data is stored and will unlock the development of new functionality within Keystone.

> **Important:** You will need to make changes to your database to take advantage of the new data schema. Read on for details of what has changed and why, or jump straight to the [schema upgrade guide](/docs/guides/relationship-migration.md).

## Background

Keystone provides an extremely powerful graphQL API which includes filtering, sorting, and nested queries / mutations.
The full CRUD API is generated from simple `List` definitions provided by you, the developer.
All of this functionality is powered by our _database adapters_, which convert your graphQL queries into SQL/NoSQL queries and then convert the results back to graphQL.

Keystone needs to know about, and manage, the schema of the underlying database so it can correctly construct its queries.
We designed our database schemas when we first developed the database adapters, and they have served us very well.
In particular, we have come a long way with our support for complex relationships using the database schemas we initially developed.
By keeping a consistent schema, users have been able to stay up to date with Keystone updates without having to make changes to their data.

Unfortunately we have now outgrown this original schema.
More and more we are finding that [certain bugs](https://github.com/keystonejs/keystone/issues/1362) are hard to fix, and [certain features](https://github.com/keystonejs/keystone/issues/313) difficult to implement, because of the limitations of our initial design.
While it has served us well, it's time for an upgrade.

## The problem

The key challenge in designing our schema is how we represent relationships between lists.
Our initial design borrowed heavily from a `MongoDB` inspired pattern, where each object was responsible for tracking its related items.
This made the initial implementation very simple, particularly for the `MongoDB` adapter.
The `PostgreSQL` adapter was more complex, as it had to emulate the patterns from `MongoDB`, but it also worked.

One of the design trade-offs in the initial schema was that we [denormalised](https://en.wikipedia.org/wiki/Denormalization) the data in order to simplify the query generation.
This means we stored duplicated data in the database, but we could very quickly perform lookups without requiring complex queries.

Unfortunately, this trade off is no longer working in our favour.
Maintaining the denormalised data is now more complex than generating queries against normalised data.
We are finding that some reported bugs are difficult to resolve due to the complex nature of resolving denormalised data.
There are also more sophisticated relationship patterns, such as [ordered relationships](https://github.com/keystonejs/keystone/issues/313), which are too difficult to implement in the current schema.

## The solution

To address these problems at their core we have changed our data schema to be normalised and to eliminate the duplicated data.
This means that our query generation code has become more complex, but this trade off gains us a number of benefits:

1. Eliminates duplicated data in the database.
2. Uses a more conventional database schema design, particularly for `PostgreSQL`.
3. More robust query generation.
4. More extensible relationship patterns.

### No more duplicated data

Eliminating duplicated data removes the risk of the data getting out of sync, and also simplified all of our `create`, `update`, and `delete` operations.

### Conventional database schema

The new database schema matches much more closely with the schema a database engineer would design if they were building this schema by hand.

### More robust queries

As part of this change we have introduced a much more comprehensive set of tests, which push the graphQL API to its limit.
These additional tests allowed us to find and fix a number of corner case bugs from the initial implementation.

### More extensible relationships

The internal representation of relationships within Keystone is now much more sophisticated.
This will allow us to extend the kind of modelling that Keystone provides to include things like ordered relationships.

## Updating your database

In order to take advantage of these improvements you will need to make some changes to your database.
In some instances this will simply involve removing tables or columns which are no longer required.
In other cases you will need to rename some tables or columns and possibly move data from one table to another.

To assist with this process we have written a [Schema Upgrade Guide](/docs/guides/relationship-migration.md), which will take you through the steps to safely transition your database.

## Summary

The new Keystone data schema will simplify and improve the storage of your crucial system data, and will unlock new functionality.
We appreciate that making changes to your production database can be a daunting task, but we hope to make this process as smooth as possible.
We are looking forward to building on these changes to provide an even more powerful Keystone in the future 🚀
