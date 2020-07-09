<!--[meta]
section: guides
title: Migrations
subSection: advanced
[meta]-->

# Migrations in Keystone

As your app grows new features, you'll inevitably need to change some of your existing List definitions. When you do, you'll also need to migrate the data and schema in your database backend.

**Keystone can't automatically manage these migrations for you** because it doesn't know what to do with the existing data. This guide will explain when and why you need database migrations and offer some basic solutions to get you started.

When you create a new List, depending on the adapter, Keystone will initialise a database table with columns for each of the fields defined in the List. Let's look at an example.

```javascript
const { KnexAdapter } = require('@keystonejs/adapter-knex');

const keystone = new Keystone({
  adapter: new KnexAdapter(),
});

keystone.createList('ExampleList', {
  fields: {
    age: { type: Integer },
  },
});
```

Using the KnexAdapter if we create an `ExampleList` that contains an `Integer` field called `age` when we start Keystone for the first time it will generate a table with an `id` and `age` column:

| table_name  | column_name | data_type |
| ----------- | ----------- | --------- |
| ExampleList | id          | integer   |
| ExampleList | age         | integer   |

If we update our Keystone List either by renaming fields or adding new fields, we might encounter errors next time we start Keystone. This is because the database schema has changed and Keystone doesn't know what to do with existing data or won't be able to save new data. Let's imagine that because we are responsible with data collection we want to update the list to only include an age range rather than a specific age. We might update the field to use a select type:

```javascript
keystone.createList('ExampleList', {
  fields: {
    age: { type: Select, options: '0-18, 19-35, 36-50, 50+' },
  },
});
```

If we restart Keystone after this change it will throw an error. The `data_type` of the `age` column is now a `text` value and it should contain a string representation of the age range. The table should change to something like the following:

| table_name  | column_name | data_type |
| ----------- | ----------- | --------- |
| ExampleList | id          | integer   |
| ExampleList | age         | text      |

Keystone cannot make this change for you because there could be existing data with a type of `integer`. Sometimes migrations can be as simple as converting an `integer` to a `string` but in this case we need to programatically resolving the appropriate value.

## Migration options

### Drop and replace

In development sometimes it can be helpful to drop the database everytime Keystone is restarted. To do this using the `KnexAdapter` you can pass the `dropDatabase` option to the adapter:

```js
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const adapter = new KnexAdapter({ dropDatabase: true });
```

This might be enough for small projects but it won't be ideal for everyone. If you want data to persist in development you need to re-initialise the database or preform migrations. And regardless of the development environment, almost all projects will eventually need to make changes to a List table in production. For this there are a number of solutions.

### Manual migrations

The most basic solution is to make these changes on the database. You can do this via a command-line, or you might prefer a graphical DB admin interface. For Mongo you might try [Studio 3T](https://studio3t.com/download/) which is free for non-commercial use. For Postgres you can try [pgadmin](https://www.pgadmin.org/). There are a lot of other options and you should find one that works for you.

Here's how you might do a data migration for the `ExampleList` above in Postgres:

```sql
ALTER TABLE "ExampleList"
ALTER COLUMN "age" TYPE text
    USING (
    CASE WHEN age<=18 THEN '0-18'
        WHEN age<=35 THEN '19-35'
        WHEN age<=50 THEN '36-50'
        ELSE '50+'
    END);
```

### Managed migrations

Keystone database adapters use Mongoose and Knex under the hood, both of which have migrations solutions. Rather than running SQL queries directly, you can write migrations using JavaScript, and tools like the [Knex CLI](http://knexjs.org/#Migrations) allow you to keep track of which migrations have been applied. You seed the database, run or rollback specific migrations or apply all missing migrations in the correct order.

Managed migrations are useful when working in a team or with duplicated deployments (e.g., development and production). They help keep database changes consistent, even when multiple developers are working with multiple databases.

For small scale projects you can avoid the need for many migrations with careful planning, drop the database frequently while in development and use GUI tools to apply manual updates.
