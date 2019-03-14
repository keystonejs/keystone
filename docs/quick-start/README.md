# Quick Start

## Welcome

This quick start guide will get you up and running with a fresh new Keystone application in just a few easy commands.

## Requirements

Please make sure your computer/server meets the following requirements:

- [Node.js](https://nodejs.org/) >= 10.x: Node.js is a server platform which runs JavaScript.
- The database of your choice:
  - [MongoDB](https://www.mongodb.com/) >= 3.x: MongoDB is a powerful document store.
  - [MySQL](https://www.mysql.com/) >= 5.6: MySQL is an open-source relational database management system.
  - [PostgreSQL](https://www.postgresql.org/) >= 10: PostgreSQL is an open-source object-relational database management system.

## Installation

To create a new KeystoneJS application, run the following commands.

```sh
yarn create keystone-app my-app
cd my-app
yarn start
```

If you see an error, please make sure that you have [MongoDB installed](/quick-start/mongodb) and running.

Congratulation, you are now running your very own Keystone application!
To visit your running application (a simple todo list), visit

<pre>
	<code>
		<a href="http://localhost:3000">http://localhost:3000</a>
	</code>
</pre>

Your application also has an admin UI, which lets you directly manipulate the data in your database.

<pre>
	<code>
		<a href="http://localhost:3000/admin/">http://localhost:3000/admin</a>
	</code>
</pre>

The [Admin UI Tutorial](../tutorials/admin-ui.md) will walk you through the functionality provided by the Admin UI.

Both your application and the admin UI are being powered by a GraphQL API.
Keystone provides a web interface for this API at

<pre>
	<code>
		<a href="http://localhost:3000/admin/graphiql">http://localhost:3000/admin/graphiql</a>
	</code>
</pre>

The [Introduction To GraphQL](../tutorials/intro-to-graphql.md) tutorial will guide you through the basics of using GraphQL to interact with your Keystone system.
