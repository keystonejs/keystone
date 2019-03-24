---
section: discussions
title: Lists
---

# Lists Guide

```DOCS_TODO
TODO
```

## Creating Lists

### `config`

```DOCS_TODO
TODO
```

#### `fields`

```DOCS_TODO
TODO
```

##### `defaultValue`

If not set, or set to `undefined`, it must be provided when creating new items.
For a 'nullable' field, set `defaultValue: null`.

NOTE: Some types have a pre-configured defaultValue;

- **Relationship**: `null`

NOTE: This can have impacts when combined with [access control](../access-control.md)
where it's possible a user is never able to create new items because they don't
have access to create a certain field, which attempts to use the `defaultValue`,
but then throws an error because no `defaultValue` has been set.
