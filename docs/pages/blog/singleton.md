---
title: "Long awaited Singleton has arrived"
description: "Singleton is an intuitive new way to work with single object lists in Keystone."
publishDate: "2022-10-20"
authorName: "Dinesh Pandiyan"
authorHandle: "https://twitter.com/flexdinesh"
metaImageUrl: ""
---

Singleton is one of the most popular community requested features and it is an easy way to work with lists that will only ever have one item like a _website configuration_ or _user settings_.

You describe the list (Eg. _WebsiteConfiguration_) like you describe any other list and add the property `isSingleton: true` to it.

```ts
// schema.ts
export default config({
  lists: ({
    WebsiteConfiguration: list({
      ...
      isSingleton: true,
      fields: { 
        websiteName: text(),
        copyrightText: text(),
      }
    }),
  }),
});
```

In GraphQL, you can read and write from this list without needing an identifier.

```graphql
query {
  websiteConfiguration {
    websiteName
    copyrightText
  }
}

mutation createNew {
  createWebsiteConfiguration(
    data: { websiteName: "cool website", copyrightText: "do not copy me" }
  ) {
    websiteName
    copyrightText
  }
}

mutation updateExisting {
  updateWebsiteConfiguration(
    data: { websiteName: "cool website", copyrightText: "do not copy me" }
  ) {
    websiteName
    copyrightText
  }
}
```

Within the server environment, you can read and write from this list using the default identifier `1`.

```ts
// read
context.query.WebsiteConfiguration.findOne({ where: { id: '1' } });

// update
context.query.WebsiteConfiguration.updateOne({
  where: {
    id: '1',
  },
  data: {
    websiteName: 'name to update',
    copyrightText: 'text to update',
  },
});
```

Read our [API docs](/docs/config/lists#is-singleton) or refer to our [Singleton example](https://github.com/keystonejs/keystone/blob/main/examples/singleton) to learn more about Singleton.

If you like using Keystone, we'd appreciate a shout out in [Twitter](https://twitter.com/KeystoneJS) and a star in [GitHub](https://github.com/keystonejs/keystone).
