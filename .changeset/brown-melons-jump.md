---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Added a `resolveFields: false | string` argument to the items API methods.

This function controls the return type of the methods on the items API.
If a `string` value is provided, it will be interpreted as a graphQL field specification fragment.
The method will construct and run a graphQL operation and return the values specified by `resolveFields`.
The default value for `resolveFields` is `id`.

For example, to find the title and author name for all posts in our system we would run:

```js
const posts = await context.lists.Post.findMany({ resolveFields: 'id title author { id name }' })
```

If `resolveFields: false` is provided, this indicates to the method that no field-resolving is desired.
Instead, the method will return the result of the item-level resolver for the corresponding operation.
These objects are the internal data representation of the items in the system which would normally be passed to the field resolvers.

This flag is most useful in two specific scenarios. Firstly, if you need to inspect data which isn't generally available as a graphQL field, such as password hash values.

Secondly, if you are writing a custom mutation which returns a list item type, such as `Post`. For example

```js
export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    type Mutation {
      topPost(userId: ID): Post
    }
  `,
  resolvers: {
    Mutation: {
      topPost: (root, { userId } : { userId: string }, context) => {
        return context.lists.Post.findMany({
            where: { user: { id: userId } },
            first: 1,
            sortBy: ['stars_DESC'],
            resolveFields: false,
        });
      }
    }
  }
});
```
