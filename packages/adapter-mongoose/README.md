<!--[meta]
section: api
subSection: database-adapters
title: Mongoose Adapter
[meta]-->

# Mongoose Database Adapter

## Usage

```javascript
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new MongooseAdapter(),
});
```

## API `new MongooseAdapter(options)`

### `options.mongoUri` (optional)

This is used as the `uri` parameter for `mongoose.connect()`.

_**Default:**_ Environmental variable (see below) or `'mongodb://localhost/<DATABASE_NAME>'`

If not specified, KeystoneJS will first look for one of the following environmental variables:

- `CONNECT_TO`,
- `DATABASE_URL`,
- `MONGO_URI`,
- `MONGODB_URI`,
- `MONGO_URL`,
- `MONGODB_URL`,
- `MONGOLAB_URI`,
- `MONGOLAB_URL`

If none of these are found a connection string is derived with a `DATABASE_NAME` from the KeystoneJS project name.

### `mongooseConfig` (optional)

These options are passed directly through to `mongoose.connect()`.

See: <https://mongoosejs.com/docs/api.html#mongoose_Mongoose-connect> for a detailed list of options.
