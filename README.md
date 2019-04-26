# KeystoneJS

[![CircleCI](https://circleci.com/gh/keystonejs/keystone-5.svg?style=shield&circle-token=6b4c9e250b2b61403b64c9b66ab7f4de6b0b4dde)](https://circleci.com/gh/keystonejs/keystone-5)

Welcome to Keystone 5, the development project for the future of KeystoneJS.

`schema => ({ GraphQL, AdminUI })`

KeystoneJS is a scalable platform and CMS for Node.js applications.

Keystone 5 introduces first-class GraphQL support, a new extensible architecture, and an improved Admin UI.

It is currently in alpha and under intensive development by [Thinkmill](https://www.thinkmill.com.au) and contributors around the world.

### What's new?

Keystone 5 is a complete re-imagining of KeystoneJS for the future. It builds on the lessons we learned over the last 5 years of the Keystone's history and focuses on the things we believe are the most powerful features for modern web and mobile applications.

This means less focus on hand-holding Node.js template-driven websites and more focus on flexible architecture, a powerful GraphQL API with deep access control features, an extensible Admin UI and plugins for rich field types, file and database adapters, and session management.

We believe it's the ideal back-end for rich React / Vue / Angular applications, Gatsby and Next.js websites, Mobile applications and more. It also makes a great Headless CMS.

## WARNING

This project is currently very much in the **alpha** phase of development. There are known bugs, missing features, and limited documentation. APIs have not been finalised and may change with each release.

To make this clear, we're currently publishing all packages to the `@keystone-alpha` scope on npm.

## Getting Started

If you're interested in checking out our progress, the simplest way to do so is to clone this repo and run one of the demo projects.

_NOTE: You must have a [working version of `mongo`
installed](https://docs.mongodb.com/manual/installation/#mongodb-community-edition)._

### Demo Projects

First, you'll need Bolt installed:

```bash
yarn global add bolt
```

You'll also need MongoDB installed. If you need help check out our [MongoDB Guide](https://v5.keystonejs.com/quick-start/mongodb)

Then clone this repo and use Bolt to install the dependencies:

```bash
git clone https://github.com/keystonejs/keystone-5.git
cd keystone-5
bolt
```

Finally, run the build and start a project:

```bash
yarn build
yarn start
```

There are currently two projects available: `todo` and `blog`. You can specify the project you want to start:

```bash
yarn start blog
```

### Quick start

To get up and running with a basic project template, run the following commands.

```bash
yarn create keystone-app my-app
cd my-app
yarn start
```

### Setup

```
npm install --save @keystone-alpha/keystone @keystone-alpha/fields @keystone-alpha/adapter-mongoose @keystone-alpha/admin-ui
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
const { AdminUI }         = require('@keystone-alpha/admin-ui');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { Text }            = require('@keystone-alpha/fields');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
  fields: {
    name: { type: Text },
  },
});

// Setup the optional Admin UI
const admin = new AdminUI(keystone);

module.exports = {
  keystone,
  admin,
};
```

Now you have everything you need to run a Keystone instance:

```bash
npm run dev
```

Keystone will automatically detect your `index.js` and start the server for you:

- `http://localhost:3000/admin`: Keystone Admin UI
- `http://localhost:3000/admin/api`: generated GraphQL API
- `http://localhost:3000/admin/graphiql`: GraphQL Playground UI

#### Server Configuration

Extra config can be set with the `serverConfig` export in `index.js`:

```javascript
// ...
module.exports = {
  keystone,
  admin,
  serverConfig: {
    cookieSecret: 'qwerty',
    apiPath: '/admin/api',
    graphiqlPath: '/admin/graphiql',
  },
};
// TODO: Document _all_ the options
```

### Custom Server

In some circumstances, you may want to do custom processing, or add extra routes
the server which handles the API requests.

A custom server is defined in `server.js` which will act as the entry point to
your application (in combination with `index.js` which defines your schema) and
must handle executing the different parts of Keystone.

Create the `server.js` file:

<!-- prettier-ignore -->

```javascript
const keystoneServer = require('@keystone-alpha/core');

keystoneServer.prepare({ port: 3000 })
  .then(({ server, keystone }) => {
    server.app.get('/', (req, res) => {
      res.end('Hello world');
    });
    return server.start();
  })
  .catch(error => {
    console.error(error);
  });
```

Run keystone as you normally would:

```
npm run dev
```

#### Custom Server Configuration

When using a custom server, you should pass the `serverConfig` object to the
`prepare()` method:

```javascript
keystone.prepare({
  serverConfig: {
    /* ... */
  },
});
```

For available options, see [Server Configuration](#server-configuration).

### Production Build

When getting ready to deploy your app to production, there are performance
optimisations which Keystone can prepare for you.

Add this script to your `package.json`:

```json
{
  "scripts": {
    "build": "keystone build"
  }
}
```

Run `npm run build` to generate the following outputs:

```
.
└── dist/
    ├── api/
    ├── admin/
    └── index.js
```

To run your keystone instance, execute the `index.js` file:

```
cd dist
node index.js
```

#### Production Build Artifacts

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
contents of the `dist/api/` folder only.

##### `dist/admin/`

A static export of the Admin UI lives here. Built from your code setting up the
keystone instance, this export contains _list_ and _field_ config information
tightly coupled to the API. It is therefore recommended to always deploy the
Admin UI at the same time as deploying the API to avoid any inconsistencies.

### Adding Authentication

_See [Authentication docs](https://v5.keystonejs.com/discussions/authentication)._

To setup authentication, you must instantiate an _Auth Strategy_, and create a
list used for authentication in `index.js`:

<!-- prettier-ignore -->

```javascript
const { Keystone, PasswordAuth } = require('@keystone-alpha/keystone');
const { AdminUI } = require('@keystone-alpha/admin-ui');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { Text, Password }  = require('@keystone-alpha/fields');

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
  type: PasswordAuth,
  list: 'User',
  config: {
    identityField: 'username', // default: 'email'
    secretField: 'password',   // default: 'password'
  }
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
});

module.exports = {
  keystone,
  admin,
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

Create an environment variable in the test project `.env`. This will run project locally on port 3000

```sh
# CLOUDINARY_CLOUD_NAME=abc123
# CLOUDINARY_KEY=abc123
# CLOUDINARY_SECRET=abc123
PORT=3000
```

Then install the dependencies and start the test project:

```sh
bolt
bolt start {name of project folder}
```

_(Running `bolt start` will start the project located in `demo-projects/todo` by default)_

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
