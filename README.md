# Keystone 5

[![CircleCI](https://circleci.com/gh/keystonejs/keystone-5.svg?style=shield&circle-token=6b4c9e250b2b61403b64c9b66ab7f4de6b0b4dde)](https://circleci.com/gh/keystonejs/keystone-5)

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

## Demo

Check out the demo: [keystone-next.herokuapp.com](http://keystone-next.herokuapp.com)

Note, the demo is running on a low-power dyno and may throw errors when you first wake it up;
we haven't optimised the boot time yet.

It is updated automatically when commits are merged into `master`.
You can reset the database by hitting the [/reset-db](http://keystone-next.herokuapp.com/reset-db) page... but please don't do this.

## Getting Started

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

## Contributing

All source code should be formatted with [Prettier](https://github.com/prettier/prettier).
Code is not automatically formatted in commit hooks to avoid unexpected behaviour,
so we recommended using an editor plugin to format your code as you work.
You can also run `bolt format` to prettier all the things.
The `lint` script will validate source code with both eslint and prettier.

## Testing

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

## Arch - Keystone UI Kit

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
