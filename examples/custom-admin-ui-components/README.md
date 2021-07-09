## Feature Example - Custom Components for the Admin UI

This base project implements a simple **Task Management** app, with `Tasks` and `People` who can be assigned to tasks.

You can it as a starting place for learning how to use Keystone.
It’s also a starter for other [feature projects](../).

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).

You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

🚀 Congratulations, you're now up and running with Keystone!

## admin/pages

This project shows how to export custom components to be rendered in the admin-ui via the `/admin/config` file. As elaborated on in the [Custom Components](###ADDLINKHERE####) guide, the named `components` export of this file is used to replace specific components for use in the `admin-ui`.
