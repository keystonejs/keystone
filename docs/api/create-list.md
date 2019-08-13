<!--[meta]
section: api
title: keystone.createList() API
[meta]-->

# `keystone.createList()` API

## Usage

```javascript
keystone.createList('Post', {
  /* ... */
});
```

## API

### `options`

#### `fields`

##### `defaultValue`

If not set, or set to `undefined`, it must be provided when creating new items.
For a 'nullable' field, set `defaultValue: null`.

`defaultValue` may be a static value, or a function which returns the value / a
Promise for the value.

NOTE: Some types have a pre-configured defaultValue;

- **Relationship**: `null`

NOTE: This can have impacts when combined with [access control](./access-control.md)
where it's possible a user is never able to create new items because they don't
have access to create a certain field, which attempts to use the `defaultValue`,
but then throws an error because no `defaultValue` has been set.
