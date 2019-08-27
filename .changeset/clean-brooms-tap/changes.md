* Added `keystone.extendGraphQLSchema()` as the interface for custom mutations and queries.

```javascript
keystone.extendGraphQLSchema({
  types: ['type Foo { foo: Int }', ...],
  queries: [{ schema: '...', resolver: () => {} }, ...],
  mutations: [{ schema: '...', resolver: () => {} }, ...],
});
```

 * `new List()` and `keystone.createList()` no longer accept `queries` or `mutations` options! Please use `extendGraphQLSchema()` instead.
