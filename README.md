# KeystoneJS

[![CircleCI](https://circleci.com/gh/keystonejs/keystone-5.svg?style=shield&circle-token=6b4c9e250b2b61403b64c9b66ab7f4de6b0b4dde)](https://circleci.com/gh/keystonejs/keystone-5)

Welcome to Keystone 5, the development project for the future of KeystoneJS.

`schema => ({ GraphQL, AdminUI })`

KeystoneJS is a scalable platform and CMS for Node.js applications.

Keystone 5 introduces first-class GraphQL support, a new extensible architecture, and an improved Admin UI.

It is currently in alpha and under intensive development by [Thinkmill](https://www.thinkmill.com.au) and contributors around the world.

## What's new?

Keystone 5 is a complete re-imagining of KeystoneJS for the future. It builds on the lessons we learned over the last 5 years of the Keystone's history and focuses on the things we believe are the most powerful features for modern web and mobile applications.

This means less focus on hand-holding Node.js template-driven websites and more focus on flexible architecture, a powerful GraphQL API with deep access control features, an extensible Admin UI and plugins for rich field types, file and database adapters, and session management.

We believe it's the ideal back-end for rich React / Vue / Angular applications, Gatsby and Next.js websites, Mobile applications and more. It also makes a great Headless CMS.

🚨🚨🚨

This project is currently very much in the **alpha** phase of development. There are known bugs, missing features, and limited documentation. APIs have not been finalised and may change with each release.

To make this clear, we're currently publishing all packages to the `@keystone-alpha` scope on npm.

🚨🚨🚨

## Getting Started

### Quick start

To get up and running with a basic project template, run the following commands.

```bash
yarn create keystone-app my-app
cd my-app
yarn dev
```

For more details and system requirements, check out the [5 Minute Quick Start
Guide](https://v5.keystonejs.com/quick-start/).

### Demo Projects

These projects are designed to show off different aspects of KeystoneJS features
at a range of complexities (from a simple Todo App to a complex Meetup Site).

See the [`demo-projects/README.md`](./demo-projects/README.md) docs to get
started.

### Manual Setup

```bash
yarn add @keystone-alpha/keystone @keystone-alpha/fields @keystone-alpha/adapter-mongoose @keystone-alpha/app-graphql @keystone-alpha/app-admin-ui
```

Add a script to your `package.json`:

```json
{
  "scripts": {
    "dev": "keystone"
  }
}
```

Create a file `index.js`:

<!-- prettier-ignore -->

```javascript
const { Keystone }        = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { Text }            = require('@keystone-alpha/fields');
const { GraphQLApp }      = require('@keystone-alpha/app-graphql');
const { AdminUIApp }      = require('@keystone-alpha/app-admin-ui');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
  fields: {
    name: { type: Text },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    // Setup the optional Admin UI
    new AdminUIApp(),
  ],
};
```

Now you have everything you need to run a Keystone instance:

```bash
yarn dev
```

Keystone will automatically detect your `index.js` and start the server for you:

- `http://localhost:3000/admin`: Keystone Admin UI
- `http://localhost:3000/admin/api`: generated GraphQL API
- `http://localhost:3000/admin/graphiql`: GraphQL Playground UI

### Custom Server

In some circumstances, you may want to do custom processing, or add extra routes
the server which handles the API requests.

A custom server is defined in `server.js` which will act as the entry point to
your application (in combination with `index.js` which defines your schema) and
must handle executing the different parts of Keystone.

Create the `server.js` file:

<!-- prettier-ignore -->

```javascript
const express = require('express');
const { keystone, apps } = require('./index');

keystone.prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(({ middlewares }) => {
    keystone.connect();
    const app = express();
    app.get('/', (req, res) => {
      res.end('Hello world');
    });
    app.use(middlewares);
    app.listen(3000);
  })
  .catch(error => {
    console.error(error);
  });
```

You'll need to change the `dev` script in your `package.json` to run the server file with node like this.

```diff
- "dev": "keystone"
+ "dev": "NODE_ENV=development node server.js"
```

_Note that when using a custom server, you will no longer get the formatted
console output when starting a server._

For more, see the [Custom Server
Discussion](https://v5.keystonejs.com/discussions/custom-server).

### Production Build

When getting ready to deploy your app to production, there are performance
optimisations which Keystone can prepare for you.

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "keystone build",
    "start": "keystone start"
  }
}
```

Run `yarn build` to generate the following outputs(this output could change in the future):

```
.
└── dist/
    └── admin/
```

To run your keystone instance, run the start script.

```
yarn start
```

#### Production Build Artifacts

<!--
##### `dist/index.js`

An all-in-one server which will start your Keystone API and Admin UI running on
the same port.

_NOTE: If you've setup a [custom server](#custom-server), `dist/index.js` will
be a copy of your `server.js`_

##### `dist/api/`

The GraphQL API code lives here. This is a combination of your code setting up
the keystone instance, and a server to run the API.

This folder contains an `index.js` file which when run via node
(`node dist/api/index.js`) will serve the API. In this manner, it is possible to
deploy the API independently of the [admin UI](#distadmin) by deploying the
contents of the `dist/api/` folder only. -->

##### `dist/admin/`

A static export of the Admin UI lives here. Built from your code setting up the
keystone instance, this export contains _list_ and _field_ config information
tightly coupled to the API.

<!-- commented out for now because you currently have to deploy them at the same time right now: It is therefore recommended to always deploy the Admin UI at the same time as deploying the API to avoid any inconsistencies. -->

### Adding Authentication

_See [Authentication docs](https://v5.keystonejs.com/discussions/authentication)._

To setup authentication, you must instantiate an _Auth Strategy_, and create a
list used for authentication in `index.js`:

<!-- prettier-ignore -->

```javascript
const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { Text, Password }  = require('@keystone-alpha/fields');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');

const keystone = new Keystone({
  name: 'Keystone With Auth',
  adapter: new MongooseAdapter(),
});

keystone.createList('User', {
  fields: {
    username: { type: Text },
    password: { type: Password },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'username', // default: 'email'
    secretField: 'password',   // default: 'password'
  }
});

module.exports = {
  keystone,
  apps: [
    new AdminUIApp({ adminPath: '/admin', authStrategy })
  ],
};
```

_NOTE: It will be impossible to login the first time you load the Admin UI as
there are no Users created. It is recommended to first run an instance of
Keystone **without** an auth strategy, create your first User, then re-enable
the auth strategy._

## Developing

All source code should be formatted with [Prettier](https://github.com/prettier/prettier).
Code is not automatically formatted in commit hooks to avoid unexpected behaviour,
so we recommended using an editor plugin to format your code as you work.
You can also run `bolt format` to prettier all the things.
The `lint` script will validate source code with both ESLint and prettier.

### Setup

Keystone 5 is set up as a monorepo, using [Bolt](http://boltpkg.com).

First, clone the Keystone 5 repository

```
git clone https://github.com/keystonejs/keystone-5.git
```

Then make sure you've got Bolt installed:

```sh
yarn global add bolt
```

Also make sure you have a local MongoDB server running
([instructions](https://docs.mongodb.com/manual/installation/)).
If you don't have it installed, on MacOS use Homebrew (run these once):

```sh
brew install mongodb
brew services start mongodb
```

Then install the dependencies and start the test project:

```sh
bolt
bolt dev
```

See [`demo-projects/README.md`](./demo-projects/README.md) for more details on
the available demo projects.

### Testing

Keystone uses [Jest](https://facebook.github.io/jest) for unit tests and [Cypress](https://www.cypress.io) for end-to-end tests.
All tests can be run locally and on [CircleCI](https://circleci.com/gh/keystonejs/keystone-5).

### Unit Tests

To run the unit tests, run the script:

```sh
bolt jest
```

Unit tests for each package can be found in `packages/<package>/tests` and following the naming pattern `<module>.test.js`.
To see test coverage of the files touched by the unit tests, run:

```sh
bolt jest --coverage
```

To see test coverage of the entire monorepo, including files which have zero test coverage, use the special script:

```sh
bolt coverage
```

### End-to-End Tests

Keystone tests end-to-end functionality with the help of [Cypress](https://www.cypress.io).
Each project (ie; `test-projects/basic`, `test-projects/login`, etc) have their own set of Cypress tests.
To run an individual project's tests, `cd` into that directory and run:

```sh
bolt cypress:run
```

Cypress can be run in interactive mode from project directories with its built in GUI,
which is useful when developing and debugging tests:

```sh
cd test-projects/basic && bolt cypress:open
```

End-to-end tests live in `project/**/cypress/integration/*spec.js`.
It is possible to run all cypress tests at once from the monorepo root with the command:

```sh
bolt cypress:run
```

_NOTE: The output from this command will mix together the output from each project being tested in parallel._
_This is only recommended as sanity check before pushing code._

### Running a CI environment locally

#### Setting up CircleCI CLI tool

Install the `circleci` cli tool:

**If you've already got [Docker For Mac](https://docs.docker.com/docker-for-mac/install) installed (recommended)**

```bash
brew install --ignore-dependencies circleci
```

**If you do not have Docker installed**

```bash
brew install circleci
```

Then make sure docker is [able to share](https://docs.docker.com/docker-for-mac/osxfs/#namespaces) the following directories (in Docker for Mac, go `Preferences` > `File Sharing`):

- The keystone 5 repo
- `/Users/<your username>/.circleci`

#### Run CI tests locally

Make sure Docker is running.

Execute the tests:

```bash
# Clean up the node_modules folders so everything is installed fresh
yarn clean

# Run the circle CI job
circleci local execute --job simple_tests
```

Where `simple_tests` can be replaced with any job listed in
[`.circleci/config.yml`](./.circleci/config.yml) under the `jobs:` section.

## Code of Conduct

KeystoneJS adheres to the [Contributor Covenant Code of Conduct](code-of-conduct.md).

## License

Copyright (c) 2019 Jed Watson. Licensed under the MIT License.
