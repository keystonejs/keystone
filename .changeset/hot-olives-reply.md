---
'@keystonejs/keystone': major
---

Removed the `keystone.createItems` method. This has been replaced with the `createItems` function in `@keystonejs/server-side-graphql-client`. 

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