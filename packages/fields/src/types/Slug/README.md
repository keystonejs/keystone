<!--[meta]
section: api
subSection: field-types
title: Slug
[meta]-->

# Slug

Generate unique Slugs (aka; keys / url segments) based on the item's data.

## Usage

By default, slugs are generated from a `name` or `title` field (in that order)
if they exist. The field can be specified explicitly with the `from` option
(`from: 'username'`), or for more advanced use-cases, a `generate` function
can be provided (`generate: ({ resolvedData, existingItem }) => mySlugFunc(resolvedData.username)`)

[See the example](#example) below for the result of an example mutation.

### Using the defaults

As we have specified a `title` field, its value will be used to generate a
unique slug.

```javascript
const { Slug, Text } = require('@keystonejs/fields');
const { Keystone } = require('@keystonejs/keystone');

const keystone = new Keystone(/* ... */);

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    url: { type: Slug },
  },
});
```

### Specifying a field

The item's `username` value will be used to generate a unique slug.

```javascript
const { Slug, Text } = require('@keystonejs/fields');
const { Keystone } = require('@keystonejs/keystone');

const keystone = new Keystone(/* ... */);

keystone.createList('User', {
  fields: {
    username: { type: Text },
    url: {
      type: Slug,
      from: 'username',
    },
  },
});
```

### Custom `generate` method

```javascript
const { Slug, Text, DateTime } = require('@keystonejs/fields');
const { Keystone } = require('@keystonejs/keystone');
const slugify = require('slugify');

const keystone = new Keystone(/* ... */);

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    postedAt: { type: DateTime },
    url: {
      type: Slug,
      generate: ({ resolvedData }) => slugify(resolvedData.title + '-' + resolvedData.postedAt),
    },
  },
});
```

## Slug stability

The `Slug` field attempts to reuse the same value across updates (ie;
"stability"). This is particularly important when slugs are used for URL
segments to ensure URLs don't change.

For example, if you create an item with a slug `abc123`, then perform an
`update` mutation without changing any of the data which the slug initial
generation was based on, the slug should stay as `abc123`.

### Caveats with updates and `makeUnique`

There is one situation where the `Slug` field cannot guarantee stability; when:

- The `regenerateOnUpdate` flag is `true`, and
- Performing an `update` mutation, and
- A `slug` value is passed in which is not unique in the list

For example:

1. Perform a `create` mutation: `createPost(data: { slug: "hello-world" }) { slug }`.

   - Result: `{ slug: "hello-world" }`

2. Perform a second `create` mutation with the same slug: `createPost(data: { slug: "hello-world" }) { id slug }`.

   - Result (approximately): `{ id: "1", slug: "hello-world-weer84fs" }`

3. Perform an update to the second item, with the same slug as the first (again): `updatePost(id: "1", data: { slug: "hello-world" }) { id slug }`.
   - Result (approximately): `{ id: "1", slug: "hello-world-uyi3lh32" }`
   - The slug has changed, even though we passed the same slug in. This happens
     because there is no way to know what the previously passed-in slug was, only
     the most recently _uniquified_ slug (ie; `"hello-world-weer84fs"`).

#### Workarounds

1. Don't pass in values for the `Slug` field. Instead, create a `generate`
   function which does the work for you in a _deterministic_ way. In this
   scenario, we are able to compare what would have previously been generated as
   the slug to the newly generated slug and re-use the old one if they match.
2. Specify a _deterministic_ `makeUnique` function (the default is to add a
   random suffix). This will ensure that when the duplicate slug is detected, it
   will re-generate the same "uniqueified" slug each time. This can be done by
   adding an incrementing number on each call.

## Example

Given the following list config:

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
    url: {
      type: Slug,
      from: 'title',
    },
  },
});
```

A mutation to create a new item will auto-generate a slug:

```graphql
mutation {
  createPost(data: { title: "Why I ♥ KeystoneJS" }) {
    id
    title
    url
  }
}

# Result:
# {
#   createPost: {
#     id: "1",
#     title: "Why I ♥ KeystoneJS",
#     url: "why-i-love-keystonejs"
#   }
# }
```

Because we've left `isUnique` at its default value (`isUnique: true`), a
subsequently created item with the same `title` will generate a unique slug:

```graphql
mutation {
  createPost(data: { title: "Why I ♥ KeystoneJS" }) {
    id
    title
    url
  }
}

# Result:
# {
#   createPost: {
#     id: "2",
#     title: "Why I ♥ KeystoneJS",
#     url: "why-i-love-keystonejs-2108fh3"
#   }
# }
```

You can also manually override the slug's value:

```graphql
mutation {
  createPost(data: { title: "Why I ♥ KeystoneJS", url: "keystonejs-is-great" }) {
    id
    title
    url
  }
}

# Result:
# {
#   createPost: {
#     id: "2",
#     title: "Why I ♥ KeystoneJS",
#     url: "keystonejs-is-great"
#   }
# }
```

And overwritten slugs will be uniquified for you when `isUnique: true` (with
[one caveat](#caveats-with-updates-and-makeunique)):

```graphql
mutation {
  createPost(data: { title: "Why I ♥ KeystoneJS", url: "keystonejs-is-great" }) {
    id
    title
    url
  }
}

# Result:
# {
#   createPost: {
#     id: "2",
#     title: "Why I ♥ KeystoneJS",
#     url: "keystonejs-is-great-f80p5sm"
#   }
# }
```

## Config

| Option               | Type               | Default                                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`               | `String`           | `undefined`                                                              | Specify a field whos value will be used to generate a slug. An error will be thrown if the value of the specified field is not of type `string`. NOTE: Only one of the `from` or `generate` options should be set.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `generate`           | `Function<String>` | Either `name`, `title`, or the first non-id field found                  | Will be passed `{ resolvedData, existingItem }` as the first parameter from which you can generate a slug. An error will be thrown if the returned value is not of type `string`. NOTE: Only one of the `from` or `generate` options should be set.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `makeUnique`         | `Function<String>` | Appends a hyphen followed by 7-10 random lowercase alpha-num characters. | If `isUnique === true` and the slug returned from `generate` is not unique, this method will be executed. This method receives a single parameter `{ value, slug, previousSlug, generatedSlug }` where `slug` is the slug to make unique, `previousSlug` is the previous result of calling `makeUnique`, and `generatedSlug` is the original result of calling `generate` / any value passed in the mutation. If the uniqueified string returned is still not unique, this function will be called again with the uniqueified value set to `previousSlug`.                                                                                                    |
| `alwaysMakeUnique`   | `Boolean`          | `false`                                                                  | Always run the `makeUnique` method, even if the uniquified slug from `generate` does not collide with any existing slugs. The default of only uniquifying on collision can lead to subtle data leak vulnerabilities such as revealing the existence of a slug for a given field value to exist, even if that item in the list is otherwise innaccessible to queries (eg via Access Control). For example; a deactivated user with slug `sam-smith` will cause a collision for new accounts with a `name` of `Sam Smith`, revealing the existence of previously created accounts of that name by checking if the returned `slug` has a unique string appended. |
| `regenerateOnUpdate` | `Boolean`          | `true`                                                                   | If no value is received during an `update<List>` mutation, generate a value as per a `create<List>` mutation. NOTE: If a value is received, it will overwrite this setting.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `isUnique`           | `Boolean`          | `true`                                                                   | Ensures `makeUnique` is executed if the value is not unique. Adds a unique database index that allows only unique values to be stored. Implies `isIndexed`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `isIndexed`          | `Boolean`          | `true`                                                                   | Set a database index on this field. Setting `isUnique` will also set `isIndexed` to `true`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## GraphQL

`Slug` fields use the `String` type in GraphQL.

### Input fields

| Field name | Type     | Description                            |
| ---------- | -------- | -------------------------------------- |
| `${path}`  | `String` | A slug, or blank to execute `generate` |

### Output fields

| Field name | Type     | Description   |
| ---------- | -------- | ------------- |
| `${path}`  | `String` | A unique slug |

### Filters

| Field name                  | Type       | Description                                           |
| --------------------------- | ---------- | ----------------------------------------------------- |
| `${path}`                   | `String`   | Exact match to the String provided                    |
| `${path}_contains`          | `String`   | Contains the String provided as a substring           |
| `${path}_starts_with`       | `String`   | Starts with the String provided                       |
| `${path}_ends_with`         | `String`   | Ends with the String provided                         |
| `${path}_in`                | `[String]` | In the array of Strings provided                      |
| `${path}_not`               | `String`   | Not an exact match to the String provided             |
| `${path}_not_contains`      | `String`   | Does not contain the String provided as a substring   |
| `${path}_not_starts_with`   | `String`   | Does not start with the String provided               |
| `${path}_not_ends_with`     | `String`   | Does not end with the String provided                 |
| `${path}_not_in`            | `[String]` | Not in the array of Strings provided                  |
| `${path}_i`                 | `String`   | Case insensitive version of `${path}`                 |
| `${path}_not_i`             | `String`   | Case insensitive version of `${path}_not`             |
| `${path}_contains_i`        | `String`   | Case insensitive version of `${path}_contains`        |
| `${path}_not_contains_i`    | `String`   | Case insensitive version of `${path}_not_contains`    |
| `${path}_starts_with_i`     | `String`   | Case insensitive version of `${path}_starts_with`     |
| `${path}_not_starts_with_i` | `String`   | Case insensitive version of `${path}_not_starts_with` |
| `${path}_ends_with_i`       | `String`   | Case insensitive version of `${path}_ends_with`       |
| `${path}_not_ends_with_i`   | `String`   | Case insensitive version of `${path}_not_ends_with`   |
