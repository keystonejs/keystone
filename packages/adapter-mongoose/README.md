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
  adapter: new MongooseAdapter({
    mongoUri,
    mongooseOptions,
  }),
});
```

## API

### `mongoUri` (optional)

This is used as the `uri` parameter for `mongoose.connect()`.

_**Default:**_ Environmental variable (see below) or `'mongodb://localhost/<DATABASE_NAME>'`

If not specified, Keystone will first look for one of the following environmental variables:

- `CONNECT_TO`,
- `DATABASE_URL`,
- `MONGO_URI`,
- `MONGODB_URI`,
- `MONGO_URL`,
- `MONGODB_URL`,
- `MONGOLAB_URI`,
- `MONGOLAB_URL`

If none of these are found a connection string with a `DATABASE_NAME` will be derived from the Keystone project name is used.

### `mongooseOptions` (optional)

These options are passed directly through to `mongoose.connect()`.

See: https://mongoosejs.com/docs/api.html#mongoose_Mongoose-connect for a detailed list of options.
