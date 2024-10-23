## Feature Example - Query Builder

This project demonstrates how to configure a `queryBuilder` field in your Keystone system. It uses the `@react-awesome-query-builder` library to provide a user-friendly interface for building complex queries. This tool allows users, typically non-programmers, to construct and manipulate queries without needing to write SQL or other query languages directly. It's particularly useful for applications involving data analysis or any scenario where users need to filter or retrieve specific data sets from a larger database.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

In a separate terminal, start the frontend dev server:

```
pnpm dev:site
```

This will start the frontend at [localhost:3001](http://localhost:3001).

## Configuring

The project contains one `queryBuilder` field which shows how to use the field configuration options to customise the document editor in the Admin UI.

### `Report.query`

This field shows an example of using statically defined (config.fields)[https://github.com/ukrbublik/react-awesome-query-builder/blob/master/CONFIG.adoc#configfields].

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/field-query-builder>. You can also fork this sandbox to make your own changes.
