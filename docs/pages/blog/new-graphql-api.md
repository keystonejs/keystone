---
title: "A new & improved GraphQL API"
description: "Keystone 6 has an improved GraphQL API that's easier to work with and reason about."
publishDate: "2021-8-17"
authorName: "Ronald Aveling"
authorHandle: "https://twitter.com/ronaldaveling"
metaImageUrl: ""
---

As we move closer to a _General Availability_ release for Keystone 6, we've taken the opportunity to make the experience of working with Keystone's GraphQL API easier to program and reason about.

This guide describes the improvements we've made, and walks you through the steps you need to take to upgrade your Keystone projects.

{% hint kind="tip" %}
If you have any questions, please don't hesitate to open a [GitHub discussion](https://github.com/keystonejs/keystone/discussions/new?category=questions).
{% /hint %}

## Example Schema

To illustrate the changes, we'll refer to the `Task` list in the following schema, from our [Task Manager](https://github.com/keystonejs/keystone/tree/main/examples/task-manager) example project.

```ts
export const lists = {
  Task: list({
    fields: {
      label: text({ validation: { isRequired: true } }),
      priority: select({
        type: 'enum',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: 'Person.tasks', many: false }),
      tags: relationship({ ref: 'Tag', many: true }),
      finishBy: timestamp(),
    },
  }),
  Person: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
  Tag: list({
    fields: {
      name: text(),
    },
  }),
};
```

## Query

We've changed the names of our top-level queries so they're easier to understand.
We also took this opportunity to remove deprecated and unused legacy features.

### Changes

| Action                                               | Item                                                           | Before            | After          |
| ---------------------------------------------------- | -------------------------------------------------------------- | ----------------- | -------------- |
| 🔁 &nbsp; Renamed       | Generated query for a single item                              | `Task()`          | `task()`       |
| 🔁 &nbsp; Renamed       | Generated query for multiple items                             | `allTasks()`      | `tasks()`      |
| 🔁 &nbsp; Renamed       | Pagination argument to align with arguments provided by Prisma | `first`           | `take`         |
| ❌ &nbsp; Removed | Legacy `search` argument                                       | `search`          | `where`        |
| ❌ &nbsp; Removed | Deprecated `sortBy` argument                                   | `sortBy`          | `orderBy`      |
| ❌ &nbsp; Removed | Deprecated `_allTasksMeta` query                               | `_allTasksMeta()` | `tasksCount()` |

{% hint kind="tip" %}
We've also changed the format of filters used in `TaskWhereInput`. See [Filter changes](#filters) for more details.
{% /hint %}

### Example {% #query-example %}

```graphql
// Before

type Query {
  allTasks(
    where: TaskWhereInput! = {}
    search: String
    sortBy: [SortTasksBy!]
      @deprecated(reason: "sortBy has been deprecated in favour of orderBy")
    orderBy: [TaskOrderByInput!]! = []
    first: Int
    skip: Int! = 0
  ): [Task!]
  Task(where: TaskWhereUniqueInput!): Task
  _allTasksMeta(
    where: TaskWhereInput! = {}
    search: String
    sortBy: [SortTasksBy!]
      @deprecated(reason: "sortBy has been deprecated in favour of orderBy")
    orderBy: [TaskOrderByInput!]! = []
    first: Int
    skip: Int! = 0
  ): _QueryMeta
    @deprecated(
      reason: "This query will be removed in a future version. Please use tasksCount instead."
    )
  tasksCount(where: TaskWhereInput! = {}): Int
  ...
}

// After
type Query {
  tasks(
    where: TaskWhereInput! = {}
    orderBy: [TaskOrderByInput!]! = []
    take: Int
    skip: Int! = 0
  ): [Task!]
  task(where: TaskWhereUniqueInput!): Task
  tasksCount(where: TaskWhereInput! = {}): Int
  ...
}
```

## Filters

The filter arguments used in queries have been updated to accept a filter object for each field, rather than having all the filter options available at the top level.

An example of a query in the old format is:

```graphql
allTasks(
  where: {
    label_starts_with: "Hello",
    finishBy_lt: "2022-01-01T00:00:00.000Z",
    isComplete: true
  }
) { id }
```

Using the new filter syntax, this becomes:

```graphql
tasks(
  where: {
    label: { startsWith: "Hello" }
    finishBy: { lt: "2022-01-01T00:00:00.000Z" }
    isComplete: { equals: true }
  }
) { id }
```

There is a one-to-one correspondence between the old filters and the new filters.
No filter functionality has been removed or added, however the individual filters are now in a nested object, and the names have changed from `snake_case` to `camelCase`.

{% hint kind="warn" %}
**Note:** The old filter syntax used `{ fieldName: value }` to test for equality. The new syntax requires you to make this explicit, and write `{ fieldName: { equals: value} }`.
{% /hint %}

{% hint kind="tip" %}
See the [Filters Guide](/docs/guides/filters) for a detailed walk through the new filtering syntax.
{% /hint %}

{% hint kind="tip" %}
See the [API docs](/docs/graphql/filters) for a comprehensive list of all the new filters for each field type.
{% /hint %}

## Mutations

All generated CRUD mutations have the same names and return types, but their inputs have changed.

- `update` and `delete` mutations no longer accept `id` or `ids` to indicate which items to update. We now use `where` so you can select the item based on any of its unique fields.
- The **types** used for `create` and `update` mutations [have been updated](#input-types).
- All inputs are now **non-optional**.

#### Create mutation

| Before                                          | After                                            |
| ----------------------------------------------- | ------------------------------------------------ |
| `createTask(data: TaskCreateInput): Task`       | `createTask(data: TaskCreateInput!): Task`       |
| `createTasks(data: [TasksCreateInput]): [Task]` | `createTasks(data: [TaskCreateInput!]!): [Task]` |

```graphql
// Before
mutation {
  createTask(data: { label: "Upgrade keystone" }) {
    id
  }
}

mutation {
  createTasks(
    data: [
      { data: { label: "Upgrade keystone" } }
      { data: { label: "Build great products" } }
    ]
  ) {
    id
  }
}

// After
mutation {
  createTask(data: { label: "Upgrade keystone" }) {
    id
  }
}

mutation {
  createTasks(
    data: [
      { label: "Upgrade keystone" },
      { label: "Build great products" }
    ]
  ) {
    id
  }
}
```

#### Update mutation

| Before                                             | After                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| `updateTask(id: ID!, data: TaskUpdateInput): Task` | `updateTask(where: TaskWhereUniqueInput!, data: TaskUpdateInput!): Task` |
| `updateTasks(data: [TasksUpdateInput]): [Task]`    | `updateTasks(data: [TaskUpdateArgs!]!): [Task]`                          |

```graphql
// Before
mutation {
  updateTask(id: "cksdyag9w0000pioj44kinqsp", data: { isComplete: true }) {
    id
  }

  updateTasks(
    data: [
      { id: "cksdyaga50007pioj1oc37msr", data: { isComplete: true } }
      { id: "cksdyj6wd0000epoj0585uzbq", data: { isComplete: true } }
    ]
  ) {
    id
  }
}

// After
mutation {
  updateTask(
    where: { id: "cksdyag9w0000pioj44kinqsp" }
    data: { isComplete: true }
  ) {
    id
  }

  updateTasks(
    data: [
      { where: { id: "cksdyaga50007pioj1oc37msr" }, data: { isComplete: true } }
      { where: { id: "cksdyj6wd0000epoj0585uzbq" }, data: { isComplete: true } }
    ]
  ) {
    id
  }
}
```

#### Delete mutation

| Before                            | After                                                  |
| --------------------------------- | ------------------------------------------------------ |
| `deleteTask(id: ID!): Task`       | `deleteTask(where: TaskWhereUniqueInput!): Task`       |
| `deleteTasks(ids: [ID!]): [Task]` | `deleteTasks(where: [TaskWhereUniqueInput!]!): [Task]` |

```graphql
// Before
mutation {
  deleteTask(id: "cksdyaga50007pioj1oc37msr") {
    id
  }

  deleteTasks(ids: ["cksdyjrbj0007epojilbv3d6k", "cksdyjrbp0014epoja2uddwl1"]) {
    id
  }
}

// After
mutation {
  deleteTask(where: { id: "cksdyag9w0000pioj44kinqsp" }) {
    id
  }

  deleteTasks(
    where: [
      { id: "ckrlp28lf001908lu9tyzxhuq" }
      { id: "ckroflp7h0019t9lulhw6pggp" }
    ]
  ) {
    id
  }
}
```

## Input Types

We've updated the input types used for relationship fields in `update` and `create` operations, removing obsolete options and making the syntax between the two operations easier to differentiate.

- There are now separate types for `create` and `update` operations.
- Inputs for `create` operations no longer support the `disconnect` or `disconnectAll` options. These options didn't do anything during a `create` operation in the previous API.
- For to-one relationships, the `disconnect` option is now a `Boolean`, rather than accepting a unique input. If you only have one related item, there's no need to specify its value when disconnecting it.
- For to-many relationships, the `disconnectAll` operation has been removed in favour of a new `set` operation, which allows you to explicitly set the connected items.
  You can use `{ set: [] }` to achieve the same results as the old `{ disconnectAll: true }`.

### Example {% #input-types-example %}

```graphql
// Before

input TasksUpdateInput {
  id: ID!
  data: TaskUpdateInput
}

input TaskUpdateInput {
  label: String
  priority: TaskPriorityType
  isComplete: Boolean
  assignedTo: PersonRelateToOneInput
  tags: TagRelateToManyInput
  finishBy: String
}

input TasksCreateInput {
  data: TaskCreateInput
}

input TaskCreateInput {
  label: String
  priority: TaskPriorityType
  isComplete: Boolean
  assignedTo: PersonRelateToOneInput
  tags: TagRelateToManyInput
  finishBy: String
}

input PersonRelateToOneInput {
  create: PersonCreateInput
  connect: PersonWhereUniqueInput
  disconnect: PersonWhereUniqueInput
  disconnectAll: Boolean
}

input TagRelateToManyInput {
  create: [TagCreateInput]
  connect: [TagWhereUniqueInput]
  disconnect: [TagWhereUniqueInput]
  disconnectAll: Boolean
}

// After

input TaskUpdateArgs {
  where: TaskWhereUniqueInput!
  data: TaskUpdateInput!
}

input TaskUpdateInput {
  label: String
  priority: TaskPriorityType
  isComplete: Boolean
  assignedTo: PersonRelateToOneForUpdateInput
  tags: TagRelateToManyForUpdateInput
  finishBy: String
}

input TaskCreateInput {
  label: String
  priority: TaskPriorityType
  isComplete: Boolean
  assignedTo: PersonRelateToOneForCreateInput
  tags: TagRelateToManyForCreateInput
  finishBy: String
}

input PersonRelateToOneForUpdateInput {
  create: PersonCreateInput
  connect: PersonWhereUniqueInput
  disconnect: Boolean
}

input PersonRelateToOneForCreateInput {
  create: PersonCreateInput
  connect: PersonWhereUniqueInput
}

input TagRelateToManyForUpdateInput {
  disconnect: [TagWhereUniqueInput!]
  set: [TagWhereUniqueInput!]
  create: [TagCreateInput!]
  connect: [TagWhereUniqueInput!]
}

input TagRelateToManyForCreateInput {
  create: [TagCreateInput!]
  connect: [TagWhereUniqueInput!]
}
```

## Upgrade Checklist

While there are a lot of changes to this API, we've put a lot of effort into making the upgrade process as smooth as possible.

If you have any questions, please don't hesitate to open a [GitHub discussion](https://github.com/keystonejs/keystone/discussions/new?category=questions).

{% hint kind="tip" %}
Before you begin: check that your project doesn't rely on any of the features we've marked as deprecated in this document, or the `search` argument to filters. If you do, apply the recommended substitute.
{% /hint %}

1. Update top level queries. Be sure to rename `Task` to `task` and `allTasks` to `tasks` for all your queries.
2. Update filters. Find and replace all the old Keystone filters with their new equivalent.
3. Update mutation arguments to match the new input types. Make sure you replace `{ id: "..."}` with `{where: { id: "..."} }` in your `update` and `delete` operations.
4. Update relationship inputs to `create` and `update` operations. Ensure you've replaced usage of `{ disconnectAll: true }` with `{ set: [] }` in to-many relationships, and have used `{ disconnect: true }` rather than `{ disconnect: { id: "..."} }` in to-one relationships.

{% hint kind="tip" %}
Finally, make sure you apply corresponding changes to filters and input arguments when using the [Query API](/docs/context/query).
{% /hint %}

---

That's everything! While we acknowledge that API changes are an inconvenience, we believe the time spent navigating these upgrades will be offset many times over by a more fun and productive developer experience going forward.
