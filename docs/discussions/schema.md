---
section: discussions
title: Data modeling - Lists & Fields
---

# Schema - Lists & Fields

KeystoneJS is comprised of 3 distinct pieces, which can be described as:

<pre>
  <code>
    Schema => (&#x0007B; <a href="../tutorials/admin-ui">AdminUI</a>, <a href="../tutorials/intro-to-graphql">GraphQL</a> &#x0007D;)
  </code>
</pre>

A **Schema Definition** (_often abbreviated to 'Schema'_) is defined by
- a set of **Lists**
- containing one or more **Fields**
- which each have a **Type**.
<!-- TODO: Link to glossary -->

<!-- TODO: Make this a component that can be imported somehow -->
<div style={{
  backgroundColor: '#f3f5f7',
  padding: '1rem 2rem',
  border: '3px solid #e7e9ed',
}}>
  <center><strong>Minimal Schema Example</strong></center>

  ```javascript
  keystone.createList('Todo', {
    fields: {
      task: { type: Text }
    }
  });
  ```

  <center>
    <em>
      Create a <strong>List</strong> called <code>Todo</code>, containing a single <strong>Field</strong> <code>task</code>, with a <strong>Type</strong> of <code>Text</code>
    </em>
  </center>
</div>

## Lists

You can create as many lists as your project needs:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text }
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  }
});
```

And each list can have as many fields as you need.

KeystoneJS will process each List, converting it into a series of GraphQL CRUD
(<strong>C</strong>reate, <strong>R</strong>ead, <strong>U</strong>pdate, <strong>D</strong>elete) operations. For example, the above lists will generate;

```graphql
type Mutation {
  createTodo(..): Todo
  updateTodo(..): Todo
  deleteTodo(..): Todo
  createUser(..): User
  updateUser(..): User
  deleteUser(..): User
}

type Query {
  allTodos(..): [Todo]
  Todo(..): Todo
  allUsers(..): [User]
  User(..): User
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

_(NOTE: Only a subset of all the generated types/mutations/queries are shown
here. To see a more complete example [follow the Quick Start](../quick-start).)_

### Customizing Lists &amp; Fields

Both lists and fields can accept further options:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text, isRequired: true }
  },
  adminConfig: {
    defaultPageSize: 20,
  }
});
```

In this example, the `adminConfig` options will apply only to the `Todo` list
(setting how many items are shown per page in the [Admin
UI](../tutorials/admin-ui.md)). The `isRequired` option will ensure an API error
is thrown if a `task` value is not provided when creating/updating items.

<!-- TODO: Screenshot -->

_For more List options, see the [`createList()` API
docs](../api/create-list.md)._

_[There are many different field types available](../../keystone-alpha/fields/),
each specifying their own options._

### Related Lists

One of KeystoneJS' most powerful features is defining **Relationships** between
Lists.

Relationships are a special field type in KeystoneJS used to generate rich
GraphQL operations and an intuitive Admin UI, especially useful for complex
data modeling requirements.

#### Why Relationships?

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

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|--------|
| 1    | Use Keystone | Tici   |

</div>

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

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|--------|
| 1    | Use Keystone | Tici   |
| 2    | Setup linter | Tici   |

</div>

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

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` | `email`          |
|------|--------------|--------|------------------|
| 1    | Use Keystone | Tici   | tici@example.com |
| 2    | Setup Linter | Tici   | tici@example.com |

</div>

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

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|--------|
| 1    | Use Keystone | 1      |
| 2    | Setup Linter | 1      |

</div>
<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>User</strong></code>

| `id` | `name` | `email`          |
|------|--------|------------------|
| 1    | Tici   | tici@example.com |

</div>

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
const { Relationship } = require('@keystone-alpha/fields');

keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  }
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
- **Backlinks** refer to a special type of two-way relationships where _one
  field can update a related list's field as it changes_.

#### To-single Relationships

When you have a single related item you want to refer to, a _To-single_
relationship allows storing that item, and querying it via the GraphQL API.

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  }
});
```

Here we've defined the `createdBy` field to be a `Relationship` type, and
configured its relation to be the `User` list by setting the `ref` option.

A query for a To-single Relationship field will return an object with the
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

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|-------------|
| 1    | Use Keystone | 1           |
| 2    | Setup Linter | 1           |

</div>

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>User</strong></code>

| `id` | `name` | `email`          |
|------|--------|------------------|
| 1    | Tici   | tici@example.com |

</div>

#### To-many Relationships

When you have multiple items you want to refer to from a single field, a
_to-many_ relationship will store an array, also exposing that array viat the
GraphQL API.

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todolist { type: Relationship, ref: 'Todo', many: true },
  }
});
```

A query for a To-many Relationship field will return an array of objects with
the requested data:

```graphql
query {
  User(where: { id: "<userId>" }) {
    todolist {
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

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       |
|------|--------------|
| 1    | Use Keystone |
| 2    | Setup Linter |
| 3    | Be Awesome   |
| 4    | Write docs   |
| 5    | Buy milk     |

</div>

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>User</strong></code>

| `id` | `name` | `email`          | `todolist` | 
|------|--------|------------------|------------| 
| 1    | Tici   | tici@example.com | [1, 2]     | 
| 2    | Jess   | jess@example.com | [3, 4, 5]  | 

</div>

#### Two-way Relationships

In the [to-single](#to-single-relationships) and
[to-many](#to-many-relationships) examples above, we were only querying _in one
direction_; always from the list with the Relationship field.

Often, you will want to query _in both directions_ (aka _two-way_). For example;
you may want to list all Todo tasks for a User, _and_ want to list the User who
owns a Todo.

A Two-way relationship requires having a `Relationship` field on both lists:

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todolist { type: Relationship, ref: 'Todo', many: true },
  }
});
```

Here we have two relationships:
- A _to-single_ `createdBy` field on the `Todo` list, and
- A _to-many_ `totolist` field on the `User` list.

Now it's possible to query in both directions:

```graphql
query {
  User(where: { id: "<userId>" }) {
    todolist {
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

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|-------------|
| 1    | Use Keystone | 1           |
| 2    | Setup Linter | 1           |
| 3    | Be Awesome   | 2           |
| 4    | Write docs   | 2           |
| 5    | Buy milk     | 2           |

</div>

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>User</strong></code>

| `id` | `name` | `email`          | `todolist` | 
|------|--------|------------------|------------| 
| 1    | Tici   | tici@example.com | [1, 2]     | 
| 2    | Jess   | jess@example.com | [3, 4, 5]  | 

</div>

Note the two Relationship fields in this example _know nothing about eachother_.
They are not specially linked. This means if you update data in one place, you
must update it in both. To automate this and link two Relationship fields, read
on about _[Relationship Back References](#relationship-back-references)_.

#### Relationship Back References

There is a special type of [two-way relationship](#two-way-relationships) where
_one field can update a related list's field as it changes_. The mechanism
enabling this is called _Back References_.

```javascript
keystone.createList('Todo', {
  fields: {
    task: { type: Text },
    createdBy: { type: Relationship, ref: 'User' },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todolist { type: Relationship, ref: 'Todo', many: true },
  }
});
```

In this exaple, when a new `Todo` item is created, we can set the `createdBy`
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

_See [the Relationship API docs for more on
`connect`](../../keystone-alpha/fields/src/types/relationship)._

If this was the first `Todo` item created, the database would now look like:

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|-------------|
| 1    | Learn Node   | 1           |

</div>

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>User</strong></code>

| `id` | `name` | `email`          | `todolist` |
|------|--------|------------------|------------|
| 1    | Tici   | tici@example.com | []         |

</div>

Notice the `Todo` item's `createdBy` field is set, but the `User` item's
`todolist` does _not_ contain the ID of the newly created `Todo`!

If we were to query the data now, we would get:

```graphql
query {
  User(where: { id: "1" }) {
    todolist {
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
    createdBy: { type: Relationship, ref: 'User.todolist' },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todolist { type: Relationship, ref: 'Todo', many: true },
  }
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

Our database would like:

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|-------------|
| 1    | Learn Node   | 1           |

</div>

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>User</strong></code>

| `id` | `name` | `email`          | `todolist` |
|------|--------|------------------|------------|
| 1    | Tici   | tici@example.com | [1]         |

</div>

```graphql
query {
  User(where: { id: "1" }) {
    todolist {
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
    createdBy: { type: Relationship, ref: 'User.todolist' },
  }
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    todolist { type: Relationship, ref: 'Todo.createdBy', many: true },
  }
});
```

In this case, we'll create the first task along with creating the user. _For
more info on the `create` syntax, see [the Relationship API
docs](../../keystone-alpha/fields/src/types/relationship/)._

```graphql
mutation {
  createUser(data: {
    name: 'Tici',
    email: 'tici@example.com',
    todolist: { create: [{ task: 'Learn Node' }] },
  }) {
    id
  }
}
```

The data would finally look like:

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>Todo</strong></code>

| `id` | `task`       | `createdBy` |
|------|--------------|-------------|
| 1    | Learn Node   | 1           |

</div>

<div style={{ border: '1px solid lightgray', padding: '1rem' }}>
<code><strong>User</strong></code>

| `id` | `name` | `email`          | `todolist` |
|------|--------|------------------|------------|
| 1    | Tici   | tici@example.com | [1]         |

</div>
