<!--[meta]
section: api
subSection: database-adapters
title: Knex Adapter
[meta]-->

# Knex Database Adapter

The [Knex](https://knexjs.org/#changelog) adapter is a general purpose adapter which can be used to connect to a range of different database backends.
At present, the only fully tested backend is `Postgres`, however Knex gives the potential for `MSSQL`, `MySQL`, `MariaDB`, `SQLite3`, `Oracle`, and `Amazon Redshift` to be supported.

## Usage

```javascript
const { KnexAdapter } = require('@keystonejs/adapter-knex');

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new KnexAdapter(),
});
```

## API `new KnexAdapter(options)`

### `options.schemaName`

_**Default:**_ `'public'`

All postgres tables are grouped within a schema and `public` is the default schema.

### `options.knexOptions`

These options are passed directly through to Knex.

See the [knex docs](https://knexjs.org/#Installation-client) for more details.

_**Default:**_

```javaScript
{
  client: 'postgres',
  connection: '<DEFAULT_CONNECTION_URL>'
}
```

The `DEFAULT_CONNECTION_URL` will be either one of the following environmental variables:

- `CONNECT_TO`,
- `DATABASE_URL`,
- `KNEX_URI`

or `'postgres://localhost/<DATABASE_NAME>'`where `DATABASE_NAME` is be derived from the KeystoneJS project name.

## Debugging

To log all Knex queries, run the server with the environment variable `DEBUG=knex:query`.

## Setting Up a Database

Before running Keystone with the Knex adapter you should configure a database. By default Knex will look for a Postgres database on the default port, matching the project name, as the current user.

In most cases this database will not exist and you will want to configure a user and database for your application.

Assuming you're on MacOS and have Postgres installed the `build-test-db.sh` does this for you:

```sh
./build-test-db.sh
```

Otherwise, you can run these steps manually:

```shell
createdb -U postgres keystone
psql ks5_dev -U postgres -c "CREATE USER keystone5 PASSWORD 'k3yst0n3'"
psql ks5_dev -U postgres -c "GRANT ALL ON DATABASE keystone TO keystone5;"
```

If using the above, you will want to set a connection string of: `postgres://keystone5:k3yst0n3@localhost:5432/keystone`
