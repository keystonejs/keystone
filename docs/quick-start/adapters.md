<!--[meta]
section: quick-start
title: Database Setup and Adapters
[meta]-->

## Choosing an Adapter

KeystoneJS currently provides two adapters for connecting to either a MongoDB or PostgreSQL database. Choose the [Mongoose Adapter](/keystonejs/adapter-mongoose/) for MongoDB or the [Knex Adapter](/keystonejs/adapter-knex/) for PostgreSQL.

If you're following the [quick start guide](/quick-start/adapters), simply select the appropriate adapter for your database of choice when prompted. More information on adapter configuration can be found under the *Setup* sections.

_Note_: PostgreSQL requires an additional step to create a database.

## Installing [MongoDB](https://www.mongodb.com/)

### MacOS

The simplest way to install MongoDB is using [Homebrew](https://brew.sh/). Refer the [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/) for more information.

### Windows

Follow the [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) for installing MongoDB on Windows.

### Other Platforms

[Downloads](https://www.mongodb.com/download-center/community) and [instructions](https://docs.mongodb.com/manual/administration/install-on-linux/) for installation on various Linux systems are also available.

### Setup

By default the Mongoose Adapter will attempt to connect to MongoDB as the current user and create a new database using the project name. You can override these options when [configuring the Mongoose Adapter](/keystonejs/adapter-mongoose/).

## Installing [Postgres](https://www.postgresql.org/)

### MacOS

The simplest way to install Postgres is using [Homebrew](https://brew.sh/).

```sh
brew install postgres
```

### Other Platforms

For Windows and other platforms see the [download instructions](https://www.postgresql.org/download/) on the [postgresql.org](https://postgresql.org) website.

### Setup

By default the Knex Adapter will attempt to connect to a PostgreSQL database as the current user. It will look for a a database matching the project name. You can override these options when [configuring the Knex Adapter](/keystonejs/adapter-knex/).

To create database run the following command:

```sh
createdb my-database-name
```
