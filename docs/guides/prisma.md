<!--[meta]
section: guides
title: Using Keystone with Prisma
[meta]-->

# Using Keystone with Prisma

> **Warning:** The Prisma adapter uses Prisma Migrate, which is currently [considered experimental](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate). We do not recommend using the Prisma adapter for production systems yet.

In this guide we'll walk you through the steps to create a new project using Keystone and Prisma, automatically run a migration when changing your Keystone schema, and use the prisma client directly in a custom query.

## Create a new app

We'll start by creating a new Keystone application using `yarn create`. Run the following command and select `PostgreSQL` as your database type and the `Todo` application as your starter project.

```
yarn create keystone-app my-app
```

This will create a fresh project for you, which uses the `knex` database adapter. We're going to take this project and modify it to use the Prisma adapter.

> **Note:** In upcoming releases the Prisma adapter will be available as an option in `create-keystone-app`.

Next, go into your new project directory and install the Prisma adapter package.

```
cd my-app
yarn add @keystonejs/adapter-prisma
```

You can now open up `index.js` and edit it to use the `PrismaAdapter` rather than the `KnexAdapter`. Make the following changes:

```diff
-const { KnexAdapter: Adapter } = require('@keystonejs/adapter-knex');
+const { PrismaAdapter: Adapter } = require('@keystonejs/adapter-prisma');
```

and

```diff
-const adapterConfig = { knexOptions: { connection: 'postgres://***:***@localhost:5432/***' } };
+const adapterConfig = { url: 'postgres://***:***@localhost:5432/***' };
```

Your project is now ready to run! Run the following command, and Keystone will start your project

```
DATABASE_URL=postgres://***:***@localhost:5432/*** yarn dev
```

> **Note:** You currently need to provide `DATABASE_URL` as an environment variable due to an [issue](https://github.com/prisma/prisma/issues/3750) in Prisma.

When prisma connects to your database it will generate a Prisma schema and then generate and run a migration to set up your database with all the required tables.

## Changing your schema

During development you will want to be regularly making changes to your Keystone schema as your data model evolves.
Add a new field to your current list:

```diff
-const { Text } = require('@keystonejs/fields');
- ...
-  fields: {
-    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
-  },
+const { Text, Checkbox } = require('@keystonejs/fields');
+...
+  fields: {
+    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
+    isComplete: { type: Checkbox },
+  },
```

Now, when you restart your server by running `yarn dev` again, Keystone will generate a new Prisma schema for your system. Prisma will compare this to your current database and will generate and run a migration to update your database to have a column for your new field.

> **Note:** The current adapter behaviour only support this auto-migration behaviour. Future releases will provide more flexible controls for running migrations.

## Using the Prisma client

Keystone provides a library called [`server-side-graphql-client`](/docs/discussions/server-side-graphql.md) which allows you to execute graphQL queries from within hooks, access control, and custom mutations. These graphQL queries come with all the benefits of Keystone's access control, hooks, and validation. In some circumstances you might want to bypass all of these features and talk directly to your database. The Prisma adapter makes this easy.

Add the following code to your `index.js` file to create a custom query which tells you whether all your todo items are complete.

```javascript
keystone.extendGraphQLSchema({
  queries: [
    {
      schema: 'allComplete: Boolean',
      resolver: async () => {
        const { prisma } = keystone.adapters.PrismaAdapter;
        const unfinished = await prisma.todo.count({ where: { isComplete: { equals: false } } });
        return unfinished === 0;
      },
    },
  ],
});
```

This query is using the `PrismaClient` object stored at `keystone.adapters.PrismaAdapter.prisma` to directly run this query against the database.
For more information on the Prisma client API please consult the [Prisma docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).

> **Tip:** For full details on how to use up the Prisma Adapter, see the [Prisma Adapter API Docs](/packages/adapter-prisma/README.md)
