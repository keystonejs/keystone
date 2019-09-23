<!--[meta]
section: api
title: Query Validation
order: 6
[meta]-->

# Query Validation

Stop maliciously complex or invalid queries against your `Keystone` instance.

```javascript
const { validation } = require('@keystone-alpha/app-graphql');

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
- `fieldLimit`: limit total number of fields returned in results

The following query has one definition, four fields, and a total depth of three:

```graphql
query info {
  allUsers {
    friends {
      name
      email
    }
  }
}
```
