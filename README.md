<div align="center">
  <img src="website/static/readme-header.png" width="557" height="300">
  <h1>KeystoneJS</h1>
  <br>
  <p><b>A scalable platform and CMS to build Node.js applications.</b></p>
  <p><code>schema => ({ GraphQL, AdminUI })</code></p>
  <br>
  <p>Keystone comes with first-class GraphQL support, a highly extensible architecture, and a wonderful Admin UI.</p>
  <sub>Looking for Keystone v4.x / Keystone Classic? Head over to <a href="https://www.npmjs.com/package/keystone-classic"><code>keystone-classic</code></a>.</sub>
  <br>
</div>

## Contents

- [What's new](#whats-new)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## What's new?

Keystone 5 is a complete re-imagining of KeystoneJS for the future. It builds on the lessons we learned over the last 5 years of the KeystoneJS' history and focuses on the things we believe are the most powerful features for modern web and mobile applications.

This means less focus on hand-holding Node.js template-driven websites and more focus on flexible architecture, a powerful GraphQL API with deep authentication & access control features, an extensible Admin UI and plugins for rich field types, file and database adapters, and session management.

We believe it's the ideal back-end for rich React / Vue / Angular applications, Gatsby and Next.js websites, Mobile applications and more. It also makes a great Headless CMS.

## Getting Started

To get up and running with a basic project template, run the following commands.

```bash
yarn create keystone-app my-app
cd my-app
yarn start
```

For more details and system requirements, check out the [5 Minute Quick Start
Guide](https://keystonejs.com/quick-start/).

## Documentation

The [API documentation](https://keystonejs.com/api/) contains a reference for all KeystoneJS packages.

For walk-throughs and discussions, see the [Guides
documentation](https://www.keystonejs.com/guides/).

## Contributing

### Demo Projects

These projects are designed to show off different aspects of KeystoneJS features
at a range of complexities (from a simple Todo App to a complex Meetup Site).

See the [`demo-projects/README.md`](./demo-projects/README.md) docs to get
started.

### Development Practices

All source code should be formatted with [Prettier](https://github.com/prettier/prettier).
Code is not automatically formatted in commit hooks to avoid unexpected behaviour,
so we recommended using an editor plugin to format your code as you work.
You can also run `yarn format` to prettier all the things.
The `lint` script will validate source code with both ESLint and prettier.

### Setup

Keystone 5 is set up as a monorepo, using [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/). Make sure to [install Yarn](https://yarnpkg.com/lang/en/docs/install) if you haven't already.

First, clone the Keystone 5 repository

```
git clone https://github.com/keystonejs/keystone-5.git
```

Also make sure you have a local MongoDB server running
([instructions](https://docs.mongodb.com/manual/installation/)).

Then install the dependencies and start the test project:

```sh
yarn
yarn dev
```

See [`demo-projects/README.md`](./demo-projects/README.md) for more details on
the available demo projects.

#### Note For Windows Users

While running `yarn` on Windows, the process may fail with an error such as this:

```sh
error { [Error: EPERM: operation not permitted, symlink 'C:\Users\user\Documents\keystone-5\packages\arch\packages\alert\src\index.js' -> 'C:\Users\user\Documents\keystone-5\packages\arch\packages\alert\dist\alert.cjs.js.flow']
```

This is due to permission restrictions regarding the creation of [symbolic links](https://blogs.windows.com/windowsdeveloper/2016/12/02/symlinks-windows-10/). To solve this, you should enable Windows' [Developer Mode](https://docs.microsoft.com/en-us/windows/uwp/get-started/enable-your-device-for-development?redirectedfrom=MSDN) and run `yarn` again.

### Testing

Keystone uses [Jest](https://facebook.github.io/jest) for unit tests and [Cypress](https://www.cypress.io) for end-to-end tests.
All tests can be run locally and on [CircleCI](https://circleci.com/gh/keystonejs/keystone-5).

### Unit Tests

To run the unit tests, run the script:

```sh
yarn jest
```

Unit tests for each package can be found in `packages/<package>/tests` and following the naming pattern `<module>.test.js`.
To see test coverage of the files touched by the unit tests, run:

```sh
yarn jest --coverage
```

To see test coverage of the entire monorepo, including files which have zero test coverage, use the special script:

```sh
yarn coverage
```

### End-to-End Tests

Keystone tests end-to-end functionality with the help of [Cypress](https://www.cypress.io).
Each project (ie; `test-projects/basic`, `test-projects/login`, etc) have their own set of Cypress tests.
To run an individual project's tests, `cd` into that directory and run:

```sh
yarn cypress:run
```

Cypress can be run in interactive mode from project directories with its built in GUI,
which is useful when developing and debugging tests:

```sh
cd test-projects/basic && yarn cypress:open
```

End-to-end tests live in `project/**/cypress/integration/*spec.js`.
It is possible to run all cypress tests at once from the monorepo root with the command:

```sh
yarn cypress:run
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
