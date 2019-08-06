<!--[meta]
section: packages
title: Database Adapter - Mongoose
[meta]-->

# Mongoose Database Adapter

## Usage

```javascript
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const mongooseOptions = {};

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new MongooseAdapter(mongooseOptions),
});
```

## API

### `mongoDbUri`

_**Default:**_ `'mongodb://localhost/keystone'`

This URI will be passed directly to Mongoose (and hence MongoDB) as the location of the database.
