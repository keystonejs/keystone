---
title: "Keystone now supports MySQL"
description: "We've added support for MySQL to Keystone's list of DB providers, bringing the total number of supported DB types to three."
publishDate: "2022-06-30"
authorName: "Dinesh Pandiyan"
authorHandle: "https://twitter.com/flexdinesh"
metaImageUrl: ""
---

We've added support for MySQL to Keystone's list of database providers, bringing the total number of supported database types to three.

Here's an example `db.config` to work with MySQL database.

```js
export default config({
  db: {
    provider: 'mysql',
    url: 'mysql://dbuser:dbpass@localhost:5432/keystone',
    idField: { kind: 'uuid' },
  },
  ...
});
```

There are some differences in how Postgres and MySQL operate so be sure to checkout our new [choosing the right database guide](https://keystonejs.com/docs/guides/choosing-a-database).

For more info, check out our [Pull Request - Add support for MySQL](https://github.com/keystonejs/keystone/pull/7538).

If you like using Keystone, we'd appreciate a shout out in [Twitter](https://twitter.com/KeystoneJS) and a star in [GitHub](https://github.com/keystonejs/keystone).
