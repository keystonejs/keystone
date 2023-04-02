# Document field customisation

A Monorepo with a Keytone server and a Next.js frontend demonstrating three customisations.

1. How to add custom components to keystone document field (server)
2. How to customise `DocumentRenderer` to render custom components (frontend)
3. How to customise `DocumentRenderer` to add custom styles to default elements (frontend)

## Running the example

1. Install dependencies

Make sure you are at the root of the repo and install dependencies.

```shell
pnpm
```

2. Start Keystone and Next.js servers

Navigate from repo root to `examples/document-field-customisation` and start the servers.

```shell
pnpm dev
```

The GraphQL Server and Admin UI will start on [localhost:3000](http://localhost:3000).

The Next.js server will start and the homepage will be served at [localhost:8000](http://localhost:8000).
