<!--[meta]
section: api
subSection: utilities
title: Apollo helpers
[meta]-->

# Apollo helpers

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/apollo-helpers)

A set of functions and components to ease using
[Apollo](https://www.apollographql.com/docs/react/) with Keystone.

## Installation

```shell
yarn add @keystonejs/apollo-helpers
```

## Usage

### Minimal example

<!-- prettier-ignore-start -->

```javascript
import gql from 'graphql-tag';
import React from 'react';
import ReactDOM from 'react-dom';
import { HttpLink } from 'apollo-link-http';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { Query, KeystoneProvider } from '@keystonejs/apollo-helpers';

const client = new ApolloClient({
  link: new HttpLink({ uri: '...' }),
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <KeystoneProvider>
      <Query query={gql`...`}>
        {({ data }) => (
          <pre>{JSON.stringify(data)}</pre>
        )}
      </Query>
    </KeystoneProvider>
  </ApolloProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

<!-- prettier-ignore-end -->

### Complete example

```javascript
import gql from 'graphql-tag';
import React from 'react';
import ReactDOM from 'react-dom';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { withClientState } from 'apollo-link-state';
import {
  Query,
  Mutation,
  KeystoneProvider,
  injectIsOptimisticFlag,
  flattenApollo,
} from '@keystonejs/apollo-helpers';

const cache = new InMemoryCache();

// Without this, we don't get the _isOptimistic flag on our datatypes
const stateLink = withClientState(
  injectIsOptimisticFlag({
    resolvers: {
      /* ... Add your local state resolvers here */
    },
    defaults: {
      /* ... Add your resolver defaults here */
    },
    cache,
  })
);

const client = new ApolloClient({
  link: ApolloLink.from([stateLink, new HttpLink({ uri: /* ... */ })]),
  cache: cache,
});

const GET_FOO_QUERY = gql`...`
const UPDATE_FOO_MUTATION = gql`...`
const ADD_FOO_MUTATION = gql`...`

// NOTE: This format only works with the `Query`/`Mutation` components from this
// module, not Apollo's `Query`/`Mutation` queries. For those, you'll have to
// wrap each item in a function ({ render }) => <Query ..>{render}</Query>
const GraphQL = flattenApollo({
  foo: <Query query={GET_FOO_QUERY}>,
  // Note the `invalidateTypes` define the GraphQL types to invalidate within
  // the Apollo cache upon mutation
  updateFoo: <Mutation mutation={UPDATE_FOO_MUTATION} invalidateTypes="Foo">,
  addFoo: <Mutation mutation={ADD_FOO_MUTATION} invalidateTypes="Foo">,
})

// Calling `updateFoo` or `addFoo` will trigger the cache invalidation, and so
// will re-execute the `Query` (as it has queried a `Foo` type in the past),
// which will trigger a re-render here.
// In a more complicated app, _all_ `Query`'s which have queried a `Foo` type
// will also be re-rendered without having to wire them up to these particular
// mutations (decoupling FTW!)
const App = () => (
  <ApolloProvider client={client}>
    <KeystoneProvider>
      <GraphQL>
        {({ foo, updateFoo, addFoo }) => (
          <div>
            Foo: <pre>{JSON.stringify(foo, null, 2)}</pre>
            <button onClick={updateFoo}>Update</button>
            <button onClick={addFoo}>Add</button>
          </div>
        )}
      </GraphQL>
    </KeystoneProvider>
  </ApolloProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

## Motivation

Let's start with an example of using Apollo's `Query` / `Mutation` components given the following GraphQL schema:

```graphql
type Event {
  id: ID!
}
type Group {
  id: ID!
  events: [Event]
}
type Meta {
  count: Integer
}
type Query {
  allEvents: [Event]
  _allEventsMeta: Meta
  allGroups: [Group]
  _allGroupsMeta: Meta
}
type Mutation {
  addEvent(group: ID!): Event
}
```

When we perform the following query using Apollo's `<Query>` component:

```jsx
<Query
  query={`
    query {
      allEvents {
        id
      }
      allGroups {
        events {
          id
        }
      }
    }
  `}
/>
```

Apollo will cache the result of `allEvents`/`allGroups`, plus the individual events, which looks roughly like:

```json allowCopy=false showLanguage=false
{
  "allEvents": ["abc123"],
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Group:xyz789": { "id": "xyz789", "events": ["abc123"] }
}
```

Now, when we do a mutation using Apollo's `<Mutation>` component:

```jsx
<Mutation
  mutation={`
    mutation {
      addEvent(group: "xyz789") {
        id
      }
    }
  `}
/>
```

We've created a new `Event` with data `{ id: "def456" }`, which Apollo will also cache:

```json allowCopy=false showLanguage=false
{
  "allEvents": ["abc123"],
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Group:xyz789": { "id": "xyz789", "events": ["abc123"] }
}
```

> Notice the `allEvents` and `Group:xyz789.events` queries were _not_ updated with the new event; this is a caching problem.

To work around it, we have 2 options:

1. Blow everything in the cache away after every mutation with `client.resetStore()` (the sledge hammer approach)
2. Use Apollo's `writeQuery` method to update the cache after each mutation. This requires every place where we perform a `<Mutation>` to know about _all other possible queries that could be affected_! This leads to tightly coupled components and overly verbose code. Eg; The component rendering `allEvents` shouldn't need to know or care there is a component calling the query `allGroups` which could result in this cache problem.

This module introduces a 3rd way of solving the issue:

3. After every mutation, clear only a subset of the data from the cache; that which relates to the mutated type.

What does that mean? Let's continue using the above example but with this module's `<Mutation>` component;

```javascript
<Mutation
  invalidateTypes="Event"
  mutation={`
    mutation {
      addEvent(group: "xyz789") {
        id
      }
    }
  `}
/>
```

> Notice the new `invalidateTypes="Event"` prop we've passed - this instructs on which GraphQL type(s) to clear from the Apollo cache

Will immediately result in the following cache:

```json allowCopy=false showLanguage=false
{
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Group:xyz789": { "id": "xyz789" }
}
```

> Notice `allEvents` and `Group:xyz789.events` have been cleared as they referred to the type `Event`

Which, when using this module's `<Query>` component, will re-load the now removed data from the server, resulting in a final cache of:

```json allowCopy=false showLanguage=false
{
  "allEvents": ["abc123", "def456"],
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Group:xyz789": { "id": "xyz789", "events": ["abc123", "def456"] }
}
```

Now everything's up to date and we didn't have to use `writeQuery` or couple any of our components.

### Why is this coupled to Keystone?

Let's continue the example above with another query:

```javascript
<Query
  query={`
    query {
      allEvents {
        id
      }
      _allEventsMeta {
        count
      }
    }
  `}
/>
```

Would result in the cache:

```json allowCopy=false showLanguage=false
{
  "allEvents": ["abc123", "def456"],
  "_allEventsMeta": { "count": 2 },
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Group:xyz789": { "id": "xyz789", "events": ["abc123", "def456"] }
}
```

Then we add another Event (using an Apollo `<Mutation>`):

```javascript
<Mutation
  mutation={`
    mutation {
      addEvent(group: "xyz789") {
        id
      }
    }
  `}
/>
```

Now the cache is:

```json allowCopy=false showLanguage=false
{
  "allEvents": ["abc123", "def456"],
  "_allEventsMeta": { "count": 2 },
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Event:hij098": { "id": "hij098" },
  "Group:xyz789": { "id": "xyz789", "events": ["abc123", "def456"] }
}
```

Not only are `allEvents` & `Group:xyz789` out of date, but so is `_allEventsMeta` (it should be `{ count: 3 }`).

If we were to use this module's `<Mutation>` component, _but decoupled from Keystone_, the cache at this point would be:

```json allowCopy=false showLanguage=false
{
  "_allEventsMeta": { "count": 2 },
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Event:hij098": { "id": "hij098" },
  "Group:xyz789": { "id": "xyz789" }
}
```

> Notice `allEvents`, and `Group:xyz789.events` are cleared, but `_allEventsMeta` is not

This example highlights the limits of other approaches (see below for possible workarounds / other solutions to this).

In swoops Keystone to the rescue! 🦅

We _do_ know the related type information within Keystone! It's a walled garden which we control, so can extract further information such as _`_allEventsMeta` is a query that relates to `Event`s_.

So, using this module's `<Mutation>` component:

```javascript
<Mutation
  invalidateTypes="Event"
  mutation={`
    mutation {
      addEvent(group: "xyz789") {
        id
      }
    }
  `}
/>
```

Will result in an immediate cache of:

```json allowCopy=false showLanguage=false
{
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Event:hij098": { "id": "hij098" },
  "Group:xyz789": { "id": "xyz789" }
}
```

> Notice `allEvents`, `Group:xyz789.events`, and now `_allEventsMeta` have been cleared

Which, when using this module's `<Query>` component, will re-load the now removed data from the server, resulting in a final cache of:

```json allowCopy=false showLanguage=false
{
  "allEvents": ["abc123", "def456", "hij098"],
  "_allEventsMeta": { "count": 3 },
  "allGroups": ["xyz789"],
  "Event:abc123": { "id": "abc123" },
  "Event:def456": { "id": "def456" },
  "Event:hij098": { "id": "hij098" },
  "Group:xyz789": { "id": "xyz789", "events": ["abc123", "def456", "hij098"] }
}
```

### Can we decouple from Keystone?

If we only cared about queries that explicitly relate to a given type, then we can scan the GraphQL AST / Introspection query to get all the correct queries. This will miss queries such as `_allEventsMeta`.

If we push a bit of the work on linking up queries + types to the developer, we could rely on directives so our GraphQL schema becomes:

```graphql
type Query {
  allEvents: [Event] @relatedToType(type: "Event")
  _allEventsMeta: Meta @relatedToType(type: "Event")
  allGroups: [Group] @relatedToType(type: "Group")
  _allGroupsMeta: Meta @relatedToType(type: "Group")
}
```

> Note the `@relatedToType()` directive

Which could be simplified by combining it with GraphQL AST scanning to become:

```graphql
type Query {
  allEvents: [Event]
  _allEventsMeta: Meta @relatedToType(type: "Event")
  allGroups: [Group]
  _allGroupsMeta: Meta @relatedToType(type: "Group")
}
```

If we went with this method, we could automatically inject that directive into Keystone generated GraphQL schemas.
