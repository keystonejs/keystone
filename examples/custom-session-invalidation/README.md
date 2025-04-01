## Feature Example - Invalidate Session Token

This project demonstrates invalidating sessions after a user changes their password. It builds on the [authentication example](../auth).

## Run the example

From this directory, run `pnpm dev`. The Admin UI is available at [localhost:3000](http://localhost:3000) and GraphQL at [localhost:3000/api/graphql](http://localhost:3000/api/graphql).

## How it works

- A hook updates `passwordChangedAt` whenever the password changes.
- A wrapper around `jwtSessions` adds `startedAt` to newly created sessions.
- The top-level `getSession` callback loads the user, rejects sessions older than `passwordChangedAt`, and expires their cookie when response headers are available.
- The wrapped strategy is passed directly to `createAuth`, so the password-auth mutations use it to start and end sessions.

The complete implementation is in [keystone.ts](./keystone.ts) and the list hooks are in [schema.ts](./schema.ts).
