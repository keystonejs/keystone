<!--[meta]
section: tutorials
title: Creating a New Project
order: 1
[meta]-->

# Creating a New Project

In this guide we will learn how to manually create and run a new KeystoneJS project.

## Preparing your database

Before running a Keystone application you need to ensure you have a database set up.
This tutorial requires you to have a MongoDB database setup.
Follow the [database setup instructions](/docs/quick-start/adapters.md) here to ensure your database is ready to go.

## Initialisation and basic packages

First things first. Create a directory for your project and initialise it:

```
mkdir new-project
cd new-project
yarn init
```

Let's start with the minimal setup. We will need two packages here:
`@keystonejs/keystone`, which is the core of Keystone, and `@keystonejs/adapter-mongoose`, which allows our app to connect to MongoDB.

Run

```
yarn add @keystonejs/keystone @keystonejs/adapter-mongoose
```

## First Steps

After installation we can start coding. The main entry point of a Keystone app is the `index.js` file in the root folder. Create it and add the following:

```javascript
// import necessary modules
const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

// create an instance of Keystone app
const keystone = new Keystone({
  name: 'New Project',
  adapter: new MongooseAdapter(),
});
```

You can specify any suitable name for your project. Note that we created an instance of the [Mongoose adapter](/packages/adapter-mongoose/README.md) and passed it to `Keystone`'s constructor.

Now we can export our `Keystone` instance and make it available to run. Add the following to the end of `index.js`:

```javascript
module.exports = {
  keystone,
};
```

That's it. Although our app does nothing interesting, it _is_ able to start and connect to a database.

<!-- FIXME:TL How exactly does this happen? How do we know? -->

## Setting up the GraphQL Interface

As in the previous step, install the necessary package.

```
yarn add @keystonejs/app-graphql
```

Import it in index.js:

```javascript
const { GraphQLApp } = require('@keystonejs/app-graphql');
```

And add a new array export named `apps` with a new instance of `GraphQLApp`, like so:

```javascript
module.exports = {
  keystone,
  apps: [new GraphQLApp()],
};
```

In order to be able to start an app we need to add at least one `List`.
A `List` is a model that is compatible with Keystone's Admin UI.

## Adding the first List

To add fields to a list, a package has to be installed:

```
yarn add @keystonejs/fields
```

In this example the field type `Text` is used, which must be `required` in `index.js`:

```javascript
const { Text } = require('@keystonejs/fields');
```

In `index.js` add the following above `module.exports` and below `const keystone = new Keystone({ ... });`:

```
keystone.createList('Todo', {
  fields: {
    name: { type: Text },
  }
});
```

This code snippet creates a List named `Todo`. The second argument is a config object. For now it has only one key (`fields`) which is used to define the schema for the newly created model.

In our example, the `Todo` list has a single field called `name` of type `Text`.

## Starting the application

Add the following to `package.json`:

```json
"scripts": {
	"start:dev": "keystone"
}
```

Now ensure that `mongod` is running and execute the start script:

```
yarn start:dev
```

You should see something like this:

```
✔ Keystone instance is ready 🚀
🔗 GraphQL Playground:   http://localhost:3000/admin/graphiql
🔗 GraphQL API:          http://localhost:3000/admin/api
```

Now it's time to check those routes in browser to ensure that everything works as expected.

## Summary

Congratulations, you have just set up your very first Keystone application.
You now have a GraphQL API and a GraphQL Playground which you start interacting with.
In future tutorials we will show you how to execute queries and mutations with this API, and launch a browser based Admin UI to explore and interact with your data.
