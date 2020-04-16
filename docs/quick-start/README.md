<!--[meta]
section: quick-start
title: Getting started
order: 1
slug: /quick-start/
[meta]-->

# Getting started

Welcome to KeystoneJS!
This quick start guide will get you up and running in just a few minutes.
Let's build a simple Todo app with a fresh install of Keystone!

## Requirements

Before we start, make sure that you have a basic development environment set up, with the following tools installed on your system.

- [Node.js](https://nodejs.org/) >= 10.x: Node.js is a server platform which runs JavaScript.
- [yarn](https://yarnpkg.com/) or [npm](https://docs.npmjs.com/cli/npm): yarn and npm are different package managers which can be used to install Keystone.

```shell allowCopy=false showLanguage=false
$ node --version
v12.11.0
$ npm --version
6.9.0
$ yarn --version
1.17.3
```

## Database Setup

You will also need to have a database for Keystone to store your application data in.
You can use either `MongoDB` or `PostgreSQL`.

- [MongoDB](https://www.mongodb.com/) >= 4.x: MongoDB is a powerful NoSQL document storage database.
- [PostgreSQL](https://www.postgresql.org) >= 9.x: PostgreSQL is an open source relational database that uses the SQL language.

Follow the [database setup](/docs/quick-start/adapters.md) instructions to install and configure your database, and to find out what your `connection string` is.

> **Important:** You will need to make sure you have a valid `connection string` for your database in order to set up Keystone.

## Installing Keystone

To create a new Keystone application, run the following command in your terminal:

```shell allowCopy=false showLanguage=false
npm init keystone-app my-app
# or
yarn create keystone-app my-app
```

You'll be prompted with a few questions:

1. **What is your project name?** Pick any name for your project. You can change it later if you like.
2. **Select a starter project.** These are some preconfigured projects you can use as the base of your own application. Select the `Todo` application if you wish to follow the rest of the Keystone tutorials.
3. **Select a database type.** Choose between `MongoDB` and `PostgreSQL`.
4. **Where is your database located?** Provide the `connection string` for your database.
5. **Test your database connection.** Test that Keystone can connect to your database.

Once you have answered these questions, Keystone will be installed in a project directory.
This will take a few minutes, as there are a number of dependencies which need to be downloaded and installed.

Once your project has been set up you should move into its directory so that you can start using it

```shell allowCopy=false showLanguage=false
cd my-app
```

If you are using `PostgreSQL` then you will need to create the tables in your database for Keystone to use.

```
yarn create-tables
# or
npm run create-tables
```

You can now start your development server with the following command:

```
yarn dev
# or
npm run dev
```

### Troubleshooting

If you run into database related errors at this stage, follow the [Database Setup and Adapters](/docs/quick-start/adapters.md) instructions.

## Summary

You are now running your very own Keystone application! Here's what you get out of the box:

### Application

Your simple todo application is up and running:

- <http://localhost:3000>

### Admin UI

Your application also has an Admin UI, which lets you directly manipulate the data in your database:

- <http://localhost:3000/admin>

### GraphQL API

Both your application and the Admin UI are powered by a GraphQL API.
Keystone provides a web interface for this API at this URL:

- <http://localhost:3000/admin/graphiql>

## Next steps

This todo app is a good introduction to Keystone, but chances are you'll want to build something a bit more complex and secure than that!

<!-- FIXME:TL Next step should be tutorials, not guides. -->

The [guides section](/docs/guides/apps.md) is a great next step.
It will walk you through concepts like [creating lists](/docs/tutorials/add-lists.md),
setting up [content relationships](/docs/tutorials/relationships.md),
managing [access control](/docs/guides/access-control.md) and much more.
