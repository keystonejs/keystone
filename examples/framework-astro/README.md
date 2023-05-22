# Keystone + Astro

Keystone can be used as a data engine in Astro applications without having to host a separate Keystone server.
This is made possible by Keystone's `getContext` API.

This example shows how this can be achieved with [Astro SSR](https://docs.astro.build/en/guides/server-side-rendering/). It shows how to pass through a session to Keystone using `withSession()` to filter posts based on the browser used - this example is purely for the demonstration of session and access control when using `getContext` in Astro.

# Running the Example

To run the example for yourself you will perform the following step:

- Clone the Repo
- Run `pnpm install`
- cd into the examples/framework-astro folder (`cd exmaples/framework-astro`)
- Run the Keystone Server to set up some posts:
  - Run `pnpm keystone dev`
  - Open a web browser at `http://localhost:4000`
  - Create some posts
- Run Astro to see your posts:
  - Run `pnpm dev`
  - Open a web browser at `http://localhost:3000`
  - See you posts as they are created

# Notes

The `astro.config.mjs` file contains a `vite` configuration object, this should not be required outside of the Keystone Monorepo

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/framework-astro>. You can also fork this sandbox to make your own changes.
