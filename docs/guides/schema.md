<!--[meta]
section: guides
title: Data modelling
[meta]-->

# Data modelling

A schema definition (_often abbreviated to "schema"_) is defined by:

- a set of **Lists**
- containing one or more **Fields**
- which each have a **Type**

<!-- TODO: Link to glossary -->

<!-- TODO: Make this a component that can be imported somehow -->

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});
```

> Create a **List** called `Todo`, containing a single **Field** `task`, with a **Type** of `Text`

## Lists

You can create as many lists as your project needs:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});
```

And each list can have as many fields as you need.

Keystone will process each List, converting it into a series of GraphQL CRUD
(**C**reate, **R**ead, **U**pdate, **D**elete) operations. For example, the above lists will generate:

```graphql
type Mutation {
  createTodo(...): Todo
  updateTodo(...): Todo
  deleteTodo(...): Todo
  createUser(...): User
  updateUser(...): User
  deleteUser(...): User
}

type Query {
  allTodos(...): [Todo]
  Todo(...): Todo
  allUsers(...): [User]
  User(...): User
}

type Todo {
  id: ID
  task: String
}

type User {
  id: ID
  name: String
  email: String
}
```

> **Note:** Only a subset of the generated types/mutations/queries are shown here.
> For more details, see the [GraphQL introduction guide](/docs/guides/intro-to-graphql.md).

### Customising lists and fields

Both lists and fields can accept further options:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text, isRequired: true },
  },
  adminConfig: {
    defaultPageSize: 20,
  },
});
```

In this example, the `adminConfig` options will apply only to the `Todo` list
(setting how many items are shown per page in the [Admin UI](/packages/app-admin-ui/README.md)).
The `isRequired` option will ensure an API error
is thrown if a `task` value is not provided when creating/updating items.

<!-- TODO: Screenshot -->

_For more List options, see the [`createList()` API docs](/docs/api/create-list.md)._

_[There are many different field types available](/packages/fields/README.md),
each specifying their own options._

### Related lists

One of Keystone' most powerful features is defining **Relationships** between
Lists.

Relationships are a special field type in Keystone used to generate rich
GraphQL operations and an intuitive Admin UI, especially useful for complex
data modeling requirements.

#### Why relationships?

_Already know Relationships? [Skip to **Defining Relationships** below](#defining-relationships)._

To understand the power of Relationships, let's imagine a world without them:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text, isRequired: true },
    createdBy: { type: Text },
  },
});
```

In this example, every todo has a user it belongs to (the `createdBy` field). We
can query for all todos owned by a particular user, update the user, etc.

Let's imagine we have a single item in our `Todo` list:

| `id` | `task`       | `createdBy` |
| ---- | ------------ | ----------- |
| 1    | Use Keystone | Tici        |

We could query this data like so:

```graphql
query {
  allTodos {
    task
    createdBy
  }
}

# output:
# {
#   allTodos: [
#     { task: 'Use Keystone', createdBy: 'Tici' }
#   ]
# }
```

Everything looks great so far. Now, let's add another task:

##### Todo

| `id` | `task`       | `createdBy` |
| ---- | ------------ | ----------- |
| 1    | Use Keystone | Tici        |
| 2    | Setup linter | Tici        |

```graphql
query {
  allTodos {
    task
    createdBy
  }
}

# output:
# {
#   allTodos: [
#     { task: 'Use Keystone', createdBy: 'Tici' }
#     { task: 'Setup linter', createdBy: 'Tici' }
#   ]
# }
```

Still ok.

What if we add a new field:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text, isRequired: true },
    createdBy: { type: Text },
    email: { type: Text },
  },
});
```

##### Todo

| `id` | `task`       | `createdBy` | `email`          |
| ---- | ------------ | ----------- | ---------------- |
| 1    | Use Keystone | Tici        | tici@example.com |
| 2    | Setup Linter | Tici        | tici@example.com |

```graphql
query {
  allTodos {
    task
    createdBy
    email
  }
}

# output:
# {
#   allTodos: [
#     { task: 'Use Keystone', createdBy: 'Tici', email: 'tici@example.com' }
#     { task: 'Setup linter', createdBy: 'Tici', email: 'tici@example.com' }
#   ]
# }
```

Now we're starting to see multiple sets of duplicated data (`createdBy` +
`email` are repeated). If we wanted to update the `email` field, we'd have to
find all items, change the value, and save it back. Not so bad with 2 items, but
what about 300? 10,000? It can be quite a big operation to make these changes.

We can avoid the duplicate data by moving it out into its own `User` list:

##### Todo

| `id` | `task`       | `createdBy` |
| ---- | ------------ | ----------- |
| 1    | Use Keystone | 1           |
| 2    | Setup Linter | 1           |

##### User

| `id` | `name` | `email`          |
| ---- | ------ | ---------------- |
| 1    | Tici   | tici@example.com |

The `createdBy` field is no longer a name, but instead refers to the `id` of an
item in the `User` list (commonly referred to as _[data
normalization](https://en.wikipedia.org/wiki/Database_normalization)_).

This gives us only one place to update `email`.

Now that we have two different lists, to get all the data now takes two queries:

```graphql
query {
  allTodos {
    task
    createdBy
  }
}

# output:
# {
#   allTodos: [
#     { task: 'Use Keystone', createdBy: 1 }
#     { task: 'Setup linter', createdBy: 1 }
#   ]
# }
```

We'd then have to iterate over each item and extract the `createdBy` id, to be
passed to a query such as:

```graphql
query {
  User(where: { id: "1" }) {
    name
    email
  }
}

# output:
# {
#   User: { name: 'Tici', email: 'tici@example.com' }
# }
```

Which we'd have to execute once for every `User` that was referenced by a
`Todo`'s `createdBy` field.

Using **Relationships** makes this a lot easier.

#### Defining Relationships

Relationships are defined using the `Relationship` field type, and require at
least 2 configured lists (one will refer to the other).

```javascript
const { Relationship } = require('@keystonejs/fields');

keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});
```

This is a [to-single relationship](#to-single-relationships) from the `Todo`
list to an item in the `User` list.

To query the data, we can write a single query which returns both the `Todo`s
and their related `User`s:

```graphql
query {
  allTodos {
    task
    createdBy {
      name
      email
    }
  }
}

# output:
# {
#   allTodos: [
#     { task: 'Use Keystone', createdBy: { name: 'Tici', email: 'tici@example.com' } }
#     { task: 'Setup linter', createdBy: { name: 'Tici', email: 'tici@example.com' } }
#   ]
# }
```

A note on definitions:

- **To-single / To-many** refer to _the number of related items_ (1, or more than 1).
- **One-way / Two-way** refer to _the direction of the query_.
- **Back References** refer to a special type of two-way relationships where _one
  field can update a related list's field as it changes_.

#### To-single Relationships

When you have a single related item you want to refer to, a _to-single_
relationship allows storing that item, and querying it via the GraphQL API.

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});
```

Here we've defined the `createdBy` field to be a `Relationship` type, and
configured its relation to be the `User` list by setting the `ref` option.

A query for a to-single relationship field will return an object with the
requested data:

```graphql
query {
  Todo(where: { id: "<todoId>" }) {
    createdBy {
      id
      name
    }
  }
}

# output:
# {
#   Todo: {
#     createdBy: { id: '1', name: 'Tici' }
#   }
# }
```

The data stored in the database for the `createdBy` field will be a single ID:

##### Todo

| `id` | `task`       | `createdBy` |
| ---- | ------------ | ----------- |
| 1    | Use Keystone | 1           |
| 2    | Setup Linter | 1           |

##### User

| `id` | `name` | `email`          |
| ---- | ------ | ---------------- |
| 1    | Tici   | tici@example.com |

#### To-many Relationships

When you have multiple items you want to refer to from a single field, a
_to-many_ relationship will store an array, also exposing that array via the
GraphQL API.

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todoList: { type: Relationship, ref: 'Todo', many: true },
  },
});
```

A query for a to-many relationship field will return an array of objects with
the requested data:

```graphql
query {
  User(where: { id: "<userId>" }) {
    todoList {
      task
    }
  }
}

# output:
# {
#   User: {
#     todoList: [
#       { task: 'Use Keystone' },
#       { task: 'Setup linter' },
#     ]
#   ]
# }
```

The data stored in the database for the `todoList` field will be an array of
IDs:

##### Todo

| `id` | `task`       |
| ---- | ------------ |
| 1    | Use Keystone |
| 2    | Setup Linter |
| 3    | Be Awesome   |
| 4    | Write docs   |
| 5    | Buy milk     |

##### User

| `id` | `name` | `email`          | `todoList` |
| ---- | ------ | ---------------- | ---------- |
| 1    | Tici   | tici@example.com | [1, 2]     |
| 2    | Jess   | jess@example.com | [3, 4, 5]  |

#### Two-way Relationships

In the [to-single](#to-single-relationships) and
[to-many](#to-many-relationships) examples above, we were only querying _in one
direction_; always from the list with the Relationship field.

Often, you will want to query _in both directions_ (aka _two-way_). For example:
you may want to list all Todo tasks for a User _and_ want to list the User who
owns a Todo.

A two-way relationship requires having a `Relationship` field on both lists:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todoList { type: Relationship, ref: 'Todo', many: true },
  }
});
```

Here we have two relationships:

- A _to-single_ `createdBy` field on the `Todo` list, and
- A _to-many_ `todoList` field on the `User` list.

Now it's possible to query in both directions:

```graphql
query {
  User(where: { id: "<userId>" }) {
    todoList {
      task
    }
  }

  Todo(where: { id: "<todoId>" }) {
    createdBy {
      id
      name
    }
  }
}

# output:
# {
#   User: {
#     todoList: [
#       { task: 'Use Keystone' },
#       { task: 'Setup linter' },
#     ]
#   ],
#   Todo: {
#     createdBy: { id: '1', name: 'Tici' }
#   }
# }
```

The database would look like:

##### Todo

| `id` | `task`       | `createdBy` |
| ---- | ------------ | ----------- |
| 1    | Use Keystone | 1           |
| 2    | Setup Linter | 1           |
| 3    | Be Awesome   | 2           |
| 4    | Write docs   | 2           |
| 5    | Buy milk     | 2           |

##### User

| `id` | `name` | `email`          | `todoList` |
| ---- | ------ | ---------------- | ---------- |
| 1    | Tici   | tici@example.com | [1, 2]     |
| 2    | Jess   | jess@example.com | [3, 4, 5]  |

Note the two relationship fields in this example _know nothing about each other_.
They are not specially linked. This means if you update data in one place, you
must update it in both. To automate this and link two relationship fields, read
on about `Relationship Back References` below.

#### Relationship Back References

There is a special type of [two-way relationship](#two-way-relationships) where
_one field can update a related list's field as it changes_. The mechanism
enabling this is called _Back References_.

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todoList { type: Relationship, ref: 'Todo', many: true },
  }
});
```

In this example, when a new `Todo` item is created, we can set the `createdBy`
field as part of the mutation:

```graphql
mutation {
  createTodo(data: {
    task: 'Learn Node',
    createdBy: { connect: { id: '1' } },
  }) {
    id
  }
}
```

_See [the Relationship API docs for more on `connect`](/packages/fields/src/types/Relationship/README.md)._

If this was the first `Todo` item created, the database would now look like:

##### Todo

| `id` | `task`     | `createdBy` |
| ---- | ---------- | ----------- |
| 1    | Learn Node | 1           |

##### User

| `id` | `name` | `email`          | `todoList` |
| ---- | ------ | ---------------- | ---------- |
| 1    | Tici   | tici@example.com | \[]        |

Notice the `Todo` item's `createdBy` field is set, but the `User` item's
`todoList` does _not_ contain the ID of the newly created `Todo`!

If we were to query the data now, we would get:

```graphql
query {
  User(where: { id: "1" }) {
    todoList {
      id
      task
    }
  }

  Todo(where: { id: "1" }) {
    createdBy {
      id
      name
    }
  }
}

# output:
# {
#   User: {
#     todoList: []
#   ],
#   Todo: {
#     createdBy: { id: '1', name: 'Tici' }
#   }
# }
```

_Back References_ solve this problem.

To setup a back reference, we need to specify both the list _and the field_ in
the `ref` option:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    // The `ref` option now includes which field to update
    createdBy: { type: Relationship, ref: 'User.todoList' },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todoList: { type: Relationship, ref: 'Todo', many: true },
  },
});
```

This works for both [to-single](#to-single-relationships) and
[to-many](#to-many-relationships) relationships.

Now, if we run the same mutation:

```graphql
mutation {
  createTodo(data: {
    task: 'Learn Node',
    createdBy: { connect: { id: '1' } },
  }) {
    id
  }
}
```

Our database would look like:

##### Todo

| `id` | `task`     | `createdBy` |
| ---- | ---------- | ----------- |
| 1    | Learn Node | 1           |

##### User

| `id` | `name` | `email`          | `todoList` |
| ---- | ------ | ---------------- | ---------- |
| 1    | Tici   | tici@example.com | [1]        |

```graphql
query {
  User(where: { id: "1" }) {
    todoList {
      id
      task
    }
  }

  Todo(where: { id: "1" }) {
    createdBy {
      id
      name
    }
  }
}

# output:
# {
#   User: {
#     todoList: [{ id: '1', task: 'Learn Node' }]
#   ],
#   Todo: {
#     createdBy: { id: '1', name: 'Tici' }
#   }
# }
```

We can do the same modification for the `User` list, and reap the same rewards
for creating a new `User`:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    // The `ref` option now includes which field to update
    createdBy: { type: Relationship, ref: 'User.todoList' },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todoList { type: Relationship, ref: 'Todo.createdBy', many: true },
  }
});
```

In this case, we'll create the first task along with creating the user. _For
more info on the `create` syntax, see
[the Relationship API docs](/packages/fields/src/types/Relationship/README.md)._

```graphql
mutation {
  createUser(data: {
    name: 'Tici',
    email: 'tici@example.com',
    todoList: { create: [{ task: 'Learn Node' }] },
  }) {
    id
  }
}
```

The data would finally look like:

##### Todo

| `id` | `task`     | `createdBy` |
| ---- | ---------- | ----------- |
| 1    | Learn Node | 1           |

##### User

| `id` | `name` | `email`          | `todoList` |
| ---- | ------ | ---------------- | ---------- |
| 1    | Tici   | tici@example.com | [1]        |
