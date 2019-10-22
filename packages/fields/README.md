<!--[meta]
section: api
title: Fields
order: 3
[meta]-->

# Fields

KeystoneJS contains a set of primitive fields types that can be imported from `@keystone-alpha/fields`. These include:

- [CalendarDay](keystone-alpha/fields/src/types/calendar-day)
- [Checkbox](keystone-alpha/fields/src/types/checkbox)
- [CloudinaryImage](keystone-alpha/fields/src/types/cloudinary-image)
- [Color](keystone-alpha/fields/src/types/color)
- [Content](/keystone-alpha/field-content)
- [DateTime](keystone-alpha/fields/src/types/date-time)
- [Decimal](keystone-alpha/fields/src/types/decimal)
- [File](keystone-alpha/fields/src/types/file)
- [Float](keystone-alpha/fields/src/types/float)
- [Integer](keystone-alpha/fields/src/types/integer)
- [Location](keystone-alpha/fields/src/types/location)
- [OEmbed](keystone-alpha/fields/src/types/o-embed)
- [Password](keystone-alpha/fields/src/types/password)
- [Relationship](keystone-alpha/fields/src/types/relationship)
- [Select](keystone-alpha/fields/src/types/select)
- [Slug](keystone-alpha/fields/src/types/slug)
- [Text](keystone-alpha/fields/src/types/text)
- [Unsplash](keystone-alpha/fields/src/types/unsplash)
- [Url](keystone-alpha/fields/src/types/url)
- [Uuid](keystone-alpha/fields/src/types/uuid)

In addition to these are some other complex types that have their own package such as `Markdown` and `Wysiwyg`.

Need more? See our guide on [Custom field types](/guides/custom-field-types/).

## Usage

Fields definitions are provided when creating a list. Field definitions should be an object where the key is the field name and the value is an object containing the fields config:

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
});
```

## Config

Fields share some standard configuration options.

| Option         | Type                                | Default     | Description                                                       |
| -------------- | ----------------------------------- | ----------- | ----------------------------------------------------------------- |
| `type`         | `FieldType`                         | (required)  |                                                                   |
| `schemaDoc`    | `Boolean`                           | `false`     | A description for the field used in the AdminUI.                  |
| `defaultValue` | `Boolean` \| `Function`             | `undefined` | A default value of the field.                                     |
| `isUnique`     | `Boolean`                           | `false`     | Whether or not the field should be unique.                        |
| `isRequired`   | `Boolean`                           | `false`     | Whether or not the field should be mandatory.                     |
| `access`       | `Boolean` \| `Function` \| `Object` | `true`      | See: (Access control)[/guides/access-control] options for fields. |
| `label`        | `String`                            |             | Label for the field.                                              |

_Note_: Many field types have additional config options. See the documentation for individual field types for more detail.

### `type`

A valid `Keystone` field type.

### `label`

Sets the label for the field in the AdminUI

### `schemaDoc`

A description of the field used in the AdminUI.

### `defaultValue`

Sets the value when no data is provided.

#### Usage

```javascript
keystone.createList('Post', {
  fields: {
    title: {
      type: Text,
      defaultValue: ({ existingItem, context, originalInput, actions }) => {
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
