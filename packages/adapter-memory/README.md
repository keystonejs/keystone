---
section: packages
title: Database Adapter - Memory
---

# Memory Database Adapter

## Usage

```javascript
const { MemoryAdapter } = require('@keystonejs/adapter-memory');

const keystone = new Keystone({
  name: 'My Awesome Project',
  adapter: new MemoryAdapter(),
});

keystone.connect();
```
