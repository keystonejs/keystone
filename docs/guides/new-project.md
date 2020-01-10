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

Let's start with the minimal setup. We will need two packages here:
`@keystonejs/keystone` which is KeystoneJS' core and `@keystonejs/adapter-mongoose` which allows our app to connect to MongoDB.

Do

```
yarn add @keystonejs/keystone @keystonejs/adapter-mongoose
```

## First Steps

After installation we can start coding. The main entry point of a KeystoneJS app is the `index.js` file in the root folder. Create it and add the following:

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

You can specify any suitable name for your application. Note that we created an instance of the [Mongoose Adapter](/packages/adapter-mongoose/README.md) and passed it to KeystoneJS' constructor.

Now we can export our instance and make it available to run. Add the following to the end of `index.js`:

```javascript
module.exports = {
  keystone,
};
```

That's it. But now our app does nothing, it is able to start and connect to a database.

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

In order to be able to start an app we need to add at least one List. A List is a model that is compatible with KeystoneJS' admin UI.

## Adding first List

To type the fields of the list, a package has to be installed:

```
yarn add @keystonejs/fields
```

In this example the type `Text` is used, require this in index.js:

```javascript
const { Text } = require('@keystonejs/fields');
```

In `index.js` add the following above `module.exports` and below `const keystone = new Keystone({...`:

```
keystone.createList('Todo', {
  fields: {
    name: { type: Text },
  }
});
```

This code snippet creates a List named 'Todos'. The second argument is a config object. For now it has only one key (`fields`) which is used to define the schema for the newly created model.

In our example, the `Todo` list has a single field called `name` of type `Text`. Note the type is _not_ a string, it is a type that has been imported through the package `@keystonejs/fields`.

That's it!

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

Now it's time to check those routes in browser to ensure that everything works as expected. Then proceed to second step - [Adding Lists](/docs/guides/add-lists.md)
