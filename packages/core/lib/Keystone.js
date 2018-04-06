module.exports = class Keystone {
  constructor() {
    this.lists = {};
  }
  createList(key, config) {
    this.lists[key] = config;
  }
};
