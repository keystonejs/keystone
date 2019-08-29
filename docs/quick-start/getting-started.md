<!--[meta]
section: quick-start
title: Getting Started
order: 1
slug: /quick-start/
[meta]-->

# Getting Started

## Welcome

This quick start guide will get you up and running with a fresh new KeystoneJS application in just a few easy minutes.

With just 5 minutes, this is what you're going to build:

![Screenshot of KeystoneJS Todo App](./img/to-do-app-example.png)

## Requirements

Please make sure your computer/server meets the following requirements:

- [Node.js](https://nodejs.org/) >= 10.x: Node.js is a server platform which runs JavaScript.

And, ONE of the following:

- [MongoDB](https://www.mongodb.com/) >= 4.x: MongoDB is a powerful document store.
- [Postgres](https://www.postgresql.org) >= 9.x: PostgreSQL is an open source relational database that uses the SQL language.

## Installation

To create a new KeystoneJS application, ensure [your database is configured and running](../quick-start/database.md), then run the following commands.

```sh
npm init keystone-app my-app
```

or with yarn:

```sh
yarn create keystone-app my-app
```

Enter the name of your project and follow the prompts. Be sure to select the "ToDo" application if you wish to follow this guide.

```sh
cd my-app
npm run dev
```

Congratulations, you are now running your very own KeystoneJS application!
To visit the running application (a simple todo list), visit

<pre>
	<code>
		<a href="http://localhost:3000">http://localhost:3000</a>
	</code>
</pre>

Your application also has an Admin UI, which lets you directly manipulate the data in your database

<pre>
	<code>
		<a href="http://localhost:3000/admin/">http://localhost:3000/admin</a>
	</code>
</pre>

Both your application and the admin UI are powered by a GraphQL API.
KeystoneJS provides a web interface for this API at

<pre>
	<code>
		<a href="http://localhost:3000/admin/graphiql">http://localhost:3000/admin/graphiql</a>
	</code>
</pre>

## Up Next

- [Schema - Lists & Fields](../guides/schema.md)
- [Using the KeystoneJS Admin UI](../tutorials/admin-ui.md)
- [Introduction To KeystoneJS's GraphQL API](../tutorials/intro-to-graphql.md)
