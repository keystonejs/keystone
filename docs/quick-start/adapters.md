<!--[meta]
section: quick-start
title: Database setup
[meta]-->

# Database setup

<!-- TODO: Needs some introductory text -->

## Choosing an adapter

KeystoneJS currently provides two adapters for connecting to either a MongoDB or PostgreSQL database.
Choose the [Mongoose adapter](/packages/adapter-mongoose/README.md) for MongoDB or the [Knex adapter](/packages/adapter-knex/README.md) for PostgreSQL.

<!-- FIXME:TL This sentence implies that all the user has to do is select the adapter and nothing else.
In reality they have to follow the steps in this guide! -->

If you're following the [quick start guide](/docs/quick-start/README.md), simply select the appropriate adapter for your database of choice when prompted.
More information on adapter configuration can be found under the _Setup_ sections.

> **Note:** PostgreSQL requires an additional step to create a database.

## Installing [MongoDB](https://www.mongodb.com/)

### MacOS

The simplest way to install MongoDB is using [Homebrew](https://brew.sh/).
Refer the [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/) for more information.

### Windows

Follow the [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) for installing MongoDB on Windows.

### Other platforms

[Downloads](https://www.mongodb.com/download-center/community) and [instructions](https://docs.mongodb.com/manual/administration/install-on-linux/) for installation on various Linux systems are also available.

### Setup

By default the Mongoose adapter will attempt to connect to MongoDB as the current user and create a new database using the project name.
You can override these options when [configuring the Mongoose adapter](/packages/adapter-mongoose/README.md).

## Installing [PostgreSQL](https://www.postgresql.org/)

### MacOS

The simplest way to install PostgreSQL is using [Homebrew](https://brew.sh/).

```bash
brew install postgres
```

### Other platforms

For Windows and other platforms see the [download instructions](https://www.postgresql.org/download/) on the [postgresql.org](https://postgresql.org) website.

### Setup

By default the Knex adapter will attempt to connect to a PostgreSQL database as the current user.
It will look for a database matching the project name.
You can override these options when [configuring the Knex adapter](/packages/adapter-knex/README.md).

<!-- FIXME:TL These instructions are inadequate for a new user folowing the quicks start. -->

To create database run the following command:

```bash
createdb my-database-name
```
