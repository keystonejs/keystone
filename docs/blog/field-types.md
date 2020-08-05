<!--[meta]
section: blog
title: Field types in Keystone
date: 2020-08-03
author: Mike Riethmuller
[meta]-->

# Field types

Field types in Keystone sit at the intersection of the Database, GraphQL API and User Interface. When you select and configure a field type, you are specifying how data is stored, how types in GraphQL are defined, and the user interface in the Admin UI.

To give an example, the `Text` field creates a `TEXT` column in a Postgres database, and a `String` type in a MongoDb schema. It has a return type of `String` in GraphQL API, and an input type (for mutations) of `String`. The interface in the Admin UI produces a styled `<input />` element or a `<textarea />` if the `isMultiline` option is configured.

For a complete technical breakdown of the anatomy of field types and how they are built see the [custom field type guide](/docs/guides/custom-field-types.md).

Because they sit at this intersection of concerns, it can be sometimes tricky to decide when what a field type is. How many of these concerns need to differ before we create a new field type?

## Core field types

Field types can be grouped into one of two categories. Those included in the `@keystonejs/fields` package and those that fall under ths `@keystonejs/fields-*` namespace.

We often refer to fields that are included in the `@keystonejs/fields` package as "core fields". There's no definative guide as to when a field should be a core field type, but generally speaking, the core fields consist of primative values like:

- `Text`,
- `Number`,
- `DateTime` etc,

and more complex, but essential types for many applications, such as: `Select`, or `Relationship` fields.

# Non-core field types

If a core field represents a primative value or common type of structured data, non core types are flavors on top of these.

For example the `Markdown` field stores values in the same way as the `Text` field. Technically speaking it's just an extension of the `Text` field that replaces the field view in the Admin UI.

Given this, it's reasonable to ask why have a new field type at all? Why not have an option on the `Text` field, similar to `isMultline`? Both examples change the compontent UI without changing anything about how the data is stored or handled.

Athough it's technically similar to the `Text` field, conceptually, `Markdown` reprsents a different content type. You would not arbitraly display any text as `Markdown` in the same way you might with a multiline input.

`Markdown` also includes `codemirror` - a sizable third-party library that provides a nice editor UI. We don't want to bundle `codemirror` with the core fields package, especially when a `Markdown` field is not an essential to the majority of Keystone projects.

For new fields the decision around whether it should be a core or non-core field type is still open to interpretation of the above guidelines, but this has become the framework for that decision making.

# The future of field types

Reviewing existing fields and applying this decision making process retrospecitvely, highlights a few places we got it wrong in the past.

- `CloudinaryImage`,
- `OEmbed`,
- `UnSplash`, and
- `Location`

are non-core field types and will be moved out of the core fields package.

The `AuthedRelationship` is not a conceptually different field type to the standard `Relationship` field. It doesn't store or handle data differently. It was implemented because setting the value of the of a `Relationship` field to the currently authenticated user is a common use-case. This functionality should be moved to a option on the standard `Relationship` field as it is more similar to other config option than it is to our definition of what constitutes a field type.

The `@keystonejs/fields-date-utc` package should be moved into the core fields package. It's a primative data type used in a wide range of projects.

Both `Color` and `Url` are interesting cases. As they currently are, both store values in the same way as the `Text` field and do nothing more than change the field view.

For the `Url` field it only sets the HTML `type` attribute on the input element. Unlike `Markdown`, the current `Url` field is arguably not a conceptually unique content type. You could display this as a `Text` field with an option like is `isURL` working similar to the `isMultiline` option. The same argument could be made for an option that allows setting the `type` attribute to "email".

`Color` is different in that it bundles a third-party react color picker library, isn't a common requirement for many project and is conceptually a different type of content even though it currently uses the `Text` implementation. The `Color` field type should be moved out of the core packages.

The `Url` field should be wrapped into the `Text` field by providing an option that allows setting the HTML `type` attribute to either `url`, `email` or `text`.

The `URL`, `Color` and `Location` fields, as well as a new `Email` field type could all improve how they store and retrieve data to the point they could be considered candidates for a core field type. For example: If color values were stored using a data structure that represents a color space, such as RGB or HSL, it would be possible to provided extend the functionality of the GraphQL API.

This is likely to happen at a later date. But you can expect to see other changes to field types in the near future as we align with this thinking.
