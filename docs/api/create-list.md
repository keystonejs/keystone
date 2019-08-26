<!--[meta]
section: api
title: createList
[meta]-->

# keystone.createList(name, options)

## Usage

```javascript
keystone.createList('Post', {
  /* ... */
});
```

## API

## name

A singular name for the list e.g. 'Post'. Where possible plural names will be generated automatically or can be configured in options.

## options

### fields

#### defaultValue

If not set a value must be provided when creating new items.

For a 'nullable' field, set `defaultValue: null`.

May be a static value, or a function which returns the value / a Promise for the value.

NOTE: Some types have a pre-configured defaultValue;

- **Relationship**: `null`

NOTE: This can have impacts when combined with [access control](./access-control.md)
where it's possible a user is never able to create new items because they don't
have access to create a certain field, which attempts to use the `defaultValue`,
but then throws an error because no `defaultValue` has been set.

### schemaDoc

A description for the list. Used in the Admin UI.

### hooks

Specify hooks to execute functions after list actions. List actions include:

- resolveInput
- validateInput
- beforeChange
- afterChange
- beforeDelete
- validateDelete
- afterDelete

E.g.

```
keystone.createList('User',
{
  fields: {
    name: { type: Text },
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      return {
        name: `${resolvedData.name} the Great!`,
      };
    },
  },
})
```

### mutations

An Array of custom mutations in the form of: `{ schema, resolver }`.

_Note:_ These mutation don't necessarily need to be associated with the list. As a result this API may change in the future.

### label

Overrides label for the list in the AdminUI. Default is `listName`.

### labelField

Specify a field to use as a label for individual list items.

E.g.

```
keystone.createList('User',
{
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
  labelField: 'name'
})
```

### labelResolver

Function to resolve labels for individual list item. Default resolves the `labelField`.

E.g.

```
keystone.createList('User',
{
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
  labelResolver: item => `${item.name} - ${item.email}`
})
```

### access

(Access control)[/guides/access-control] options for the list.

Options for `create`, `read`, `update` and `delete` - can be a function, GraphQL where clause or Boolean. See the (access control API documentation)[/api/access-control] for more details.

E.g.

```
keystone.createList('User',
{
  fields: {
    name: { type: Text },
  },
  access: {
    read: false,
  },
})
```

### adminConfig

Options for the AdminUI including:

- `defaultPageSize`
- `defaultColumns`
- `defaultSort`
- `maximumPageSize`

E.g.

```
keystone.createList('User',
{
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
  adminConfig: {
    defaultColumns: 'name,email',
    defaultPageSize: 50,
    defaultSort: 'email',
    maximumPageSize: 100,
  },
})
```

### itemQueryName

Changes the item name in GraphQL queries and mutations.

E.g.

```
keystone.createList('User',
{
  fields: {
    name: { type: Text },
  },
  itemQueryName: 'Person',
})
```

With the above example a GraphQL query might look like this:

```
query {
  Person(where: {id: "1"}) {
    name
  }
}
```

### listQueryName

Changes the list name in GraphQL queries and mutations.

E.g.

```
keystone.createList('User',
{
  fields: {
    name: { type: Text },
  },
  listQueryName: 'People'
})
```

With the above example a GraphQL query might look like this:

```
query {
  allPeople {
    name
  }
}
```

### singular

Keystone list names should be singular and Keystone will attempt to determine a plural.

Where Keystone can't determine a plural you may be forced to use a different list name.

The `singular` option allows you to change the display label for singular items.

E.g. Keystone can't determine a plural for 'Sheep'. Let's use 'WoolyBoi' instead and change the `singular` option:

```
keystone.createList("WoolyBoi", {
  fields: {
    sheepName: { type: Text }
  },
  singular: 'Sheep',
  plural: 'Sheep'
});
```

*Note*: This will override labels in the AdminUI but will not change graphQL queries. For queries and mutations see: `itemQueryName` and `listQueryName`.

### plural

Keystone will attempt to determine a plural for list items. Sometimes Keystone will not be able to determing the plural forcing you to change the list name. Or sometimes Keystone may get it wrong, especially for non-english words.

E.g. Keystone thinks the correct plural for Octopus is "Octopi". Everyone knows the scientifically accurate plural is "Octopodes":

```
keystone.createList("Octopus", {
  fields: {
    legs: { type: Integer }
  },
  plural: "Octopodes"
});
```

### path

Changes the path in the Admin UI. Updating `plural` and `singular` values will not change the route in the admin UI. You can specify this using `path`.

### adapterConfig

Override the adapter config options for a specific list.

### plugins

An array of functions that modify config values. Plugin functions receive a config object and can modify or extend this. They should return a valid list config.

This provides an API for packaging features that can be applied to multiple lists.
