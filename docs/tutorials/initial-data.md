<!--[meta]
section: tutorials
title: Seeding data
order: 3
[meta]-->

# Seeding data

This guide will show you how to create a `User` list and add initial data to it
using the `createItems` method. This process is also called `seeding`.

> **Note:** In a previous chapter the code was split up over separate files, while this is preferred in a real code base, in this part everything is put in one file for clarity reasons.

## List setup

### Install packages

This chapter will use a different `User` schema than previous chapters and instead
of a `Todo` list, there will be a `Post` list. It is best to start from a fresh
project and start from an empty database (delete data from previous chapters).
Also, make sure to have all of the following packages installed:

```shell allowCopy=false showLanguage=false
yarn add @keystonejs/keystone
yarn add @keystonejs/adapter-mongoose
yarn add @keystonejs/app-graphql
yarn add @keystonejs/fields
yarn add @keystonejs/app-admin-ui
yarn add @keystonejs/auth-password
```

### Preparation

First let's create a `User` list and add a `PasswordAuthStrategy`. The code in `index.js`:

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Checkbox, Password } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  adapter: new MongooseAdapter(),
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: { type: Checkbox },
    password: {
      type: Password,
    },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({ name: 'example-project', enableDefaultRoute: true, authStrategy }),
  ],
};
```

> **Tip:** A similar setup can be achieved by running the Keystone CLI `yarn create keystone-app` and selecting `Starter (Users + Authentication)`. This starter project has a `User` list, `PasswordAuthStrategy` and seeding of the database already configured. For now, we will proceed manually.
