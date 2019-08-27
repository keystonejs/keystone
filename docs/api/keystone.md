<!--[meta]
section: api
title: Keystone
[meta]-->

# keystone

## createAuthStrategy(options)

### usage

```javascript
const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});
```

Initialises and return an authentication strategy for use in the AdminUI and other apps.

### options

<table>
<tr>
<th>StrategyType</th>
<td>A valid Authentication Strategy. See: authentication strategies.</td>
</tr>
<tr>
<th>listKey</th>
<td>Where authentication is linked to a List such as a 'User'.</td>
</tr>
<tr>
<th>config</th>
<td>Configuration options that will be passed to the authentication strategy. </td>
</tr>
</table>

## keystone.createList(listKey, config)

Registers a new list with Keystone and returns a Keystone list object.

|         |                                                                                            |
| ------- | ------------------------------------------------------------------------------------------ |
| listKey | A string representing the name of a list. This should be singular, E.g. 'User' not 'Users' |
| config  | The list config. See: Creating lists                                                       |

## keystone.extendGraphQLSchema({ types, queries, mutations })

Extends keystones generated schema with custom types, queries, and mutations.

|           |                                                     |
| --------- | --------------------------------------------------- |
| types     | A list of strings defining graphQL types.           |
| queries   | A list of objects of the form { schema, resolver }. |
| mutations | A list of objects of the form { schema, resolver }. |

The `schema` for both queries and mutations should be a string defining the graphQL schema element for the query/mutation, e.g.

```javascript
{
  schema: 'getBestPosts(author: ID!): [Post]';
}
```

The `resolver` for both queries and mutations should be a resolver function with the signature `(obj, args, context, info)`. See the [Apollo docs](https://www.apollographql.com/docs/graphql-tools/resolvers/#resolver-function-signature) for more details.

## keystone.connect()

Manually connect Keystone to the adapters. See Custom Servers.

Note: `keystone.connect()` is only required for custom servers. Most example projects use the `keystone start` command to start a server and automatically connect.

## keystone.createItem(items)

Allows bulk creation of items. This method's primary use is intended for migration scripts, or initial seeding of databases.

| items | An object where keys are list keys, and values are arrays of items to insert. |

Note: The format of the data must match the lists and fields setup with `keystone.createList()`

It is possible to create relationships at insertion using the Keystone query syntax. E.g. `author: { where: { name: 'Ticiana' } }`

E.g.

```javascript
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren' }],
  Post: [
    {
      title: 'Hello World',
      author: { where: { name: 'Ticiana' } },
    },
  ],
});
```

## keystone.disconnect()

Disconnects all adapters.

## keystone.prepare(options)

### options

|         |                                                                         |
| ------- | ----------------------------------------------------------------------- |
| dev     | `true` or `false` - sets the dev flag in Keystone's express middleware. |
| apps    | An array of 'Apps' which are express middleware.                        |
| distDir | the build directory for keystone.                                       |

<!--

Undocumented Methods:

 - getAdminMeta
 - getTypeDefs
 - registerSchema
 - getAdminSchema
 - dumpSchema
 - getAccessContext
 - createItem

-->
