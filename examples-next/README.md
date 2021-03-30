# Keystone-Next Examples

👋 These are the example projects for the next version of Keystone.

We'll be adding documentation in the coming days and weeks, but in the meantime, you can take a look at these projects to get an idea of what we've been up to.

The `auth` project has fairly comprehensive documentation of how to use the new auth and session features, while the `basic` project is a sort of "kitchen-sink" that we've been using to test during development.

## Getting Started

To run the projects locally:

- Clone this repo
- Run `yarn` in the root (this repo is a monorepo and uses yarn workspaces, so that will install everything you'll need)
- Open one of the example project folders in your terminal and run `yarn dev`

If everything works 🤞 the GraphQL Server and Admin UI will start on [localhost:3000](http://localhost:3000)

## A quick note about the new interfaces

We've been calling the next version of Keystone the "new interfaces" because they're just that -- new interfaces for configuring Keystone (including TypeScript support) and a new Admin UI (built with Next.js)

The new config is (we hope) much clearer and easier to get started with; while the new Admin UI is much cleaner and will be significantly more extensible than before.

Along side this we've also decoupled from Express, introduced a build process, reworked how auth and session work, and are planning to streamline deployment to various production environments.

What hasn't changed is the core of Keystone. So while how you configure and use it is new, under the hood it's using the same battle-tested core GraphQL API, access control system, hooks, database adapters and query engines.

Please note that this is a **preview release**; we're not calling it alpha, because Keystone itself is quite mature and used in production at scale. However we haven't hit feature parity for the new interfaces yet (e.g many field types haven't been brought across yet, there are some rough user experience edges in the new Admin UI, and there's no build-for-production process yet in the CLI)

We hope you like it!

## Getting in touch

If you have trouble running these examples, or find a bug, please open an issue and tag it with the `new interfaces` tag on GitHub.

Otherwise if you want to ask questions or talk to us about what we're up to, start a [discussion](https://github.com/keystonejs/keystone/discussions)!

Also [follow @keystonejs on twitter](https://twitter.com/keystonejs) for updates.
