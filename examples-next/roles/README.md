# Keystone-Next Roles-based Access Example

👋🏻 This is an example of how to set up roles-based access in KeystoneJS.

The permissions assigned with roles affect both the Admin UI and GraphQL API.

Implementation and docs are WIP. See `schema.ts` for the spec of what role permissions do.

## Running the example

To run the project locally:

- Clone this repo
- Run `yarn` in the root (this repo is a monorepo and uses yarn workspaces, so that will install everything you'll need)
- Make sure you have a local mongo server up and running on the default port
- Open this folder in your terminal and run `yarn dev`

If everything works 🤞🏻 the GraphQL Server and Admin UI will start on [localhost:3000](http://localhost:3000)
