# Quick Start

This quick start guide will get you up and running with a fresh new Keystone application in just a few easy commands.

To create a new KeystoneJS application, run the following commands.

```sh
yarn create keystone-app my-app
cd my-app
yarn start
```

If you see _error_, then make sure you have `mongodb` installed and running.

Congratulation, you are now running your very own Keystone application!
To visit your running application (a simple todo list), visit

<pre>
<a href="http://localhost:3000">http://localhost:3000</a>
</pre>

Your application also has an admin UI, which lets you directly manipulate the data in your database.

<pre>
<a href="http://localhost:3000/admin/">http://localhost:3000/admin</a>
</pre>

The [Admin UI Tutorial](../tutorials/admin-ui.md) will walk you through the functionality provided by the Admin UI.

Both your application and the admin UI are being powered by a GraphQL API.
Keystone provides a web interface for this API at

<pre>
<a href="http://localhost:3000/admin/graphiql">http://localhost:3000/admin/graphiql</a>
</pre>

The [Introduction To GraphQL](../tutorials/intro-to-graphql.md) tutorial will guide you through the basics of using GraphQL to interact with your Keystone system.

## Installing `mongodb`

### OSX

```sh
brew install mongodb
brew services start mongodb
```

### Linux

```sh
FIXME (apt-get install mongo or something?)
```
