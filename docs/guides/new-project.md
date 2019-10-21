<!--[meta]
section: guides
title: Creating a New KeystoneJS Project
subSection: setup
order: 1
[meta]-->

# Creating a New KeystoneJS Project

In this guide we will learn how to manually create and run a new KeystoneJS project.

## Initialization and basic packages

First things first. Create a directory for your future project and init npm package there.

```
mkdir new-project
cd new-project
yarn init
```

Let's start from minimal setup. We will need two packages here:
`@keystone-alpha/keystone` which is KeystoneJS' core and `@keystone-alpha/adapter-mongoose` which allows our app to connect to MongoDB.

Do

```
yarn add @keystone-alpha/keystone @keystone-alpha/adapter-mongoose
```

## First steps in coding

After installation we can start to write our code. Main entry point of KeystoneJS app is `index.js` file placed in root folder. Create it and type following:

```javascript
// import necessary modules
const { Keystone } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');

// create an instance of Keystone app
const keystone = new Keystone({
  name: 'New Project',
  adapter: new MongooseAdapter(),
});
```

You can specify any suitable name for your application. Note that we created an instance of Mongoose adapter and passed it to KeystoneJS' constructor.

Now we can export our instance and make it available for running. Add following to the end of `index.js`:

```javascript
module.exports = {
  keystone,
};
```

That's it. But now our app does nothing, just starting and connecting to database. If you run application now it will display something like that:

```
TypeError: Router.use() requires a middleware function
```

Let's create some routes! For this we will use another powerful KeystoneJS' feature - GraphQL explorer UI.

## Setting up GraphQL interface

As in previous step install necessary package.

```
yarn add @keystone-alpha/app-graphql
```

Import it.

```javascript
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
```

And create instance.

```javascript
module.exports = {
  keystone,
  apps: [new GraphQLApp()],
};
```

In order to be able to start an app we need to add at least one List. List is a model that is compatible with KeystoneJS' admin UI.

## Adding first List

In `index.js` add following before `module.exports`:

```
keystone.createList('Todos', {
  fields: {
    name: { type: Text },
  }
});
```

This code snippet creates a List named 'Todos'. Second argument is a config object.
For now it have only one key - `fields` which is used to attach schema for newly created model.
That means that we want our Todos item to have only one field - `name` and it should be of type `Text`. To specify type we need to import it:

```
yarn add @keystone-alpha/fields
```

and

```javascript
const { Text } = require('@keystone-alpha/fields');
```

That's it.

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

Now it's the time to check those routes in browser to ensure that everything works as expected. And then proceed to second step - [Adding Lists](https://v5.keystonejs.com/guides/add-lists)
