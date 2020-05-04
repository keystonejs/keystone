<!--[meta]
section: api
title: Fields
order: 3
[meta]-->

# Fields

Keystone contains a set of primitive fields types that can be imported from `@keystonejs/fields`. These include:

- [CalendarDay](https://keystonejs.com/keystonejs/fields/src/types/calendar-day)
- [Checkbox](https://keystonejs.com/keystonejs/fields/src/types/checkbox)
- [CloudinaryImage](https://keystonejs.com/keystonejs/fields/src/types/cloudinary-image)
- [Color](https://keystonejs.com/keystonejs/fields/src/types/color)
- [Content](https://keystonejs.com/keystonejs/field-content)
- [DateTime](https://keystonejs.com/keystonejs/fields/src/types/date-time)
- [Decimal](https://keystonejs.com/keystonejs/fields/src/types/decimal)
- [File](https://keystonejs.com/keystonejs/fields/src/types/file)
- [Float](https://keystonejs.com/keystonejs/fields/src/types/float)
- [Integer](https://keystonejs.com/keystonejs/fields/src/types/integer)
- [Location](https://keystonejs.com/keystonejs/fields/src/types/location)
- [OEmbed](https://keystonejs.com/keystonejs/fields/src/types/o-embed)
- [Password](https://keystonejs.com/keystonejs/fields/src/types/password)
- [Relationship](https://keystonejs.com/keystonejs/fields/src/types/relationship)
- [Select](https://keystonejs.com/keystonejs/fields/src/types/select)
- [Slug](https://keystonejs.com/keystonejs/fields/src/types/slug)
- [Text](https://keystonejs.com/keystonejs/fields/src/types/text)
- [Unsplash](https://keystonejs.com/keystonejs/fields/src/types/unsplash)
- [Url](https://keystonejs.com/keystonejs/fields/src/types/url)
- [Uuid](https://keystonejs.com/keystonejs/fields/src/types/uuid)

In addition to these are some other complex types that have their own package such as `Markdown` and `Wysiwyg`.

> **Tip:** Need more? See our guide on [custom field types](https://keystonejs.com/guides/custom-field-types/)

## Usage

Fields definitions are provided when creating a list. Field definitions should be an object where the key is the field name and the value is an object containing the fields config:

```javascript
const { Text } = require('@keystonejs/fields');

keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
});
```

## Config

Fields share some standard configuration options.

| Option         | Type                                | Default     | Description                                                                                                                                           |
| -------------- | ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`         | `FieldType`                         | (required)  |                                                                                                                                                       |
| `adminDoc`     | `String`                            | `false`     | A description for the field used in the AdminUI.                                                                                                      |
| `schemaDoc`    | `String`                            | `false`     | A description for the field used in the GraphQL schema.                                                                                               |
| `defaultValue` | `Any` \| `Function`                 | `undefined` | A valid default value for the field type. Functions must return a valid value. Use `undefined` to set no default, and `null` to set an empty default. |
| `isUnique`     | `Boolean`                           | `false`     | Whether or not the field should be unique.                                                                                                            |
| `isRequired`   | `Boolean`                           | `false`     | Whether or not the field should be mandatory.                                                                                                         |
| `access`       | `Boolean` \| `Function` \| `Object` | `true`      | See: [Access control](https://keystonejs.com/guides/access-control) options for fields.                                                               |
| `label`        | `String`                            |             | Label for the field.                                                                                                                                  |
| `adminConfig`  | `Object`                            | `{}`        | Additional config which can be used when customizing `admin-ui`                                                                                       |

> **Note:** Many field types have additional config options. See the documentation for individual field types for more detail.

### `type`

A valid `Keystone` field type.

### `label`

Sets the label for the field in the AdminUI

### `adminDoc`

A description of the field used in the AdminUI.

### `schemaDoc`

A description of the field used used in the GraphQL schema.

### `defaultValue`

Sets the value when no data is provided.

```javascript
keystone.createList('Post', {
  fields: {
    title: {
      type: Text,
      defaultValue: ({ context, originalInput, actions }) => {
        /**/
      },
    },
    description: { type: Text, defaultValue: 'Lorem ipsum...' },
  },
});
```

For a 'nullable' field, set `defaultValue: null`.

The `defaultValue` can be a `String` or `Function`. Functions should returns the value, or a Promise for the value.

### `isUnique`

Specifies whether the value should be unique or not. Will return an error is a user tries to create a field with a non-unique value.

### `isRequired`

Specifies whether the field is required or not. Will return an error if mutations do not contain data.

### `access`

[Access control](https://keystonejs.com/guides/access-control) options for fields.

Options for `create`, `read`, `update` and `delete` - can be a function or Boolean. See the [access control API documentation](https://keystonejs.com/api/access-control) for more details.

_Note_: Field level access control does not accept graphQL where clauses.

### `cacheHint`

[HTTP cache hint](https://keystonejs.com/api/create-list#cacheHint) for field.

Only static hints are supported for fields.

## Native type aliases

Keystone allows the use of a few native JavaScript types for fields. They are converted to their Keystone field equivalents at runtime.

| Native type | Field type equivalent |
| ----------- | --------------------- |
| `Boolean`   | `Checkbox`            |
| `Number`    | `Float`               |
| `String`    | `Text`                |

### Usage

```javascript
keystone.createList('Post', {
  fields: {
    title: {
      type: String,
    }
  }
}
```
