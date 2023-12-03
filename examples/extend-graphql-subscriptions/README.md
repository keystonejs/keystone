## Feature Example - Extend GraphQL Schema to enable subscriptions

This example demonstrates how to extend the GraphQL API provided by Keystone to add subscriptions.
For more information on Subscriptions see <https://www.apollographql.com/docs/apollo-server/data/subscriptions>

The example does not demonstrate authentication as it is highly implementation dependent.

The example has the three subscriptions setup, shown below

### Time

Continuously sends the current time every second

```gql
subscription Time {
  time {
    iso
  }
}
```

### Post Published

This subscription receives a post every time the custom `publishPost` mutation is called.

```gql
subscription PublishedPost {
  postPublished {
    id
    title
    publishDate
    author {
      name
    }
  }
}
```

### Post Updated

This subscription receives a post every time the a post is mutated and an `afterOperation` hook fires.

```gql
subscription PostUpdated {
  postUpdated {
    id
    title
    content
    author {
      name
    }
  }
}
```

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000). Open this link in a browser to create your first user.

### Subscriptions Page

Once you have created your first user and a post or two, open the [/subscriptions](http://localhost:3000/subscriptions) page in another tab.
Here you will see the time feed changing every second in response to the time subscription, as the feed for posts whenever they are updated or published.

## Publish a Post

After you create a post, on the post item page there is a button labeled "Publish Post".
Clicking this will set the status to `Published` set the `publishDate` to `now()` and send the post to the `postPublished` subscription.

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/extend-graphql-subscriptions>. You can also fork this sandbox to make your own changes.
