---
title: "Get Context"
description: "getContext is a function exported by @keystone-6/core/context to support operations without starting a HTTP server"
---

Keystone's command line interface is helpful, but sometimes you don't want to startup the HTTP server, or kickoff any build processes.
Maybe you need to insert data into the database, maybe you want to use Keystone with a custom protocol or a tiny REST API.
*Or maybe you want to write unit tests.*

If you have previously run `keystone build` or `keystone dev`, then you can use `getContext`.
If you change your configuration, you should [rebuild your project](../guides/cli) before using `getContext`.

Using the `getContext` function does not use the typical Keystone entry point - it is a function and only requires that your Prisma client has been built and can be provided as a parameter with your Keystone configuration.

```typescript
import { getContext } from '@keystone-6/core/context';
import config from './keystone';
import * as PrismaModule from '.prisma/client';

const context = getContext(config, PrismaModule);

// ... whatever you need
```

{% hint kind="tip" %}
For inspiration, see [the script example project](https://github.com/keystonejs/keystone/tree/main/examples/script), and how we use [`tsx`](https://github.com/esbuild-kit/tsx) to seed the database with some data.
{% /hint %}

A context created in this way does not have an implicit `session`, nor is it a `sudo()` context.
For more information about how to use a context, please see the [overview](./overview).

{% hint kind="warn" %}
The `context` returned from `getContext` is not a global - every time you instantiate it, you are instantiating a Prisma Client.
Without careful usage, you may encounter the warnings that there are too many instances of your Prisma Client.
{% /hint %}

## Related resources

{% related-content %}
{% well
heading="Example Project: Script"
href="https://github.com/keystonejs/keystone/tree/main/examples/script"
target="_blank" %}
Shows you how to write tests against the GraphQL API to your Keystone system. Builds on the Authentication example project.
Shows you how to write code to interact with Keystone without using the standard `@keystone-6/core/scripts/cli` tools.
{% /well %}
{% well
heading="Query API Reference"
href="/docs/context/query" %}
A programmatic API for running CRUD operations against your GraphQL API. For each list in your system you get an API at `context.query.<listName>`.
{% /well %}
{% well
heading="Context API Reference"
href="/docs/context/overview" %}
The API for run-time functionality in your Keystone system. Use it to write business logic for access control, hooks, testing, GraphQL schema extensions, and more.
{% /well %}
{% /related-content %}
