<!--[meta]
section: api
title: Keystone
order: 1
[meta]-->

# Keystone

## Usage

```javascript
const keystone = new Keystone({
  /* ...config */
});
```

### Config

| Option        | Type     | Default | Description                    |
| ------------- | -------- | ------- | ------------------------------ |
| `queryLimits` | `Object` | `{}`    | Configures global query limits |

### `queryLimits`

Configures global query limits.

These should be used together with [list query limits](https://v5.keystonejs.com/api/create-list#query-limits).

#### Usage

```javascript
const keystone = new Keystone({
  /* ...config */
  queryLimits: {
    maxTotalResults: 1000,
  },
});
```

- `maxTotalResults`: limit of the total results of all relationship subqueries

Note that `maxTotalResults` applies to the total results of all relationship queries separately, even if some are nested inside others.
