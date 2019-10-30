<!--[meta]
section: guides
title: Creating a New KeystoneJS Project
subSection: setup
order: 1
[meta]-->

# Creating a New KeystoneJS Project

In this guide we will learn how to manually create and run a new KeystoneJS project.

## Initialization and basic packages

First things first. Create a directory for your future project and initialize it:

```
mkdir new-project
cd new-project
yarn init
```

Let's start with minimal setup. We will need two packages here:
`@keystonejs/keystone` which is KeystoneJS' core and `@keystonejs/adapter-mongoose` which allows our app to connect to MongoDB.

Do

```
yarn add @keystonejs/keystone @keystonejs/adapter-mongoose
```

## First Steps

After installation we can start coding. Main entry point of a KeystoneJS app is the `index.js` file in the root folder. Create it and add the following:

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

You can specify any suitable name for your application. Note that we created an instance of the [Mongoose Adapter](/keystonejs/adapter-mongoose/) and passed it to KeystoneJS' constructor.

Now we can export our instance and make it available for running. Add following to the end of `index.js`:

```javascript
module.exports = {
  keystone,
};
```

That's it. But now our app does nothing, just starting and connecting to database. If you run application now it will display something like this:

```
TypeError: Router.use() requires a middleware function
```

Let's create some routes! For this we will enable a powerful KeystoneJS feature - the GraphQL explorer UI.

## Setting up the GraphQL Interface

As in the previous step install necessary the package.

```
yarn add @keystonejs/app-graphql
```

Import it...

```javascript
const { GraphQLApp } = require('@keystonejs/app-graphql');
```

And add a new array export named `apps` with a new instance of `GraphQLApp`, like so.

```javascript
module.exports = {
  keystone,
  apps: [new GraphQLApp()],
};
```

In order to be able to start an app we need to add at least one List. A List is a model that is compatible with KeystoneJS' admin UI.

## Adding first List

In `index.js` add following before `module.exports`:

```
keystone.createList('Todo', {
  fields: {
    name: { type: Text },
  }
});
```

This code snippet creates a List named 'Todos'. The second argument is a config object. For now it have only one key (`fields`) which is used to define the schema for newly created model.

In our example, the `Todo` list has a single field called `name` of type `Text`. Note the type is _not_ a string; it must be imported like so:

```
yarn add @keystonejs/fields
```

and

```javascript
const { Text } = require('@keystonejs/fields');
```

That's it!

## Starting application

Add following to `package.json`:

```json
"scripts": {
	"start:dev": "keystone"
}
```

Now ensure that `mongod` is running and execute our start script:

```
yarn start:dev
```

You should see something like this

```
✔ Keystone instance is ready 🚀
🔗 GraphQL Playground:   http://localhost:3000/admin/graphiql
🔗 GraphQL API:          http://localhost:3000/admin/api
```

Now it's the time to check those routes in browser to ensure that everything works as expected. Then proceed to second step - [Adding Lists](/guides/add-lists)
