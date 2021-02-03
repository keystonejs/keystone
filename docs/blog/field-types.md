<!--[meta]
section: blog
title: Field types in Keystone
date: 2020-08-03
author: Mike Riethmuller
order: 3
[meta]-->

Field types in Keystone sit at the intersection of the Database, GraphQL API and User Interface. When you select and configure a field type, you are specifying how data is stored, how types in GraphQL are defined, and how the interface looks in the Admin app.

To give an example, the `Text` field creates a `TEXT` column in a Postgres database, and a `String` type in a MongoDb schema. It has a return type of `String` in the GraphQL API, and an input type (for mutations) also of `String`. The interface produces a styled `<input />` element or a `<textarea />` depending on if the `isMultiline` option is configured.

For a complete technical breakdown on the anatomy of field types and how they are built, see the [custom field type guide](/docs/guides/custom-field-types.md).

Because they sit at this intersection of concerns, it can be difficult to decide what customisations should become new field types. How many concerns need to differ before creating a new field vs adding config options or project specific customisation such as hooks?

This post provides insight into how we think about field types. Broadly speaking, field types can be grouped into one of two categories. Core field types and Non-Core field types.

## Core field types

Core field types are those included in the `@keystonejs/fields` package and fall under ths `@keystonejs/fields-*` namespace.

There's no definitive guide as to when a field should be a core field type, but generally speaking, the core fields consist of "primitive" values like:

- `Text`,
- `Number`,
- `DateTime` etc,

These usually map fairly well to primitive data types common to many programming languages and databases. However Keystone is a CMS and essential types for CMS applications extend beyond data types.

For these reasons we also consider more complex fields such as: `Select`, and `Relationship` as core field types.

## Non-core field types

If a core field represents a primitive value or common type of structured data use in applications, non-core types could be considered flavours on top of these.

A good example is the `Markdown` field. It stores values in the same way as the `Text` field. Technically speaking it's just an extension of the `Text` field that replaces the field view in the Admin UI.

Given this, it's reasonable to ask why have a new field type at all? Why not have an option on the `Text` field, similar to `isMultiline`? Both examples change the UI without changing anything about how the data is stored in the database or handled in GraphQL.

Although technically similar to the `Text` field, conceptually, `Markdown` represents a different content type. You would not arbitrarily display any text as `Markdown` in the same way you might with a multiline input.

This completes the basic criteria of how we decide on new field types over config options or project specific customsation:

1. Is data in the Database or GraphQL a different type?
2. Is it conceptually a different field type for users?
3. Is the UI incompatible with other values using the same type?

It's also important to note that`Markdown` includes `codemirror` - a sizeable third-party library used to provide a nice editor interface. We don't want to bundle `codemirror` with the core fields package, especially when a `Markdown` field is not an essential to a large majority of Keystone projects.

This forms the final part of the decision making to help determine when a field is a non-core field type. Non-core field types often:

1. share a primitive type, data structure, or use-case with a core field
2. are not required for many Keystone projects
3. connect with a third-party service or API
4. include a third-party library, that will impact the core fields bundle

It may be open to some interpretation, but the above guidelines help when deciding which fields belong with `@keystonejs/fields` package, and which don't.

## The future of field types

After reviewing existing fields and applying the above decision making process retrospectively, it highlights a few places we got this wrong in the past.

We've realised the following field types are non-core field types:

- `CloudinaryImage`
- `OEmbed`
- `UnSplash`
- `Location`

These will be moved out of the core fields package.

We've also realised that the `AuthedRelationship` is not conceptually different to the standard `Relationship` field. It doesn't store or handle data differently. It provides a shortcut for a common use-case of setting the value of the of a `Relationship` field to the currently authenticated user is a common use-case.

This functionality can be achieved with hooks and config on the existing `Relationship` field. We plan to document how to achieve common use-cases such as this before changing the `AuthedRelationship` field.

The `@keystonejs/fields-date-utc` package should be moved into the core fields package. It's a primitive data type used in a wide range of projects.

Both `Color` and `Url` are interesting. They currently both store values in the same way as the `Text` field and do nothing more than change the view.

The `Url` field only sets the HTML `type` attribute on the input element. You could add an option like is `isURL`, similar to the `isMultiline` and the same argument could be made for an option that allows setting the `type` attribute to "email".

An option should be added to the `Text` field that allows setting the HTML `type` attribute to either `url`, `email` or `text` (default).

However, much like `Markdown`, `URL` and `Email` are conceptually different fields for many users. It makes sense to expand the configuration options for `Text`, but there is also an argument for a unique field type that uses knowledge of the structure of URLs and emails to implement specific features. Examples might include server-side validation, domain based filtering, case-insensitive unique restrictions.

We won't deprecate or move the `URL` field for now but will look to improve it's implementation over time.

The `Location` and `Color` fields bundles a third-party libraries and are not a common requirement for many projects. Both should be moved out of the core packages.

Expect to see fields move between the core and non-core packages over the next few weeks. In the longer term hope to improve functionality of existing field in some of the ways mentioned here. We also hope this provides clarity around the choices we have made with field types.

If you want to continue the discussion head over to our [community Slack channel](https://community.keystonejs.com/) and ask us about field types. You can tweet at us [@KeystoneJS on Twitter](https://twitter.com/KeystoneJS).

Finally if you have a custom field type, please share it with us! We might include it in the Keystone or one of our contributors, Gautam Singh, maintains the `@keystonejs-contrib` namespace for any other community contributions.
