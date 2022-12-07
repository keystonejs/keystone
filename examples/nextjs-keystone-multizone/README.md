# Next.js Multi Zones + Keystone

> This is a highly experimental example of using Keystone in Next.js apps and getting the Admin UI to work. [More info on Multi Zones in Next.js docs](https://nextjs.org/docs/advanced-features/multi-zones).

Keystone could double down as a powerful data engine within Next.js applications without having to host a separate Keystone server. This is made possible by Keystone's `getContext` API.

- **CRUD data within your Next.js server**: You can use the Keystone data APIs directly in Next.js `getStaticProps` or `getServerSideProps` to CRUD data. ⚡️
- **CRUD data from browser**: You can use the generated Keystone GraphQL schema to setup your own GraphQL server in a Next.js route. This enables you to send GraphQL requests from the browser. 🤯 (refer to [/pages/api/graphql.ts](/pages/api/graphql.ts) for implementation details)
- You don't have to start the Keystone server at all.
- You are serving two Next.js apps (yours and Keystone Admin UI) from a single Next.js server using multi zone config and redirects.

## Notes

- This example is setup with seed data. Demo user email is `bruce@email.com`, password is `passw0rd`.
- In local, `yarn keystone:dev` will start your keystone server.
- In local, `yarn next:dev` will start your Next.js app.
- You will access your Next.js app and the Keystone Admin UI as two separate apps in your local.
- In Vercel deployments, both the Next.js app and the Keystone Admin UI will be served from a single Next.js server using [Next.js Multi Zones setup](https://nextjs.org/docs/advanced-features/multi-zones).
- DEPLOY STEPS: TODO

## Give it a try (doesn't work yet)

Deploy this example to Vercel and see it for yourself.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkeystonejs%2Fkeystone%2Ftree%2Fmain%2Fexamples%2Fkeystone-in-nextjs)
