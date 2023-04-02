# Next.js + Keystone

Keystone can be used as a data engine in Next.js applications without having to host a separate Keystone server.
This is made possible by Keystone's `getContext` API.

- **CRUD data within your Next.js server**: You can use Keystone data APIs directly in Next.js `getStaticProps` or `getServerSideProps` to CRUD data. ⚡️
- **CRUD data from browser**: You can use the generated Keystone GraphQL schema to setup your own GraphQL server in a Next.js route. This enables you to send GraphQL requests from the browser. 🤯 (refer to [/pages/api/graphql.ts](/pages/api/graphql.ts) for implementation details)
- You don't have to start the Keystone server at all.

_Note: Since you are not starting the keystone server, the Admin UI will not be available. You can host Keystone as a separate server if you need Admin UI._

## Notes

- This example is setup with seed data. Demo user email is `bruce@email.com`, password is `passw0rd`.
- `pnpm next:dev` is all you need to develop your Next.js app. You don't need to start the keystone server since `getContext` will work without starting the Keystone server.
- However when you make changes to your keystone lists, the schema files need to be regenerated. So you'll either have to run `pnpm keystone:dev` or `pnpm keystone:build` just once after making changes to your lists. Alternatively you can open two terminal tabs and run both `pnpm keystone:dev` and `pnpm next:dev` concurrently during development.
- When you deploy your Next.js app, remember to run `pnpm keystone:build` once to make sure you have the latest schema files built for `getContext` API.

## FAQ

### 1. Why won't Admin UI work?

Admin UI needs the Keystone server to run. Your Next.js app runs on a Next.js server. Keystone's Admin UI runs on Keystone server. You can't have two servers running in a Next.js production environment. Since we are not starting the Keystone server in production builds, we won't have access to Keystone's Admin UI. You can access it in local (use the command `pnpm keystone:dev`) because you can easily start two servers in your local but once you deploy your Next.js app you won't have access to the Admin UI.

### 2. What should I do to both use Keystone in my Next.js app and have a fully functioning Admin UI?

Easy. Deploy twice to two different servers.

1. Deploy your Next.js app to one instance (Eg. Vercel).
2. Deploy the Keystone server (commands in package.json) to another instance (Eg. Digital Ocean).

Both these apps connect to the same database and are built with the same source code so everything will work as you expect it to.

## Give it a try

Deploy this example to Vercel and see it for yourself.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkeystonejs%2Fkeystone%2Ftree%2Fmain%2Fexamples%2Fnextjs-keystone)
