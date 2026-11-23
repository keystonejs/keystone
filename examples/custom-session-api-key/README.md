## Feature Example - API Key Session Strategy

This project demonstrates how to compose session strategies.

Users can sign in with the standard `@keystone-6/auth` password flow. API requests can also authenticate with example-specific API key headers:

```shell
Keystone-Example-API-Key-ID: <user-id>
Keystone-Example-API-Key-Secret: <api-key-secret>
```

The headers are branded for this example so they do not collide with other platform or proxy headers.

The API key secret is stored in a Keystone `password` field, so Keystone hashes it before writing to the database. The `apiKeyExpiresAt` field controls expiry.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).

Create a user, generate an API key secret, set an expiry, then make GraphQL requests with:

```shell
Keystone-Example-API-Key-ID: <user-id>
Keystone-Example-API-Key-Secret: <api-key-secret>
```
