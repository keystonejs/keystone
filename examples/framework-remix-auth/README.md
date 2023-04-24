# Keystone + Remix

Keystone can be used as a data engine in Remix applications without having to host a separate Keystone server.
This is made possible by Keystone's `getContext` API.

This example shows how this can be achieved based on a cut down version of the [Remix Run Jokes App Tutorial](https://remix.run/docs/en/main/tutorials/jokes). It shows how to pass through a session to Keystone using `withSession()` to all access to users.

# Running the Example

To run the example for yourself you will perform the following step:

- Clone the Repo
- Run `pnpm install`
- cd into the examples/framework-remix folder (`cd exmaples/framework-remix`)
- Run the Keystone Server to set initialize the database:
  - Run `pnpm keystone dev`
- Run Remix to register and/or login:
  - Run `pnpm dev`
  - Open a web browser at `http://localhost:3000`
  - Register with a new user and then see the user that is created

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/framework-remix-auth>. You can also fork this sandbox to make your own changes.
