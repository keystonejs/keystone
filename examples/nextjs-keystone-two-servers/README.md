# Keystone Example - nextjs-keystone-two-servers

An example of a frontend nextjs server and backend API server

## Running the example

1. Install dependencies

Make sure you are at the root of the repo and install dependencies.

```shell
pnpm
```

2. Start Keystone and Next.js servers

Navigate from repo root to `examples/example-nextjs-keystone-two-servers` and start the servers.

```shell
pnpm dev
```

The GraphQL Server and Admin UI will start on [localhost:3000](http://localhost:3000).

The Next.js server will start and the homepage will be served at [localhost:8000](http://localhost:8000).

_You can alternatively open two terminals and navigate to `examples/nextjs-keystone-two-servers/keystone-server` and `examples/nextjs-keystone-two-servers/nextjs-frontend` and run `pnpm dev` separately._
