<!--[meta]
section: api
title: Adapter framework
[meta]-->

# Adapter framework

This document describes the role of data store adapters in Keystone 5 and how they relate to lists and fields.

A `Keystone` system consists of multiple `Lists`, each of which contains multiple `Fields`.
This data structure needs to be backed by a persistent data store of some kind.
The _Keystone Adapter Framework_ facilitates this by providing an abstraction layer which can be implemented
by adapters for different data stores (e.g. Mongoose, Postgres, etc).

## Usage

Every `Keystone` system requires a database adapter.
You need to provide an instance of your adapter of choice as the `adapter` config item when creating your `Keystone` object.

```js
const keystone = new Keystone({
  adapter: new MongooseAdapter(),
});
```

All the `Lists` in your system will be backed by this adapter.

## The adapter data model

The adapter framework data model mirrors the KeystoneJS data model.

- Each `Keystone` object has one or more `KeystoneAdapter` instances, accessible by the `.adapters` property
- Each `List` object has one `ListAdapter`, accessible by the `.adapter` property
- Each `Field` object has one `FieldAdapter`, accessible by the `.adapter` property

The adapters do not contain references back to the KeystoneJS objects.
All required information is passed in to the adapter as parameters to the constructor/methods.

Each `KeystoneAdapter` contains references to its associated `ListAdapter` instances, via the `.listAdapters` property.
The `ListAdapter` instances contain a back reference to the `KeystoneAdapter` via the `.parentAdapter` property.
Each `ListAdapter` keeps a list of associated `FieldAdapter` instances, via .`fieldAdapters`.
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

### The `FieldType` to `FieldAdapter` relationship

Each field type definition contains a mapping from `KeystoneAdapter` to `FieldAdapter` class in `.adapters`.
The key to this mapping is the `KeystoneAdapter` instance's `.name` property.

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

## Creating adapters

You can create a new adapter by extending the adapter framework classes.

### Creating new adapters

To add a new adapter you need to extend the core adapter classes `BaseKeystoneAdapter`, `BaseListAdapter`, and `BaseFieldAdapter`.

The API for these classes is not yet finalised.
Experiment at your own risk.

### Creating new field types

When creating a new field type, a `FieldAdapter` must be implemented for each `KeystoneAdapter` you want to support.
The `.adapters` mapping for your new field type should contain the mapping from adapter name to `FieldAdapter` class for each adapter.
