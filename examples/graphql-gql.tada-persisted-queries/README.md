## Feature Example - Persisted queries with gql.tada

This example uses `gql.tada` to generate a static persisted-query manifest and
configures Keystone's Apollo Server to accept only those operations by default.
Authenticated Admin UI users can continue to send ordinary GraphQL documents.

## Running the example

From this directory, run:

```shell
pnpm dev
```

The `dev` and `build` scripts run `gql-tada generate-persisted` before Keystone
starts. The command finds every `graphql.persisted()` call in `operations.ts`
and writes `persisted-queries.json`.

The first run creates an admin user and prints its generated password. Open
[localhost:3000](http://localhost:3000) and sign in with the username `admin`.

With the development server running, use the example Node client from another
terminal:

```shell
pnpm client
```

`client.ts` wraps `fetch` with `persistedFetch()`. It reads each generated
`documentId` from the result of `graphql.persisted()`, sends the persisted query extension
without query text, and uses gql.tada's generated result and variable types.

You can configure e.g. @apollo/client, urql or etc. to send persisted queries in the same way, [see gql.tada's docs for more information](https://gql-tada.0no.co/guides/persisted-documents#integration-with-graphql-clients).

## Sending a persisted operation

A public client sends the generated document ID without a `query` property:

```json
{
  "operationName": "PublicPosts",
  "variables": { "take": 10 },
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "<the PublicPosts key from persisted-queries.json>"
    }
  }
}
```

## Admin UI exception

The Admin UI sends ordinary, non-persisted documents. Those requests are
accepted only when the request session passes the same `isAdmin` function used
by `ui.isAccessAllowed`.

The password sign-in mutation must run before an admin session exists.
`createAuth().persistedQueries()` provides the auth operations as a ready-to-merge
hash-to-query registry. The auth page calculates the same hash in the browser
and sends it with the mutation text.
