# keystone-5

[![CircleCI](https://circleci.com/gh/keystonejs/keystone-5.svg?style=shield&circle-token=6b4c9e250b2b61403b64c9b66ab7f4de6b0b4dde)](https://circleci.com/gh/keystonejs/keystone-5)

This is a prototype architecture for Keystone 5.

Everything is WIP.

## Demo

Check out the demo: [keystone-next.herokuapp.com](http://keystone-next.herokuapp.com)

It is updated automatically when commits are merged into `master`.

You can reset the database by hitting the [/reset-db](http://keystone-next.herokuapp.com/reset-db)
page.

## Getting Started

Keystone 5 is set up as a monorepo, using [Bolt](http://boltpkg.com/)

First make sure you've got Bolt installed:

```
yarn global add bolt
```

Also make sure you have a local MongoDB server running ([instructions](https://docs.mongodb.com/getting-started/shell/installation/)).

If you don't have it installed, on MacOS use Homebrew (run these once):

```
brew install mongodb
brew services start mongodb
```

Then install the dependencies and start the test project:

```
bolt
bolt start
```

## Contributing

All source code should be formatted with [Prettier](https://github.com/prettier/prettier).

Code is not automatically formatted in commit hooks to avoid unexpected behaviour,
so we recommended using an editor plugin to format your code as you work.

You can also run `bolt format` to prettier all the things.

The `lint` script will validate source code with both eslint and prettier.

## Testing

Keystone uses [Jest](https://facebook.github.io/jest/) for unit tests and [Cypress](https://www.cypress.io/) for end to end tests. All tests can be run locally and on [CircleCI]((https://circleci.com/gh/keystonejs/keystone-5).)

### Unit tests

To run the unit tests, run the script

`bolt jest`

Unit tests for each package can be found in `packages/<package>/tests` and following the naming pattern `<module>.test.js`.

To see test coverage of the files touched by the unit tests, run

`bolt jest --coverage`

To see test coverage of the entire mono-repo, including files which have zero test coverage, use the special script

`bolt coverage`

### End to end tests

Keystone tests end to end functionality with the help of [Cypress](https://www.cypress.io/). To run these tests, you first need to start the `test-project` application by running

`bolt start`

The tests can then be run with

`bolt cypress:run`

Cypress can be run in interactive mode with its built in GUI, which is useful when developing and debugging tests.

`bolt cypress:open`

End to end tests live in `cypress/integration/*spec.js`.

###

## License

Copyright (c) 2018 Jed Watson. Licensed under the MIT License.
