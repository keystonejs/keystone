# Keystone 5

[![CircleCI](https://circleci.com/gh/keystonejs/keystone-5.svg?style=shield&circle-token=6b4c9e250b2b61403b64c9b66ab7f4de6b0b4dde)](https://circleci.com/gh/keystonejs/keystone-5) [![All Contributors](https://img.shields.io/badge/all_contributors-16-orange.svg?style=flat-square)](#contributors)


This is a prototype architecture for Keystone 5.

Everything is WIP.

## Welcome and Disclaimer

If you can see this repo, it means you've been invited to work with us on the future of KeystoneJS.

Some quick house rules:

- This project will be made public when we're ready.
  There is a lot to do, and a lot to write (including code, guides, documentation, and plans) before that happens.
  Please be patient - we're 100% focused on the coding and planning at the moment and don't yet have bandwidth for questions or support.
- Because so much is still being worked out,
  please don't demo or discuss the plans and features present in this repo outside of the Keystone slack
  (we have a dedicated #keystone-next channel for that)
- In order to preserve focus, speculative issues not related to our immediate development goals may be closed at any time.
  We'll be open to broader topics being discussed in issues when
- PRs are welcome, but contributions may not be accepted unless they have been discussed and specified in a corresponding issue beforehand.
  Issues marked `ready`, `help wanted` and `good first issue` are fair game.
- The new version is not being published to npm at the moment; the goal here is to develop keystone itself,
  not build projects with it (at this stage).
- And it probably goes without saying, but **please do not publish any of this code publicly or share preview urls** until
  [@JedWatson](https://github.com/JedWatson) does.
  The project is MIT licensed in anticipation of a future release, so this is not a legal restriction, but a friendly request.

## Getting Started

### Setup

```
npm install --save @keystone-alpha/keystone @keystone-alpha/fields @keystone-alpha/adapter-mongoose @keystone-alpha/admin-ui
```

_NOTE: You must have a [working version of `mongo`
installed](https://docs.mongodb.com/manual/installation/#mongodb-community-edition)._

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
    'cookie secret': 'qwerty',
    authStrategy: authStrategy, // See 'Adding Authentication' below
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
  .then(({ port }) => {
    console.log(`Listening on port ${port}`);
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
deploy the API independently of the [admin UI](#dist-admin) by deploying the
contents of the `dist/api/` folder only.

##### `dist/admin/`

A static export of the Admin UI lives here. Built from your code setting up the
keystone instance, this export contains _list_ and _field_ config information
tightly coupled to the API. It is therefore recommended to always deploy the
Admin UI at the same time as deploying the API to avoid any inconsistencies.

### Adding Authentication

_See [Authentication docs]()._

To setup authentication, you must instantiate an _Auth Strategy_, and create a
list used for authentication in `index.js`:

<!-- prettier-ignore -->
```javascript
const { Keystone }        = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { Text, Password }  = require('@keystone-alpha/fields');
const PasswordAuth        = require('@keystone-alpha/keystone/auth/Password');

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
  {
    identityField: 'username', // default: 'email'
    secretField: 'password',   // default: 'password'
  }
});

module.exports = {
  keystone,
  serverConfig: {
    authStrategy,
  }
};
```

_NOTE: It will be impossible to login the first time you load the Admin UI as
there are no Users created. It is recommended to first run an instance of
Keystone **without** an auth strategy, create your first User, then re-enable
the auth strategy._

## Contributing

All source code should be formatted with [Prettier](https://github.com/prettier/prettier).
Code is not automatically formatted in commit hooks to avoid unexpected behaviour,
so we recommended using an editor plugin to format your code as you work.
You can also run `bolt format` to prettier all the things.
The `lint` script will validate source code with both eslint and prettier.

### Setup

Keystone 5 is set up as a monorepo, using [Bolt](http://boltpkg.com)
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

To see test coverage of the entire mono-repo, including files which have zero test coverage,
use the special script:

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

### Arch - Keystone UI Kit

Resources, tooling, and design guidelines by KeystoneJS using [GastbyJS](https://www.gatsbyjs.org/)

To start, run

```sh
bolt arch
```

## Developing Projects with Keystone 5

As noted in the house rules, this preview isn't intended to be used for projects.
If you want to do so, you may, at your own risk.
We're not ready to make promises about breaking changes, stability or feature completeness yet.

Having said that; we _are_ using Keystone 5 for a limited number of applications in production, and this is how:

- Create a **private** fork of the repo
- Make a copy of `./demo-projects/todo` and use it as the basis for the project
- Update the `start` script to run your project
- Pull upstream changes as needed

When we're ready, Keystone 5 will be properly supported with semantic versioned releases,
changelogs, and everything else you'd expect.
Until then, you're on your own 🙂

## License

Copyright (c) 2018 Jed Watson. Licensed under the MIT License.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="http://www.thinkmill.com.au"><img src="https://avatars3.githubusercontent.com/u/872310?v=4" width="100px;" alt="Jed Watson"/><br /><sub><b>Jed Watson</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=JedWatson" title="Code">💻</a></td><td align="center"><a href="http://jes.st/about"><img src="https://avatars1.githubusercontent.com/u/612020?v=4" width="100px;" alt="Jess Telford"/><br /><sub><b>Jess Telford</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=jesstelford" title="Code">💻</a></td><td align="center"><a href="http://www.timl.id.au"><img src="https://avatars0.githubusercontent.com/u/616382?v=4" width="100px;" alt="Tim Leslie"/><br /><sub><b>Tim Leslie</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=timleslie" title="Code">💻</a></td><td align="center"><a href="https://hamil.town"><img src="https://avatars1.githubusercontent.com/u/11481355?v=4" width="100px;" alt="Mitchell Hamilton"/><br /><sub><b>Mitchell Hamilton</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=mitchellhamilton" title="Code">💻</a></td><td align="center"><a href="https://twitter.com/JossMackison"><img src="https://avatars3.githubusercontent.com/u/2730833?v=4" width="100px;" alt="Joss Mackison"/><br /><sub><b>Joss Mackison</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=jossmac" title="Code">💻</a></td><td align="center"><a href="http://nathansimpson.design"><img src="https://avatars2.githubusercontent.com/u/12689383?v=4" width="100px;" alt="Nathan Simpson"/><br /><sub><b>Nathan Simpson</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=nathansimpsondesign" title="Code">💻</a></td><td align="center"><a href="https://github.com/mikehazell"><img src="https://avatars0.githubusercontent.com/u/814227?v=4" width="100px;" alt="Mike"/><br /><sub><b>Mike</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=mikehazell" title="Code">💻</a></td></tr><tr><td align="center"><a href="https://github.com/molomby"><img src="https://avatars0.githubusercontent.com/u/2416367?v=4" width="100px;" alt="John Molomby"/><br /><sub><b>John Molomby</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=molomby" title="Code">💻</a></td><td align="center"><a href="https://dominik-wilkowski.com"><img src="https://avatars3.githubusercontent.com/u/1266923?v=4" width="100px;" alt="Dominik Wilkowski"/><br /><sub><b>Dominik Wilkowski</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=dominikwilkowski" title="Code">💻</a></td><td align="center"><a href="https://github.com/Noviny"><img src="https://avatars1.githubusercontent.com/u/15622106?v=4" width="100px;" alt="Ben Conolly"/><br /><sub><b>Ben Conolly</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=Noviny" title="Code">💻</a></td><td align="center"><a href="https://github.com/jaredcrowe"><img src="https://avatars1.githubusercontent.com/u/4995433?v=4" width="100px;" alt="Jared Crowe"/><br /><sub><b>Jared Crowe</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=jaredcrowe" title="Code">💻</a></td><td align="center"><a href="https://www.linkedin.com/in/gautamsi"><img src="https://avatars2.githubusercontent.com/u/5769869?v=4" width="100px;" alt="Gautam Singh"/><br /><sub><b>Gautam Singh</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=gautamsi" title="Code">💻</a></td><td align="center"><a href="https://github.com/lukebatchelor"><img src="https://avatars2.githubusercontent.com/u/18694878?v=4" width="100px;" alt="lukebatchelor"/><br /><sub><b>lukebatchelor</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=lukebatchelor" title="Code">💻</a></td><td align="center"><a href="http://www.ticidesign.com"><img src="https://avatars2.githubusercontent.com/u/289889?v=4" width="100px;" alt="Ticiana de Andrade"/><br /><sub><b>Ticiana de Andrade</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=ticidesign" title="Code">💻</a></td></tr><tr><td align="center"><a href="https://github.com/aghaabbasq"><img src="https://avatars2.githubusercontent.com/u/17919384?v=4" width="100px;" alt="aghaabbasq"/><br /><sub><b>aghaabbasq</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=aghaabbasq" title="Code">💻</a></td><td align="center"><a href="http://ajaymathur.github.io/"><img src="https://avatars1.githubusercontent.com/u/9667784?v=4" width="100px;" alt="Ajay Narain Mathur"/><br /><sub><b>Ajay Narain Mathur</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=ajaymathur" title="Code">💻</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
