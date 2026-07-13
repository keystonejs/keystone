---
title: 'Lesson 1: Installing Keystone'
description: 'Learn Keystone: Lesson 1'
---

Learn how to install Keystone, create your first content type, and get an app up and running with an intuitive editing environment.

## Introduction

Welcome to the Keystone getting started series!

Together we’ll learn how to turn an empty folder into a database-backed Keystone instance with related content types, publishing workflows, password protection, an editing interface, and more.

{% hint kind="tip" %}
Looking to demo Keystone in under 5 minutes? [Try the quick-start CLI](/docs/getting-started)
{% /hint %}

This series assumes you have some basic familiarity with:

- The **command line** for running Keystone
- The **node ecosystem** for installing packages from npm, and running npm scripts
- **JavaScript/TypeScript** for programming Keystone. You won't need to use much typescript in this series, however you can still benefit from using Keystone's inbuilt types
- **GraphQL** for querying your Keystone content

## Install Keystone

Let’s start by setting up a workspace for a new Keystone project. Make a new folder and initialise it:

```bash
mkdir keystone-learning
cd keystone-learning
npm init
```

{% hint kind="tip" %}
We’ll be using `npm` for installing packages, but you can use any other package manager you prefer.
{% /hint %}

Now add Keystone, Prisma, and the SQLite driver adapter:

```bash
npm install @keystone-6/core @prisma/adapter-better-sqlite3 @prisma/client better-sqlite3 prisma
```

## Configure Keystone

Keystone looks for a file named `keystone.ts` (or `keystone.js`) at the project root to handle configuration needs. Let's go ahead and set one up using TypeScript:

```js
// keystone.ts
export default {}
```

And add TypeScript as a dependency:

```bash
npm install typescript
```

{% hint kind="tip" %}
If you’d rather use JavaScript, make a `keystone.js` file and skip the TypeScript installation step above.
{% /hint %}

Your folder structure should now look like this:

```sh
.
├── node_modules        # Dependencies
├── keystone.ts         # Keystone config
├── package.json        # With Keystone and TypeScript as dependencies
├── prisma.config.ts    # Prisma CLI and migration configuration
└── package-lock.json   # Your npm lock file
```

Create `prisma.config.ts` alongside `keystone.ts` so the Prisma CLI knows where to find the generated schema and database:

```ts
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'schema.prisma',
  migrations: { path: 'migrations' },
  datasource: { url: 'file:./keystone.db' },
})
```

We now need to configure `keystone.ts` with two parts to get our project running:

- [`db`](/docs/config/config#db) to define a database configuration
- [`list`](/docs/config/lists) to define the shape of the information we put in that database

### Add a Database

We’ll use [SQLite](/docs/config/config#sqlite) in this project to keep things simple, but you can also use [Postgres](/docs/config/config#postgresql). The minimum config for SQLite looks like this:

```ts
import { config } from '@keystone-6/core'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: 'file:./keystone.db' }),
    }),
  },
  lists: {}, // ...
})
```

The adapter connects Keystone's runtime to the local `./keystone.db` database. The matching URL in `prisma.config.ts` is used by Prisma CLI commands.

{% hint kind="tip" %}
Keystone uses [Prisma](https://www.prisma.io/) for database access and development-time schema pushes. For production, manage migration files with the [Prisma CLI](/docs/guides/cli#working-with-migrations).
{% /hint %}

### Create your first List

Now that we have a database configured, let’s connect some content to it!

We’re going to build a simple blog with **users** and **posts**. Let’s start with the `User` list using [`text`](/docs/fields/text) fields for their `name` and `email`:

```js{3,11-18}[6-10]
import { config, list } from '@keystone-6/core';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { allowAll } from '@keystone-6/core/access';
import { text } from '@keystone-6/core/fields';

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: 'file:./keystone.db' }),
    }),
  },
  lists: {
    User: list({
      access: allowAll,
      fields: {
        name: text({ validation: { isRequired: true } }),
        email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      },
    }),
  },
});
```

**List** names are derived from the keys in the `lists` object.
For example, the `User` key becomes the name for the respective `User` list.
This key will be used in Admin UI for the list’s default display name, and in Keystone’s auto-generated GraphQL API.

**Field** names are derived from the keys in the [`fields`](/docs/fields/overview) object.
Like lists, they’ll be used in Admin UI for field label defaults, and in the GraphQL API. We've added validation to both our fields to say that they
are required, and declared that emails must be unique, so there can only be one user with each email.

{% hint kind="tip" %}
**Admin UI** is the name of Keystone’s user friendly editing environment. Accessible from a browser, it’s the place where we’ll add and update content that will be stored in the database.
{% /hint %}

## Run Keystone

We now have everything we need to start Keystone, so let’s do just that:

```bash
npx keystone dev
```

In a few seconds your terminal will provide you with you a link to the Keystone Admin UI at [http://localhost:3000](http://localhost:3000)

![Terminal dialog showing successful Keystone startup](https://keystonejs.s3.amazonaws.com/framework-assets/assets/walkthroughs/lesson-1/keystone-startup.png)

Head on over to [http://localhost:3000/users](http://localhost:3000/users) where you can create your first user with a `name` and `email`:

![Adding a user record in Keystone Admin UI](https://keystonejs.s3.amazonaws.com/framework-assets/assets/walkthroughs/lesson-1/first-user-creation.gif)

**Hurrah! You now have Keystone up and running** {% emoji symbol="🎉" alt="Party Popper" /%}

Next up, we’ll level-up our blog starter with a `post` list and connect it to our users.

## Next lesson

{% related-content %}
{% well
   heading="Lesson 2: Relating things"
   grad="grad1"
   href="/docs/walkthroughs/lesson-2"
   target="" %}
Connect two content types and learn how to configure the appearance of field inputs
{% /well %}
{% /related-content %}
