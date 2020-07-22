<!--[meta]
section: guides
title: Cache hints
subSection: advanced
[meta]-->

# Cache hints

Automatically set HTTP cache headers and save full responses in a cache. For more information please see the [Apollo docs](https://www.apollographql.com/docs/apollo-server/performance/caching/) and the [HTTP spec](https://tools.ietf.org/html/rfc7234#section-5.2.2/).

### Setting a default `maxAge`

By default, all queries and mutations keystone generates have a `maxAge` of 0 (ie, uncacheable). You can update this behaviour by specifying a default max age when you create your `GraphQLApp`.

```javascript
const app = new GraphQLApp({
  apollo: {
    cacheControl: {
      defaultMaxAge: 3600,
    },
  },
});
```

Please see the [Apollo docs](https://www.apollographql.com/docs/apollo-server/performance/caching/#setting-a-default-maxage) for more information.

### Lists

Cache hints can be set on keystone lists like so:

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
  cacheHint: {
    scope: 'PUBLIC',
    maxAge: 3600,
  },
});
```

#### Dynamic cache hints

Cache hints can be dynamically returned from a function that takes an object with these members:

- `results`: an array of query results
- `operationName`: the name of the GraphQL operation that generated the results
- `meta`: boolean value that's true for a meta (count) query

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
  cacheHint: ({ meta }) => {
    if (meta) {
      return {
        scope: 'PUBLIC',
        maxAge: 3600,
      };
    } else {
      return {
        scope: 'PRIVATE',
        maxAge: 60,
      };
    }
  },
});
```

### Custom queries

Cache hints can be set for custom queries generated from the `keystone.extendGraphQLSchema()` method

```javascript
keystone.extendGraphQLSchema({
  types: [{ type: 'type MyType { original: Int, double: Float }' }],
  queries: [
    {
      schema: 'double(x: Int): MyType',
      resolver: (_, { x }) => ({ original: x, double: 2.0 * x }),
      cacheHint: {
        scope: 'PUBLIC',
        maxAge: 100,
      },
    },
  ],
});
```

### Options

- `scope`: `'PUBLIC'` or `'PRIVATE'` (corresponds to `public` and `private` `Cache-Control` directives)
- `maxAge`: maximum age (in seconds) that the result should be cacheable for

`PRIVATE` is a recommendation that browsers should cache the result, but forbids intermediate caches (like CDNs or corporate proxies) from storing it. It needs to be used whenever the result depends on the logged in user (including secrets and user-specific content like profile information). If the result could be different when a user logs in, `PRIVATE` should still be used even if no user is logged in.
