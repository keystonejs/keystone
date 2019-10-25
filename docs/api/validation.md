<!--[meta]
section: api
title: Query Validation
order: 6
[meta]-->

# Query Validation

Stop maliciously complex or invalid queries against your `Keystone` instance.

```javascript
const { validation } = require('@keystonejs/app-graphql');

// ...

const app = new GraphQLApp({
  apollo: {
    validationRules: [validation.depthLimit(3)],
  },
  ...otherOptions,
});
```

## Validators

- `depthLimit`: limit nesting depth of queries
- `definitionLimit`: limit number of definitions (queries, fragments, mutations)
- `fieldLimit`: limit total number of fields returned in results (after expanding fragment spreads)

The following GraphQL has two definitions (`contact`, `info`), four fields (`name`, `email`, `allUsers`, `friends`), and a total depth of three:

```graphql
fragment contact on User {
  name
  email
}
query info {
  allUsers {
    friends {
      ...contact
    }
  }
}
```
