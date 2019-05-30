<!--[meta]
section: packages
title: Database Adapter - Mongoose
[meta]-->

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

_**Default:**_ `'mongodb://localhost:27017/${SAFE_KEYSTONE_NAME}'`

This URI will be passed directly to Mongoose (and hence MongoDB) as the location of the database.

### `mongooseOptions`

#### `mongooseOptions.*`

All other options are passed directly to Mongoose.

See [the Mongoose docs](https://mongoosejs.com/docs/connections.html) for more.
