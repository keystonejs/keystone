<!--[meta]
section: quick-start
title: Getting started
order: 1
slug: /quick-start/
[meta]-->

# Getting started

This quick start guide will get you up and running in just a few minutes. Let's build a simple todo app with a fresh install of Keystone!

## Requirements

Before we start, check that your computer meets the following requirements:

- [Node.js](https://nodejs.org/) >= 10.x: Node.js is a server platform which runs JavaScript.

And ONE of the following databases:

- [MongoDB](https://www.mongodb.com/) >= 4.x: MongoDB is a powerful NoSQL document storage database.
- [PostgreSQL](https://www.postgresql.org) >= 9.x: PostgreSQL is an open source relational database that uses the SQL language.

Finally, make sure [your database is configured and running](/docs/quick-start/adapters.md).

All set? Great, let's get started!

## Installation

To create a new Keystone application, run the following commands in your terminal:

```shell allowCopy=false showLanguage=false
npm init keystone-app my-app
# or
yarn create keystone-app my-app
```

You'll be prompted with a few questions:

1. **What is your project name?** Pick any name for your project. You can change it later if you like.
2. **Select a starter project.** Select the `Todo` application if you wish to follow this guide.
3. **Select an adapter.** Choose `Mongoose` if you're running a MongoDB database and `Knex` if you're running a PostgreSQL one.

Wait until all the project dependencies are installed, then run:

```shell allowCopy=false showLanguage=false
cd my-app   # This changes directory
npm run dev # This starts the development server
```

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

The [guides section](/docs/guides/index.md) is a great next step.
It will walk you through concepts like [creating lists](/docs/tutorials/add-lists.md),
setting up [content relationships](/docs/tutorials/relationships.md),
managing [access control](/docs/guides/access-control.md) and much more.
