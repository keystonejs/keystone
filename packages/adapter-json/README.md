---
section: packages
title: Database Adapter - JSON
---

# JSON Database Adapter

## Usage

```javascript
const { JSONAdapter } = require('@keystonejs/adapter-json');

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new JSONAdapter(),
});

keystone.connect('./database.json');
```

## API

### `databasePath`

_**Default:**_ `./database.json`

The file to read and write data.
