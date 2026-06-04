# Keystone + Remix

Keystone can be used as a data engine in Remix applications without having to host a separate Keystone server.
This is made possible by Keystone's `getContext` API.

# Running the Example

To run the example for yourself you will perform the following step:

- Clone the Repo
- Run `pnpm install`
- cd into the examples/framework-remix folder (`cd examples/framework-remix`)
- Run the Keystone Server to set up some posts:
  - Run pnpm keystone dev
  - Open a web browser at http://localhost:4000
  - Create some posts
- Run Remix to created posts:
  - Run `pnpm dev`
  - Open a web browser at `http://localhost:3000`
  - See list of posts
