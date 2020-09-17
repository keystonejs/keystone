<!--[meta]
section: blog
title: Introduction to GraphQL
date: 2020-09-01
author: Mike Riethmuller
order: 2
[meta]-->

In this tutorial we're going to discuss some of the key differences between REST and GraphQL APIs then create a GraphQL server with Node.js. You will need to know basic HTML and JavaScript, how to run a few commands in a terminal, as well as have Node and NPM installed.

## What is an API?

Broadly speaking an API can be defined as a way for programmers to interface with an application. This often means an API describes the functions and methods available to developers within a specific development environment. If that development environment is the public web, an API will usually refer to URL "end-points" used for sending and receiving data.

## Rest APIs

The traditional method for interfacing with applications on the web is a REST API. One defining characteristic of REST APIs is they use [HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), such as `GET`, `PUT`, `POST` &`DELETE` to "CRUD" operations. Typically, `PUT` for Create, `GET` for Read, `POST` for Update and `DELETE` for Delete.

This structure makes REST predictable but also highlights some limitations. Since a request method is limited to a single `CRUD` operation, it encourages API design that has a single end-point for each entity in the system. For example, a simple website might have the following end-points:

- <http://my-api.com/user>
- <http://my-api.com/post>
- <http://my-api.com/comment>
- <http://my-api.com/page>

In large systems, this can lead to APIs with many dozen or even hundreds of end-points. This is a common criticism of REST.

Another criticism of REST is that a lot of APIs return a specific predefined shape. This means when you successfully "hit" an end-point, the data returned is determined by that end-point, not the request. This results in either fetching more data than you want, or perhaps more often, considerably less data than is required. Either outcome is not efficient.

These are some of the problems that GraphQL aims to solve.

## GraphQL APIs

GraphQL APIs usually have a single endpoint and allow the client to specify a `query` that returns only required data.

A GraphQL query looks something like a this:

```js
query getPage($id: Int!) {
  Page(id: $id) {
    author {
      name
    }
  }
}
```

This query is fetching the `name` of a `User`, that is attached to the `author` field of a `Page`.

For GraphQL to validate and execute this query, it must know what fields available for a `Page`, that the `author` field is a reference to a `User`, what fields are available for a `User` and finally how to resolve the data.

It achieves this through `schema` definitions and resolvers. Schemas and types are an essential part of a GraphQL API. To create a GraphQL API, you need a server with a complete set of `types` that describe every possible input and return value for the API. You also need resolver functions that return values that match the `schema` definition.

## Creating a GraphQL server

Let's create a GraphQL server that will handle queries and mutations for `Posts` and `Users`.

Start by creating a directory for the project with the following commands:

```
mkdir graphql-server-tutorial
cd graphql-server-tutorial
npm init --yes
```

We're going to use `apollo-server` to generate our API service and `http-server` to serve a static front-end. Run the following command to install these packages:

```
npm install apollo-server http-server
```

### Defining a GraphQL schema

The first thing we need to do is define the schema for our API. Start by creating an `index.js` file in the root of the project directory. At the top of the file add the following:

```js
const { ApolloServer, gql } = require('apollo-server');

const schema = gql`
  type User {
    id: ID!
    name: String
  }

  type Page {
    id: ID!
    title: String
    author: User
    content: String
  }

  type Query {
    Page(id: ID!): Page
    User(id: ID!): User
  }
`;
```

Both `String` and `ID` are built-in types GraphQL understands. We've created additional types for `User` and `Page`. You can probably see how types can be made up of nested types. This is how GraphQL queries can request deeply nested, related data in a way that REST APIs typically can't.

**Note:** We're creating a really simple schema here with just a `User` and a `Page`. It's useful to understand how this works but in a larger system, you might not want to define every part of the GraphQL schema by hand. Keystone generates a GraphQL schema and resolvers for you while allowing you to manually extend the generated graphQL schema.

### Defining resolvers

Resolvers fetch and return data for queries. The returned data must match the shape we defined in the schema.

The first thing we need is a data source. For the sake of this tutorial we're going to work with a fixed set of data. Add the following to `index.js`:

```js
const users = [
  {
    id: '1',
    name: 'Mike',
  },
];

const pages = [
  {
    id: '1',
    name: 'Hello World',
    author: users[0],
    content: 'Lorem ipsum...',
  },
];
```

Now let's write some resolvers that return this data:

```js
const resolvers = {
  Query: {
    Page: (_, args) => {
      return pages.find(page => page.id === args.id);
    },
    User: (_, args) => {
      return users.find(user => user.id === args.id);
    },
  },
};
```

Understanding `types` and `resolvers` can be one of the biggest stumbling blocks when getting started with GraphQL. This can be particularly difficult if you are not already familiar with typed languages however the GraphQL schema syntax can be a good introduction to these concepts.

### Starting Apollo

To start the server all we need to do is pass `ApolloServer` our complete schema and resolvers. Add the following to the bottom of `index.js`:

```js
const server = new ApolloServer({ typeDefs: schema, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 GraphQL server started at: ${url}`);
});
```

Open the generated `package.json` file and add a `start:server` command in the `scripts` section:

```json
"scripts": {
  "start:server": "node index.js"
}
```

Then run:

```
npm run start:server
```

Congratulations! You should have a GraphQL server up and running.

### Executing a GraphQL query

The query we wrote earlier should now work. Before we learn how to execute GraphQL queries in our own application let's test it out using the GraphQL Playground Apollo provides. Visit `http://localhost:4000` and paste the following query:

```js
query getPage($id: ID!) {
  Page(id: $id) {
    author {
      name
    }
  }
}
```

We still need to provide the `id`, so select "QUERY VARIABLES" in the bottom right and add the following JSON:

```
{
  "id":"1"
}
```

Now run the query and you should get the following result:

```
{
  author: {
    name: "Mike"
  }
}
```

<video style="max-width:100%;" autoplay>
  <source src="/gql-demo.mp4"  type="video/mp4"/>
</video>

To send this query in a client application we need to use a `POST` request. The POST request should be sent to our GraphQL server with a content type of `application/json` and a JSON-encoded body similar to:

```js
{
  "query": "...",
  "variables": { "id": "1" }
}
```

There are many client libraries that can make sending and receiving GraphQL queries easier, however, you don't need a client library to send a simple GraphQL request. We can send a GraphQL request using the browsers [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

Create a file called `index.html`. In that file place the following:

```html
<html>
  <body>
    <pre id="result"></pre>
    <script>
      // write code here
    </script>
  </body>
</html>
```

We'll write code directly in script tag inside this HTML file - just to demonstrate the concept.

Add the following script to the page:

```js
fetch('http://localhost:4000', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'query getPage($id: ID!) { Page(id: $id) { author { name } } }',
    variables: '{ "id": "1"}',
  }),
})
  .then(res => res.json())
  .then(res => {
    // render the data on the page and console
    console.log(res.data);
    document.querySelector('#result').innerHTML = JSON.stringify(res.data, null, 2);
  });
```

Let's add a start command for the client to our `package.json`:

```json
"scripts": {
  "start:server": "node index.js",
  "start:client": "npx http-server ."
}
```

With the server running, open new terminal window and run:

```
npm run start:client
```

Visit `http://localhost:8080` in your browser and you should see the result of the query rendered to the console and on the page.

This is just one of the ways you can fetch data in a client application. Tools like `graphql-tag` or `apollo-fetch` make formatting variables and sending requests easier. For larger applications something like `apollo-client` might be useful.

We hope this introduction has demystified some aspect of GraphQL for you or given you a better understanding of how Keystone generates its GraphQL server.
