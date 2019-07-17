<!--[meta]
section: packages
title: Database Adapter - Knex
[meta]-->

# Knex Database Adapter

** WARNING: This adapter is under active development and is not production ready. It _will_ drop your entire database every time you connect! **

The [Knex](https://knexjs.org/#changelog) adapter is a general purpose adapter which can be used to connect to a range of different database backends.
At present, the only fully tested backend is `Postgres`, however Knex gives the potential for `MSSQL`, `MySQL`, `MariaDB`, `SQLite3`, `Oracle`, and `Amazon Redshift` to be supported.

## Setting Up Your Database

Before running Keystone, you must set up a database, a schema, and a user.
Assuming you're on MacOS and have Postgres installed the `build-test-db.sh` does this for you:

```sh
./packages/adapter-knex/build-test-db.sh
```

Otherwise, you can run the steps manually:

```shell
createdb -U postgres ks5_dev
psql ks5_dev -U postgres -c "CREATE SCHEMA keystone;"
psql ks5_dev -U postgres -c "CREATE USER keystone5 PASSWORD 'k3yst0n3'"
psql ks5_dev -U postgres -c "GRANT ALL ON SCHEMA keystone TO keystone5;"
```

## Usage

```javascript
const { KnexAdapter } = require('@keystonejs/adapter-knex');

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new KnexAdapter(),
});

const uri = 'postgres://keystone5:k3yst0n3@127.0.0.1:5432/ks5_dev';
const client = 'postgres';
const schemaName = 'keystone';

const knexOptions = { ... };

keystone.connect(uri, {
  client,
  schemaName,
  ...knexOptions,
});
```

## API

### `uri`

_**Default:**_ `'postgres://keystone5:k3yst0n3@127.0.0.1:5432/ks5_dev'`

Either a connection string, or a connection object, as accepted by Knex.
See [knex docs](https://knexjs.org/#Installation-client) for more details.
If the environment variable `KNEX_URI` is set, its value will be used as the default.

### `client`

_**Default:**_ `'postgres'`

Defines the type of backend to use. Current `postgres` is supported, but any value supported by Knex may be supported in the future.

### `schemaName`

_**Default:**_ `'keystone'`

All keystone tables are grouped within a schema. This value should match the name of the schema used in the `CREATE SCHEMA` step above.

### `knexOptions`

Any extra options provided will be passed through to the Knex configuration function. See the [Knex docs](https://knexjs.org/#Installation-client) for possible values.

## Debugging

To log all Knex queries, run the server with the environment variable `DEBUG=knex:query`.
