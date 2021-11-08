## Feature Example - JSON Field

This project demonstrates the usage of the `json` field type.
It builds on the [Task Manager](../task-manager) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

🚀 Congratulations, you're now up and running with Keystone!

## Features

This example implements a `Packages` list. In this field we specify a `pkgjson` field which is a [`json` field type](https://keystonejs.com/docs/apis/fields#json).
This accepts any valid JSON including:

- string
- number
- array
- object
- null

The JSON field type stores its value in the `jsonb` format, as specified by Prisma. However if `sqlite` is specified as the database type instead, then the value is stored as a `string`.
