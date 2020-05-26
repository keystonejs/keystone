<!--[meta]
section: api
subSection: field-types
title: Document
[meta]-->

# Document Field

This field inserts a string path into your schema based on the `Text` field type implementation, and renders a Document editor using [Slate](https://www.slatejs.org/).

## Usage

This package isn't included with the keystone fields package and needs to be installed:

```shell allowCopy=false showLanguage=false
yarn add @keystonejs/fields-document
# or
npm install @keystonejs/fields-document
```

Then import it, and use it like any other field:

```js
const { Document } = require('@keystonejs/fields-document');

keystone.createList('Post', {
  fields: {
    content: {
      type: Document,
    },
  },
});
```

## Notes

Due to keystone field packaging limitations, this field currently includes a copy of the core `Controller` and `TextController` files from the core `@keystonejs/fields` package, which need to be manually kept up to date.

Once we can publish view correctly as entrypoints from the main Fields package, and the Controller classes can be extended, we can roll this back and extend the Text field's Controller directly.
