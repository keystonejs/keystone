<!--[meta]
section: api
subSection: field-types
title: File
[meta]-->

# File

Support files hosted in a range of different contexts, e.g. in the local filesystem, or on a cloud based file server.

> **Important:** As of this writing (April 2020), an upstream [issue](https://github.com/apollographql/apollo-server/issues/3508)
> with `apollo-server`'s dependencies can cause a server crash when using this field (regardless of adapter) with **Node 13 only**.
> To work around this, use Node 12 or below _or_ add the following to your `package.json`:
>
> ```js title=package.json
> "resolutions": {
>   "graphql-upload": "^10.0.0"
> }
> ```
>
> You can track this issue [here](https://github.com/keystonejs/keystone/issues/2101).

## Usage

```js
const { File } = require('@keystonejs/fields');
const { LocalFileAdapter } = require('@keystonejs/file-adapters');

const fileAdapter = new LocalFileAdapter({
  /*...config */
});

keystone.createList('Applicant', {
  fields: {
    file: {
      type: File,
      adapter: fileAdapter,
      isRequired: true,
    },
  },
});
```

### Config

| Option       | Type      | Default  | Description                                                                             |
| ------------ | --------- | -------- | --------------------------------------------------------------------------------------- |
| `adapter`    | `Object`  | Required | See the [File Adapters](/packages/file-adapters/README.md) page for available adapters. |
| `isRequired` | `Boolean` | `false`  | Does this field require a value?                                                        |
