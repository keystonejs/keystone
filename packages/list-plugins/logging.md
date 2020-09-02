<!--[meta]
section: list-plugins
title: logging
[meta]-->

# logging Plugin

This plugin provides a mechanism for logging all mutations in a Keystone system.

## Usage

```js
const { logging } = require('@keystonejs/list-plugins');

keystone.createList('ListWithPlugin', {
  fields: {...},
  plugins: [
    logging(args => console.log(args),
  ],
});

keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  plugins: [
    logging(args => console.log(args),
  ]
})
```

## Provided hooks

The `logging` plugin will log the arguments of all mutations with the function `args => console.log(JSON.stringify(args))`.
You can customise its behaviour by providing an alternate logging function.

The plugin provides the following hooks:

- `afterChange`
- `afterDelete`
- `afterAuth`
- `afterUnauth`

The logging function for each hook recieves specific arguments related to the mutation.

### afterChange (create)

| Option          | Type     | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `operation`     | `String` | `"create"`                                |
| `authedItem`    | `Object` | The currently authenticated item.         |
| `authedListKey` | `String` | The list currently authenticated against. |
| `listKey`       | `String` | The key of the list being operated on.    |
| `originalInput` | `Object` | The original input to the mutation.       |
| `createdItem`   | `Object` | The database record of the created item.  |

### afterChange (update)

| Option          | Type     | Description                                                                                                    |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String` | `"update"`                                                                                                     |
| `authedItem`    | `Object` | The currently authenticated item.                                                                              |
| `authedListKey` | `String` | The list currently authenticated against.                                                                      |
| `listKey`       | `String` | The key of the list being operated on.                                                                         |
| `originalInput` | `Object` | The original input to the mutation.                                                                            |
| `changedItem`   | `Object` | The database record of the updated item. This will only include those fields which have actually been changed. |

### afterDelete

| Option          | Type     | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `operation`     | `String` | `"delete"`                                |
| `authedItem`    | `Object` | The currently authenticated item.         |
| `authedListKey` | `String` | The list currently authenticated against. |
| `listKey`       | `String` | The key of the list being operated on.    |
| `deletedItem`   | `Object` | The database record of the deleted item.  |

### afterAuth

| Option          | Type      | Description                                             |
| --------------- | --------- | ------------------------------------------------------- |
| `operation`     | `String`  | `"authenticate"`                                        |
| `authedItem`    | `Object`  | The currently authenticated item.                       |
| `authedListKey` | `String`  | The list currently authenticated against.               |
| `listKey`       | `String`  | The key of the list being operated on.                  |
| `item`          | `Object`  | The authenticated item                                  |
| `success`       | `Boolean` | A success indicator returned by authentication strategy |
| `message`       | `String`  | A success message returned by authentication strategy   |
| `token`         | `String`  | The token returned by authentication strategy           |

### afterUnauth

| Option          | Type     | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `operation`     | `String` | `"unauthenticate"`                        |
| `authedItem`    | `Object` | The currently authenticated item.         |
| `authedListKey` | `String` | The list currently authenticated against. |
| `listKey`       | `String` | The key of the list being operated on.    |
| `itemId`        | `String` | The `ID` of the unauthenticated item      |
