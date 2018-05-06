# keystone-5

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

## License

Copyright (c) 2018 Jed Watson. Licensed under the MIT License.
