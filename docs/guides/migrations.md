<!--[meta]
section: guides
title: Migrations
[meta]-->

## Migrations in Keystone

**Keystone does not handle migrations**.

When you create a new List, depending on the adapter, Keystone will initialise a database table with columns for each of the fields defined in the List.

If you update the List either by renaming a field, or adding new fields, you might encounter errors next time you start Keystone. This is because the database schema has changed and Keystone doesn't know what to do with existing data, or it won't be able to save new data.

How this happens depends on the database. Mongo will happily store new objects and immediately forget about existing data, while Postgres is more likely to throw errors.

In development where you experiment you probably want change the shape of Lists frequently and it can be helpful to drop the database everytime Keystone is restarted. To do this the `KnexAdapter` has a `dropDatabase` option:

```js
const { KnexAdapter } = require('@keystone-alpha/adapter-knex');
const adapter = new KnexAdapter({ dropDatabase: true });
```

This might be enough for simple projects but it won't be ideal for everyone, you might want data to persist, even in development, and almost all projects eventually need to manage changes to a database table in production. For this there are a number of solutions.

The most basic solution is to run update scripts directly on the database via a CLI or GUI. If you're reading this guide you're probably looking for a GUI to help you view and manage tables created by Keystone.

For Mongo you can try ?(https://studio3t.com/download/)? which is free for non-commercial use. For Postgres try \_\_\_\_. There are a lot of other options.

```

```
