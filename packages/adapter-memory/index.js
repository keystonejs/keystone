const {
  JSONAdapter,
  JSONListAdapter,
  JSONFieldAdapter,
} = require('@keystone-alpha/adapter-json');
const Memory = require('lowdb/adapters/Memory');

class MemoryAdapter extends JSONAdapter {
  constructor() {
    super({ adapter: new Memory() });
    this.name = 'memory';
  }
}

module.exports = { MemoryAdapter, MemoryListAdapter: JSONListAdapter, MemoryFieldAdapter: JSONFieldAdapter };
