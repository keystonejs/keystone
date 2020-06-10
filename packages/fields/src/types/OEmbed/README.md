<!--[meta]
section: api
subSection: field-types
title: OEmbed
[meta]-->

# OEmbed

Stores data in the oEmbed format:

> `oEmbed` is a format for allowing an embedded representation of a URL on third party sites.
> The simple API allows a website to display embedded content (such as photos or videos)
> when a user posts a link to that resource, without having to parse the resource directly.
> \--- The [oEmbed Spec](https://oembed.com/)

## Usage

```js
const { Keystone } = require('@keystonejs/keystone');
const { OEmbed, Text } = require('@keystonejs/fields');
const { IframelyOEmbedAdapter } = require('@keystonejs/oembed-adapters');

const keystone = new Keystone({...});

const iframelyAdapter = new IframelyOEmbedAdapter({
  apiKey: process.env.IFRAMELY_API_KEY, // Get one from https://iframely.com
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    portfolio: { type: OEmbed, adapter: iframelyAdapter },
  },
});
```

### Config

| Option       | Type      | Default | Description                      |
| ------------ | --------- | ------- | -------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value? |

## GraphQL

Will add the following to the GraphQL schema:

```graphql
type OEmbedThumbnail {
  # A URL to a thumbnail image
  url: String!
  # The width of the thumbnail
  width: String!
  # The height of the thumbnail
  height: String!
}

type OEmbedAuthor {
  # The name of the author/owner of the resource.
  name: String
  # A URL for the author/owner of the resource.
  url: String
}

type OEmbedProvider {
  # The name of the resource provider.
  name: String
  # The url of the resource provider.
  url: String
}

interface OEmbed {
  # The resource type. One of 'photo'/'video'/'link'/'rich'
  type: String
  # The original input URL which the oEmbed data was generated from
  originalUrl: String!
  # The oEmbed version number. Will be 1.0.
  version: String
  # A text title, describing the resource.
  title: String
  # The suggested cache lifetime for this resource, in seconds. Consumers may choose to use this value or not.
  cacheAge: String
  # The resource provider.
  provider: OEmbedProvider
  # The author/owner of the resource.
  author: OEmbedAuthor
  # An optional thumbnail image representing the resource.
  thumbnail: OEmbedThumbnail
}

type OEmbedPhoto implements OEmbed {
  type: String
  originalUrl: String
  version: String
  title: String
  cacheAge: String
  provider: OEmbedProvider
  author: OEmbedAuthor
  thumbnail: OEmbedThumbnail

  # OEmbedPhoto specific fields
  url: String
  width: String
  height: String
}

type OEmbedVideo implements OEmbed {
  type: String
  originalUrl: String
  version: String
  title: String
  cacheAge: String
  provider: OEmbedProvider
  author: OEmbedAuthor
  thumbnail: OEmbedThumbnail

  # OEmbedVideo specific fields
  html: String
  width: String
  height: String
}

type OEmbedLink implements OEmbed {
  type: String
  originalUrl: String
  version: String
  title: String
  cacheAge: String
  provider: OEmbedProvider
  author: OEmbedAuthor
  thumbnail: OEmbedThumbnail
}

type OEmbedRich implements OEmbed {
  type: String
  originalUrl: String
  version: String
  title: String
  cacheAge: String
  provider: OEmbedProvider
  author: OEmbedAuthor
  thumbnail: OEmbedThumbnail

  # OEmbedRich specific fields
  html: String
  width: String
  height: String
}

input UserCreateInput {
  # A URL which will be transformed into the oEmbed types above by the provider
  portfolio: String
}

type User {
  portfolio: OEmbed
}

type Query {
  User(where: UserWhereUniqueInput!): User
}

type Mutation {
  createUser(data: UserCreateInput): User
}
```

Create a new User with an `OEmbed` type:

```graphql
mutation {
  createUser(data: { portfolio: "https://flickr.com/foobar" }) {
    portfolio {
      __typename
      type
      originalUrl
      title
      thumbnail {
        url
        width
        height
      }
      provider {
        name
      }
      ... on OEmbedPhoto {
        url
        width
        height
      }
      ... on OEmbedVideo {
        html
        width
        height
      }
      ... on OEmbedRich {
        html
        width
        height
      }
      # NOTE: No OEmbedLink fragment - it doesn't specify any extra fields
    }
  }
}
```

Will result in something like:

```javascript
{
  data: {
    createUser: {
      portfolio: {
        __typename: "OEmbedPhoto",
        type: "photo",
        originalUrl: "https://flickr.com/foobar",
        title: "My Glamour Shot",
        thumbnail: {
          url: "...",
          width: "90",
          height: "90",
        },
        provider: {
          name: "Flickr",
        },
        // because it's a 'photo' type, we get url/width/height:
        url: "...",
        width: "1024",
        height: "400",
      }
    }
  }
}
```

## OEmbed block

The `OEmbed` field exposes a block that can be used in the [content field](/packages/field-content/README.md).

### Usage

```js
const { Keystone } = require('@keystonejs/keystone');
const { Content } = require('@keystonejs/field-content');
const { OEmbed, Text } = require('@keystonejs/fields');
const { IframelyOEmbedAdapter } = require('@keystonejs/oembed-adapters');

const iframelyAdapter = new IframelyOEmbedAdapter({
  apiKey: process.env.IFRAMELY_API_KEY, // Get one from https://iframely.com
});

keystone.createList('Post', {
  fields: {
    body: {
      type: Content,
      blocks: [Content.blocks.heading, [OEmbed.blocks.oEmbed, { adapter: iframelyAdapter }]],
    },
  },
});
```
