<!--[meta]
section: packages
title: Adapter Framework
[meta]-->

# Adapter Framework

This document describes the role of data store adapters in Keystone 5 and how they relate to lists and fields.

A `Keystone` system consists of multiple `Lists`, each of which contains multiple `Fields`.
This data structure needs to be backed by a persistent data store of some kind.
The _Keystone Adapter Framework_ facilitates this by providing an abstraction layer which can be implemented
by adapters for different data stores (e.g. Mongoose, Postgres, etc).

## Usage

### Single Adapter

Every `Keystone` system requires at least one adapter.
To use a single adapter in your project, provide an instance of your adapter of choice as the `adapter` config item.

```js
const keystone = new Keystone({
  adapter: new MongooseAdapter(),
  // ...
});
```

All the `Lists` in your system will be backed by this adapter.

### Multiple Adapters

If you want to use multiple adapters in your system (e.g. a different database for content management and business data),
you can provide an `adapters` object in your config, along with a `defaultAdapter`.

```js
const keystone = new Keystone({
  adapters: {
    content: new MongooseAdapter(),
    data: new PostgresAdapter(),
  },
  defaultAdapter: 'data',
  // ...
});
```

When you create your lists, the default adapter will be used unless your specify an `adapterName` in the config.

```js
keystone.createList('Pages', {
  adapterName: 'content',
  fields: {
    // ...
  },
  // ...
});
```

## The Adapter Data Model

The adapter framework data model mirrors the Keystone data model.

- Each `Keystone` object has one or more `KeystoneAdapter` instances, accessible by the `.adapters` property
- Each `List` object has one `ListAdapter`, accessible by the `.adapter` property
- Each `Field` object has one `FieldAdapter`, accessible by the `.adapter` property

The adapters do not contain references back to the Keystone objects.
All required information is passed in to the adapter as paramaters to the constructor/methods.

Each `KeystoneAdapter` contains references to its associated `ListAdapter` intances, via the `.listAdapters` property.
The `ListAdapter` intances contain a back reference to the `KeystoneAdapter` via the `.parentAdapter` property.
Each `ListAttribute` keeps a list of associated `FieldAdapter` intances, via .`fieldAdapters`.
These in turn have back reference to the `ListAdapter` in the property `.listAdapter`.

This data model allows all fields under a `KeystoneAdapter` to access all other fields in the same adapter,
which is required to facilitate relationship operations.

<!--- TODO Create a diagram/illustration for the below ASCII --->

```
Keystone    .adapters  ->   KeystoneAdapter   (.listAdapters)
   |          1:N              |
   |           :               |
   |           :               |
 [List]     .adapter   ->   [ListAdapter]     (.fieldAdapters, .parentAdapter)
   |          1:1              |
   |           :               |
   |           :               |
 [Field]    .adapter   ->   [FieldAdapter]    (.listAdapter)
              1:1
```

### The Field Type \<- FieldAdapter Relationship

Each field type definition contains a mapping from `KeystoneAdapter` to `FieldAdapter` class in `.adapters`.
The key to this mapping is the `KeystoneAdapter` intance's `.name` property.

```js
var fieldTypeDef = {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
  },
  adapters: {
    mongoose: MongoTextInterface,
  },
};
```

## Creating Adapters

You can create a new adapter by extending the adapter framework classes.

### Creating New Adapters

To add a new adapter you need to extend the core adapter classes `BaseKeystoneAdapter`, `BaseListAdapter`, and `BaseFieldAdapter`.

The API for these classes is not yet finalised.
Experiment at your own risk.

### Creating New Field Types

When creating a new field type, a `FieldAdapter` must be implemented for each `KeystoneAdapter` you want to support.
The `.adapters` mapping for your new field type should contain the mapping from adapter name to `FieldAdapter` class for each adapter.

## Advanced Usage

### Custom `ListAdapter`

Each `KeystoneAdapter` defines a `defaultListAdapterClass`, which will be used for creating all list adapters.
This can be customised with the `listAdapterClass` config property, which will use the custom class for all lists.

```js
const keystone = new Keystone({
  adapter: new MongooseAdapter({
    listAdapterClass: require('custom-mongoose-list-adapter'),
  }),
  // ...
});
```

A custom list adapter can also be used on a per list basis.

```js
keystone.createList('User', {
  listAdapterClass: require('custom-mongoose-list-adapter'),
  fields: {
    // ...
  },
  // ...
});
```

### Custom `FieldAdapter`

The recommended mechanism for customising the field type adapter is to create a new field type which overrides a specific field adapter mapping.

```js
const CustomText = {
  ...Text,
  adapters: {
    ...Text.adapters,
    mongoose: require('custom-mongoose-text-field-adapter'),
  },
};

keystone.createList('User', {
  fields: {
    name: { type: CustomText },
    // ...
  },
  // ...
});
```
