---
title: "Use Keystone in Next.js applications"
description: "Learn how to use Keystone in Next.js apps and deploy to Vercel."
publishDate: "2022-12-14"
authorName: "Dinesh Pandiyan"
authorHandle: "https://twitter.com/flexdinesh"
metaImageUrl: ""
---

Keystone is an excellent headless CMS that provides a GraphQL API to access your data. But did you also know that you could use **Keystone as a data layer within Next.js applications**? Yes, you don't need to host Keystone on a separate server. Keystone's entire data layer is so well abstracted that you could just import the `context` API in a Next.js application and CRUD your data. In other words, Keystone can be imported and used in serverless environments like Next.js routes, `getStaticProps` and `getServerSideProps`.

If you want to browse through the example code to understand how Keystone works within a Next.js application, we have built an example here [examples/framework-nextjs-pages-directory](https://github.com/keystonejs/keystone/tree/main/examples/framework-nextjs-pages-directory).

**Live Demo**: [Keystone + Next.js example in Vercel](https://nextjs-keystone-demo.vercel.app)

To understand how Keystone works within a Next.js application, let's first take a look at how you'd typically use Keystone when you are building end-to-end applications.

![Standalone Keystone](/assets/blog/images/nextjs-keystone/standalone-keystone.png)

This is how a standalone keystone server works:

- You deploy a separate frontend and a separate keystone server.
- Your frontend will send network requests to Keystone server's GraphQL API to CRUD data. Eg. During server rendering, in `getStaticProps` or `getServerSideProps`, you will send http requests to Keystone server's GraphQL API to query or mutate your data. 

With the release of [core v3](https://github.com/keystonejs/keystone/releases/tag/2022-10-19), **Keystone can now be used within other servers**. Keystone's data layer is well abstracted and exported as node APIs that you could import and use in node based servers like Next.js and deploy to [Vercel](https://vercel.com). 

![Keystone in Next.js](/assets/blog/images/nextjs-keystone/keystone-in-nextjs.png)

This is how Keystone works within a Next.js application:

- You import Keystone's `getContext` in your Next.js application. It is a wrapper around Keystone's data layer.
- You can CRUD your data in `getStaticProps` or `getServerSideProps` using the Keystone `context` object. 
- You can also setup your own GraphQL server in a Next.js route using Keystone's generated GraphQL schema and send GraphQL requests from your browser.

Importing Keystone's `getContext`

```ts
/* nextjs-app/src/keystone/context.ts */

import { getContext } from '@keystone-6/core/context';
import config from '../../keystone';
import { Context } from '.keystone/types';
import * as PrismaModule from '.prisma/client';

// Making sure multiple prisma clients are not created during dev hot reloading
export const keystoneContext: Context =
  (globalThis as any).keystoneContext || getContext(config, PrismaModule);

if (process.env.NODE_ENV !== 'production') {
    (globalThis as any).keystoneContext = keystoneContext;
}

```

Querying data in `getServerSideProps`

```ts
/* nextjs-app/src/pages/index.tsx */

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const users = await context.db.User.findMany();

  return {
    props: { users: users }, // will be passed to the page component as props
  };
};

```

Setting up a Next.js route as a GraphQL server for your client.

```ts
/* nextjs-app/src/pages/api/graphql.ts*/

import { createYoga } from 'graphql-yoga';
import type { NextApiRequest, NextApiResponse } from 'next';
import { keystoneContext } from '../../keystone/context';

// An example of how to setup your own yoga graphql server
// using the generated Keystone GraphQL schema.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Use Keystone's context to create GraphQL handler
export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  graphqlEndpoint: '/api/graphql',
  schema: keystoneContext.graphql.schema,
  /*
    `keystoneContext` object doesn't have user's session information.
    You need an authenticated context to CRUD data behind access control.
    keystoneContext.withRequest(req, res) automatically unwraps the session cookie
    in the request object and gives you a `context` object with session info
    and an elevated sudo context to bypass access control if needed (context.sudo()).
  */
  context: ({ req, res }) => keystoneContext.withRequest(req, res),
});
```

## Deploying to Vercel

The entire application is just a **single Next.js application and can be deployed to Vercel**. This reduces the massive overhead of having to maintain the infra of a separate server. 

This becomes useful in a handful of situations:

- **Demos**. When you're building a demo or a proof-of-concept, you can quickly prototype and build your application using [SQLite database](http://localhost:8000/docs/config/config#sqlite) and setup access control to be readonly. You will have a fully functioning demo with data without having to connect to an external database or a server. That's what we did with our [example](https://github.com/keystonejs/keystone/tree/main/examples/framework-nextjs-pages-directory). Try clicking the [**Deploy to Vercel** button](https://github.com/keystonejs/keystone/tree/main/examples/framework-nextjs-pages-directory) in the README and see it for yourself.
- **Serverless scale**. For production-grade applications, you don't have to worry about the scale or the infra of your application. You write the code and Vercel will automatically take care of scale for you.
- **Build fast user experiences**. Since you're directly querying your database from your Next.js server APIs (Eg. `getServerSideProps`) using Keystone's `context` API instead of making a http request, you can send your response faster to the browser.


## What about the Admin UI?

Keystone's Admin UI is served from the Keystone server. Since we don't start the Keystone server and only use the `context` API within the Next.js server, _we won't have access to the Admin UI_. This is the only downside now to using Keystone within a Next.js application with the `context` API. But this might change soon. The Keystone team has already started thinking about a few different approaches to get Keystone's Admin UI to work with external servers so in the near future you might be able to use both the `context` API and the Admin UI within a single Next.js application.

That said, during development in your local machine, you will have access to the Admin UI since you can easily run two separate servers in your local machine and all you have to do is just start the keystone server and access the Admin UI. But when you deploy your Next.js app to Vercel (or anywhere really), you can't have two servers running and that's why you can't use the Admin UI once you deploy your Next.js application. But if you really need Keystone's Admin UI, you could always just deploy Keystone as a standalone server.

## An example to get started

To make it easy to get started, we have built an example showing how you could use Keystone in Next.js applications. Check it out here [examples/framework-nextjs-pages-directory](https://github.com/keystonejs/keystone/tree/main/examples/framework-nextjs-pages-directory). It is setup with auth, server rendering, custom GraphQL server in a Next.js route and everything you need to get started.

**Live Demo**: [Keystone + Next.js example in Vercel](https://nextjs-keystone-demo.vercel.app)

## Summary

To sum it all up,

- **Node APIs**. Keystone exports intuitive node APIs that enables you to use Keystone in any node compatible server like a Next.js application.
- **BYO GraphQL server**. You could setup your own GraphQL server using the generated Keystone GraphQL schema. This allows you to use Keystone with light weight serverless friendly GraphQL servers like [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server).
- **No need to deploy or maintain a separate infra for your API**. Keystone can be used within Next.js applications just like any other package.
- **Serverless friendly**. The path to serverless Keystone for us was abstracting our data layer with composable exports that would work with any serverless friendly node frameworks like Next.js.
- **Boilerplate example**. [examples/framework-nextjs-pages-directory](https://github.com/keystonejs/keystone/tree/main/examples/framework-nextjs-pages-directory) is setup with auth, custom GraphQL server and server rendering to get started quickly.
- **No Admin UI**. Admin UI won't work when using Keystone within Next.js applications but the Keystone team is hard at work and we will soon have both the Keystone `context` API and Admin UI work within a single Next.js application. Until then, if having an Admin UI is not one of your top priorities, Keystone + Next.js is a great stack for what you're building.

That's all folks. 

If you like using Keystone, we'd appreciate a shout out in [Twitter](https://twitter.com/KeystoneJS) and a star in [GitHub](https://github.com/keystonejs/keystone). We also have a friendly slack community, [come say hi](https://community.keystonejs.com)! 

To stay updated on the latest news and announcements about Keystone, subscribe to our [RSS feed](https://keystonejs.com/feed.xml).