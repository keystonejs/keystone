<!--[meta]
section: quick-start
title: Configuring Adapters
[meta]-->

# Adapter Configuration

## Choosing an adapter

KeystoneJS currently provides two database adapters. Choose the [Mongoose Adapter](/keystone-alpha/adapter-mongoose/) for MongoDB or the [Knex Adapter](/keystone-alpha/adapter-knex/) for PostgreSQL.

_Note_: PostgreSQL requires an additional step to create a database.

## Installing MongoDB

The simplest way to install [MongoDB](https://www.mongodb.com/) is using [Homebrew](https://brew.sh/).

### OSX

```sh
brew install mongodb
brew services start mongodb
```

### Other Platforms

Follow the [official MongoDB installation guide](https://www.mongodb.com/download-center/community).

### Setup

By default the Mongoose Adapter will attempt to connect to MongoDB as the current user and create a new database using the project name. You can override these options when [configuring the Mongoose Adapter](/keystone-alpha/adapter-mongoose/).

## Installing Postgres

The simplest way to install [Postgres](https://www.postgresql.org/) is using [Homebrew](https://brew.sh/).

### OSX

```sh
brew install postgres
```

### Other Platforms

For Windows and other platforms see the [download instructions](https://www.postgresql.org/download/) on the [postgresql.org](https://postgresql.org) website.

### Setup

By default the Knex Adapter will attempt to connect to a PostgreSQL database as the current user. It will look for a a database matching the project name. You can override these options when [configuring the Knex Adapter](/keystone-alpha/adapter-knex/).

To create database run the following command:

`createdb my-database-name`
