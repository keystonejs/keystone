---
'@keystone-6/fields-document': major
---

Substantial changes to the underlying document-editor component block interfaces, with the new addition of Array Fields.
The breaking changes are only for defining components, _no database migration is needed_.

The primary breaking changes for component blocks are:

- For the arguments to the `component` function from `@keystone-6/fields-document/component-blocks`, the following properties have been renamed
  - `component` -> `preview`
  - `props` -> `schema`
- When using the fields within your preview component - as defined by your component `.schema` (previous `.props`) - you now use `props.fields.{innerFieldName}` instead of `props.{innerFieldName}`.

For example, `props.fields.title` instead of `props.title`.
For a nested example, `props.fields.someObject.fields.title` instead of `props.someObject.title`.

- The React element to render for a child field is now `props.{innerFieldName}.element` instead of `props.{innerFieldName}`.

See [#7428](https://github.com/keystonejs/keystone/pull/7428) for detailed instructions if you need to upgrade your code.
