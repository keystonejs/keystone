<!--[meta]
section: guides
title: GraphQL Philosophy
subSection: graphql
order: 3
[meta]-->

# GraphQL Philosophy

> 💡 _This is a conceptural introduction to how the Keystone team think about GraphQL APIs (and hence how Keystone's GraphQL API is generated). For more specific API docs, see [**Introduction to the GraphQL API**](/guides/intro-to-graphql)._

## Goals

A good GraphQL API is a combination of the following criteria:

- **Quick prototyping** no matter the client (mobile, desktop, other APIs, etc)
- Be **obvious**, **consistent**, and **predictable**
- Is mostly **CRUD-based** with escape hatches for **Custom Operations**
- Match developer's **domain knowledge**
- Be **forward compatible** with future unknown use-cases
- Fully **leverage the _Graph_** of GraphQL through Relationships

## Keystone's Schema Design

Keystone's auto-generated GraphQL Schema meets these goals by following a pattern with two distinct sets of things:

1. **Domain Objects**

   Modelled with CRUD (_Create, Read, Update, Delete_) operations, this covers the majority of functionality for most applications.

   For example; the `User` type would have `createUser` / `getUser` / `updateUser` / `deleteUser` mutations.

2. **Custom Operations**.

   Become apparent over time while building applications and adding to the schema.

   For example; an `authenticateUser` / `submitTPSReport` mutation, or a `recentlyActiveUsers` query.

<p align="center">
  <img src="./img/tweet-graphql-2-things.png" alt="Tweet by Jess Telford: In my experience, the best GraphQL APIs have 2 distinct sets of things: 1. Domain Objects are modelled as type with CRUD mutations (`createUser`/`updateUser`/etc). 2. Common actions involving 0 or more Domain Objects are mutations (`sendEmail`/`finalizeTPSReport`)" width="500" />
</p>

<sub align="center">

_[Tweet](https://twitter.com/JessTelford/status/1179175687560630272) by [Jess Telford](https://twitter.com/JessTelford)_

</sub>

<br />

### Domain Objects & CRUD Operations

Every _thing_ in your application / website / database which can be queried or modified in some way is a Domain Object. Each Domain Object has its own set of CRUD operations.

By modeling a schema in this way, it enables fast iteration with a consistent and predictable set of mutations and queries for every Domain Object.

To define a set of Domain Objects, it helps to think about it in terms of what a user will see. A blog site may have a series of Domain Objects, each with their own CRUD operations:

| Domain Object | C               | R            | U               | D               |
| ------------- | --------------- | ------------ | --------------- | --------------- |
| **Users**     | `createUser`    | `getUser`    | `updateUser`    | `deleteUser`    |
| **Posts**     | `createPost`    | `getPost`    | `updatePost`    | `deletePost`    |
| **Comments**  | `createComment` | `getComment` | `updateComment` | `deleteComment` |
| **Images**    | `createImage`   | `getImage`   | `updateImage`   | `deleteImage`   |

> 🤔 Why is **Images** its own Domain Object, and not part of the **Posts**?
>
> Because Images may be uploaded and interacted with independently of a Post, or used across multiple posts. Even if they're only used in a single Post, they still meet the definition as a _thing_ which might be queried or modified in some way (for example, querying for a thumbnail version of the image, or updating alt text).
>
> 💡 In general, Domain Objects map to Lists in Keystone:
>
> ```javascript
> keystone.createList('User', {
>   /* ... */
> });
> keystone.createList('Post', {
>   /* ... */
> });
> keystone.createList('Comment', {
>   /* ... */
> });
> keystone.createList('Image', {
>   /* ... */
> });
> ```

#### Related Domain Objects

To fully leverage the _Graph_ of GraphQL, relationships between Domain Objects must be defined in a way that allows for both **querying** and **mutating** related data.

GraphQL gives us _querying_ thanks to their type system:

```graphql
type User {
  name: String
}

type Post {
  title: String
  author: User
}

type Query {
  getPost(id: ID): Post
}
```

Here you can see the `Post.author` field is defined as a relationship to a `User`. When doing a query, it follows a predictable pattern:

```graphql
query {
  getPost(id: "abc123") {
    title
    author {
      name
    }
  }
}
```

Defining _mutations_ requires a bit more setup and consideration to performing _nested mutations_.

> _💡 Keystone implements this pattern with the `Relationship` type_

Nested Mutations are useful when you need to make changes to more than one Domain Object at a time. Just like you may want to query for `Post.author` at the same time as getting `Post.title`, you may want to update `User.name` at the same time as you create a new `Post`.

For example, imagine a UI where an author could update their bio at the same time as creating a post. The mutation would look something like:

```graphql
mutation {
  createPost(data: { title: "Hello World", author: { update: { bio: "Hi, I'm a writer now!" } } }) {
    title
  }
}
```

Note the `data.author.update` object, this is the _Nested Mutation_. Beyond `update` there are also other operations you may wish to perform:

| Operation    |                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `connect`    | Connect an existing item to the parent so future queries for related data return the connected item                       |
| `disconnect` | Break the connection with an existing item (but do not delete that item) so future queries for related data return `null` |
| `create`     | Create a new related item and connect it to the parent so future queries for related data return this item                |
| `update`     | Update an already connected item's data                                                                                   |
| `delete`     | Delete an already connected item and disconnect it from the parent so future queries for related data return `null`       |

> 🤔 Where is `get`?
>
> Since `get` is a query concern, and we're only dealing with Nested _Mutations_, it is not included here.

This might be represented in the GraphQL Schema like so:

```graphql
type User {
  name: String
  bio: String
}

type Post {
  title: String
  author: User
}

input CreateUserInput {
  name: String
  bio: String
}

input UpdateUserInput {
  id: ID!
  name: String
  bio: String
}

input CreatePostInput {
  title: String
  author: UserToOneRelationshipInput
}

input UpdatePostInput {
  id: ID!
  title: String
  author: UserToOneRelationshipInput
}

input UpdateUserToOneRelationship {
  create: CreateUserInput
  update: UpdateUserInput
  delete: ID
  connect: ID
  disconnect: ID
}

type Mutation {
  createPost(data: CreatePostInput): Post
  updatePost(data: UpdatePostInput): Post
  createUser(data: CreateUserInput): User
  updateUser(data: UpdateUserInput): User
}
```

### Custom Operations

Custom Operations are an emergent property of the schema design. They are not something which should be defined up front.

As products are built, it will become obvious which operations are missing and what their inputs/outputs should be.

For example, while building out the TPS application, it became evident that at some point a TPS Report had to be printed and handed directly to a boss. There is no CRUD operation which can trigger printing a report. There are, however, the _Printing_ and _Courier_ services. A custom mutation can be made which uses both those services to complete the operation: `submitTPSReport`.

```javascript
const typeDefs = `
  type Mutation {
    submitTPSReport(TPSReportId: String, bossId: String): Boolean
  }
`;

const resolvers = {
  Mutation: {
    submitTPSReport: async (_, { TPSReportId, bossId }) => {
      await printService.printTPSReport(TPSReportId);
      const address = await getAddress(bossId);
      await courierService.submitJob({ from: 'printer', to: address });
      return true;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
```
