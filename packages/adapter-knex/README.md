<!--[meta]
section: packages
title: Database Adapter - Knex
[meta]-->

# Knex Database Adapter

** WARNING: This adapter is under active development and is not production ready. It _will_ drop your entire database every time you connect! **

The [Knex](https://knexjs.org/#changelog) adapter is a general purpose adapter which can be used to connect to a range of different database backends.
At present, the only fully tested backend is `Postgres`, however Knex gives the potential for `MSSQL`, `MySQL`, `MariaDB`, `SQLite3`, `Oracle`, and `Amazon Redshift` to be supported.

## Setting Up Your Database

Before running Keystone, you must set up a database.

Assuming you're on MacOS and have Postgres installed the `build-test-db.sh` does this for you:

```sh
./build-test-db.sh
```

Otherwise, you can run the steps manually:

```shell
createdb -U postgres keystone
psql ks5_dev -U postgres -c "CREATE USER keystone5 PASSWORD 'k3yst0n3'"
psql ks5_dev -U postgres -c "GRANT ALL ON SCHEMA keystone TO keystone5;"
```

## Usage

```javascript
const { KnexAdapter } = require('@keystonejs/adapter-knex');

const knexOptions = {
  connection: 'postgres://keystone5:k3yst0n3@localhost:5432/keystone',
};

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new KnexAdapter(knexOptions),
});
```

## API

All Knex Adapter options are passed directly

### `connection`

_**Default:**_ `'postgres://localhost/keystone'`

Either a connection string, or a connection object, as accepted by Knex.
See [knex docs](https://knexjs.org/#Installation-client) for more details.
If the environment variable `KNEX_URI` is set, its value will be used as the default.

### `client`

_**Default:**_ `'postgres'`

Defines the type of backend to use. Current `postgres` is supported, but any value supported by Knex may be supported in the future.

### `schemaName`

_**Default:**_ `'public'`

All postgres tables are grouped within a schema. This value should match the name of the schema used in the `CREATE SCHEMA` step above.

## Debugging

To log all Knex queries, run the server with the environment variable `DEBUG=knex:query`.
