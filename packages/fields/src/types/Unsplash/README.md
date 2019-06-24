<!--[meta]
section: field-types
title: Unsplash Field Type
[meta]-->

# Unsplash Field Type

> **Unsplash**
> The internet’s source of freely useable images.
> Powered by creators everywhere.

- _[Unsplash.com](https://unsplash.com)_

The Unsplash Field Type enables storing meta data from the Unsplash API and
generating URLs to dynamically transformed images.

## Usage

```javascript
const { Keystone } = require('@keystone-alpha/keystone');
const { Unsplash } = require('@keystone-alpha/fields');

const keystone = new Keystone(/* ... */);

keystone.createList('Post', {
  fields: {
    heroImage: {
      type: Unsplash,
      accessKey: '...', // Get one from https://unsplash.com/developers
      secretKey: '...',
    },
  },
});
```

Will add the following to the GraphQL schema:

```graphql
type UnsplashUser {
  unsplashId: String
  username: String
  name: String
  # The user's URL on Unsplash
  url: String
  # The user supplied portfolio URL
  portfolioUrl: String
  bio: String
  location: String
}

# Mirrors the formatting options [Unsplash provides](https://unsplash.com/documentation#dynamically-resizable-images).
# All options are strings as they ultimately end up in a URL.
input UnsplashImageFormat {
  w: String
  h: String
  crop: String
  fm: String
  auto: String
  q: String
  fit: String
  dpi: String
}

type UnsplashImage {
  unsplashId: String
  width: Integer
  height: Integer
  color: String
  description: String
  publicUrl: String
  publicUrlTransformed(transformation: UnsplashImageFormat): String
  user: UnsplashUser
}

input UserCreateInput {
  # An Unsplash image ID
  heroImage: String
}

type Post {
  heroImage: UnsplashImage
}

type Mutation {
  createPost(data: PostCreateInput): Post
}
```

Create a new Post with an `Unsplash` type:

```graphql
mutation {
  createPost(data: { heroImage: "bJHWJeiHfHc" }) {
    heroImage {
      __typename
      unsplashId
      width
      height
      color
      description
      publicUrl
      publicUrlTransformed(transformation: { w: "100" })
      user {
        unsplashId
        username
        name
        portfolioUrl
        bio
        location
      }
    }
  }
}
```

Will result in something like:

```javascript
{
  data: {
    createPost: {
      heroImage: {
        __typename: "UnsplashImage",
        unsplashId: "bJHWJeiHfHc",
        width: 3827,
        height: 2546,
        color: "#101206",
        description: null,
        publicUrl: "https://images.unsplash.com/photo-1469827160215-9d29e96e72f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjc3Nzg0fQ",
        publicUrlTransformed: "https://images.unsplash.com/photo-1469827160215-9d29e96e72f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjc3Nzg0fQ&w=100",
        user: {
          unsplashId: "bjJC-_rgjhg",
          username: "jeffkingla",
          name: "Jeff King",
          portfolioUrl: "http://www.jeffkingphoto.com/",
          bio: null,
          location: "Los Angeles",
        }
      }
    }
  }
}
```
