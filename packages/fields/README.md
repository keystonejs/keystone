<!--[meta]
section: api
title: Fields
order: 3
[meta]-->

# Fields

Keystone contains a set of primitive fields types that can be imported from the `@keystonejs/fields` package:

| Field type                                                          | Description                                                                                                                                            |
| :------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`CalendarDay`](/packages/fields/src/types/CalendarDay/README.md)   | An abstract "day" value; useful for Birthdays and other all-day events always celebrated in the local time zone                                        |
| [`Checkbox`](/packages/fields/src/types/Checkbox/README.md)         | A single Boolean value                                                                                                                                 |
| [`DateTime`](/packages/fields/src/types/DateTime/README.md)         | A point in time and a time zone offset                                                                                                                 |
| [`DateTimeUtc`](/packages/fields/src/types/DateTimeUtc/README.md)   | Represents points in time, stored in UTC                                                                                                               |
| [`Decimal`](/packages/fields/src/types/Decimal/README.md)           | Exact, numeric values in base-10; useful for currency, etc.                                                                                            |
| [`File`](/packages/fields/src/types/File/README.md)                 | Files backed various storage mediums: local filesystem, cloud based hosting, etc.                                                                      |
| [`Float`](/packages/fields/src/types/Float/README.md)               | An imprecise numeric value, stored as a floating point                                                                                                 |
| [`Integer`](/packages/fields/src/types/Integer/README.md)           | A whole number                                                                                                                                         |
| [`Password`](/packages/fields/src/types/Password/README.md)         | A [`bcrypt`](https://en.wikipedia.org/wiki/Bcrypt) hash of the value supplied; used by the [Password auth strategy](/packages/auth-password/README.md) |
| [`Relationship`](/packages/fields/src/types/Relationship/README.md) | A link between the current list and others, often paired with a field on the other list                                                                |
| [`Select`](/packages/fields/src/types/Select/README.md)             | One of several predefined string values, presented as a dropdown                                                                                       |
| [`Slug`](/packages/fields/src/types/Slug/README.md)                 | Generate unique slugs (aka. keys, url segments) based on the item's data                                                                               |
| [`Text`](/packages/fields/src/types/Text/README.md)                 | A basic but versatile text field of arbitrary length                                                                                                   |
| [`Url`](/packages/fields/src/types/Url/README.md)                   | Extends the [`Text`](/packages/fields/src/types/Text/README.md) type to store HTTP URLs                                                                |
| [`Uuid`](/packages/fields/src/types/Uuid/README.md)                 | [Universally Unique Identifiers](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUIDs); useful for `id` fields                          |
| [`Virtual`](/packages/fields/src/types/Virtual/README.md)           | Read-only field with a developer-defined resolver, executed on read                                                                                    |

In addition to these, some complex types are packaged separately:

| Field type                                                             | Description                                                                                                                                                           |
| :--------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Content`](/packages/fields-content/README.md)                        | Block-based content for composing rich text such as blog posts, wikis, and even complete pages                                                                        |
| [`AuthedRelationship`](/packages/fields-authed-relationship/README.md) | Extendes the [`Relationship`](/packages/fields/src/types/Relationship/README.md) type; automatically set to the currently authenticated item during a create mutation |
| [`AutoIncrement`](/packages/fields-auto-increment/README.md)           | An automatically incrementing integer; the default type for `id` fields when using the Knex DB adapter                                                                |
| [`Markdown`](/packages/fields-markdown/README.md)                      | Markdown content; based on the [`Text`](/packages/fields/src/types/Text/README.md) type and using the [CodeMirror](https://codemirror.net/) editor in the Admin UI    |
| [`MongoId`](/packages/fields-mongoid/README.md)                        | Arbitrary [Mongo `ObjectId`](https://docs.mongodb.com/manual/reference/method/ObjectId/) values; the default type for `id` fields when using the Mongoose DB adapter  |
| [`Wysiwyg`](/packages/fields-wysiwyg-tinymce/README.md)                | Rich text content; based on the [`Text`](/packages/fields/src/types/Text/README.md) type and using the [TinyMCE](https://www.tiny.cloud/) editor in the Admin UI      |
| [`LocationGoogle`](/packages/fields-location-google/README.md)         | Data from the [Google Maps API](https://developers.google.com/maps/documentation/javascript/reference)                                                                |
| [`Color`](/packages/fields-color/README.md)                            | Hexidecimal RGBA color values; uses a color picker in the Admin UI                                                                                                    |
| [`OEmbed`](/packages/fields-oembed/README.md)                          | Data in the [oEmbed format](https://oembed.com/); allowing an embedded representation of a URL on third party sites                                                   |
| [`CloudinaryImage`](/packages/fields-cloudinary-image/README.md)       | Allows uploading images to the [Cloudinary](https://cloudinary.com/) image hosting service                                                                            |
| [`Unsplash`](/packages/fields-unsplash/README.md)                      | Meta data from the [Unsplash API](https://unsplash.com/developers) and generates URLs to dynamically transformed images                                               |

> **Tip:** Need something else? Keystone lets you create [custom field types](/docs/guides/custom-field-types.md) to support almost any use case.

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

### `adminConfig`

Additional field configs affecting field rendering or display in `admin-ui`.

#### `adminConfig.isReadOnly`

Fields with `isReadOnly` set to `true` will be disabled preventing users from modifying them in the Admin UI. This does not affect access control and fields can still be updated via GraphQL.

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
    slug: {
      type: Slug,
      adminConfig: {
        isReadOnly: true, //slug can be created automatically and you may want to show this as read only
      },
    },
  },
});
```

### `defaultValue`

Sets the value when no data is provided.

```javascript
keystone.createList('Post', {
  fields: {
    title: {
      type: Text,
      defaultValue: ({ context, originalInput }) => {
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
