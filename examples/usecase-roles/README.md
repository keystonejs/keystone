# Keystone-6 Roles-based Access Example

👋 This example demonstrates how you can set up a powerful, custom roles-based access control system with Keystone for an otherwise very simple to-do app.

Roles are stored in a list, and each user is related to a role. Each role has a granular set of permissions selected from the available checkboxes.

Role permissions are loaded at the start of the request for the current user, and cached in the session object for use in the access control methods and hooks.

The permissions affect both the Admin UI and GraphQL API.

> **NOTE** this example is WIP. See `schema.ts` for the spec and current status.

## Running the example

To run the project locally:

- Clone this repo
- Run `yarn` in the root (this repo is a monorepo and uses yarn workspaces, so that will install everything you'll need)
- Open this folder in your terminal and run `yarn dev`

If everything works 🤞 the GraphQL Server and Admin UI will start on [localhost:3000](http://localhost:3000)
