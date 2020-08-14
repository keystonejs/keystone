---
'@keystonejs/test-utils': major
---

Removed the following redundant functions in tests, and used the equivalent `server-side-graphql-client` functions: 

- `graphqlRequest`: 
As all the access control checks are disabled by default, you can now use utility functions from `[server-side-graphql-client](https://github.com/keystonejs/keystone/blob/master/packages/server-side-graphql-client/lib/server-side-graphql-client.js)` to perform desired CRUD operations.
Additionally, you can use `runCustomQuery` function to suit your requirements.

`authedGraphqlRequest`
- Similar to above, but you can also supply a custom `context` object if you don't want to override the access control checks.

`matchFilter`
- It has been removed in favour of the `[getItems](https://github.com/keystonejs/keystone/blob/cc5bb891579281338ad7fad0873531be81d877d4/packages/server-side-graphql-client/lib/server-side-graphql-client.js#L99)`. 

If you are using `multiAdapterRunners`, then the `testFn` function you write for your test will no longer be supplied with the following functions:

- `create`
- `findById`,
- `findOne`,
- `update`
- `delete`

Instead you can use the equivalent functions from `server-side-graphql-client` to achieve your desired results.

