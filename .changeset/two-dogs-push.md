---
'@keystonejs/server-side-graphql-client': major
---

Added a new package `@keystonejs/server-side-graphql-client` a library for running server-side graphQL queries and mutations in Keystone. 

It is intended to replace the `keystone.createItems` method with a set of utility functions to generate and execute graphQL queries.

Note: In a future change we will remove the `keystone.createItems` method. You will need to update code that used `createItems`. 

If you have examples like:

```
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren' }],
});
```

You will need to change this to:

```
const { createItems } = require('@keystonejs/server-side-graphql-client');

createItems({
  keystone,
  listName: 'User',
  items: [{ data: { name: 'Ticiana' } }, {data:  { name: 'Lauren' } }]
})
```
