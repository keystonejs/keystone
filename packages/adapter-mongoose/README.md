---
section: packages
title: Database Adapter: Mongoose
---

# Mongoose Database Adapter

## Usage

```javascript
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new MongooseAdapter(),
});

const mongooseOptions = {
  /* .. */
};
const mongoDbUri = '';

keystone.connect(mongoDbUri, mongooseOptions);
```

## API

### `mongoDbUri`

_**Default:**_ `'mongodb://localhost:27017/'`

This URI will be passed directly to mongoose (and hence mongodb) as the location
of the database.

### `mongooseOptions`

#### `mongooseOptions.dbName`

When set, this will overwrite any name specified in the `mongoDbUri` string.

#### `mongooseOptions.*`

All other options are passed directly to Mongoose.
See [the Mongoose docs](https://mongoosejs.com/docs/connections.html) for more.
