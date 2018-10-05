class BaseKeystoneAdapter {
  constructor(config) {
    this.config = {
      listAdapterClass: this.constructor.defaultListAdapterClass,
      ...config,
    };
    this.name = this.config.name;
    this.listAdapters = {};
  }

  newListAdapter(key, config = {}) {
    const listAdapterClass = config.listAdapterClass || this.config.listAdapterClass;
    const adapter = new listAdapterClass(key, this, config);
    this.prepareListAdapter(adapter);
    this.listAdapters[key] = adapter;
    return adapter;
  }

  getListAdapterByKey(key) {
    return this.listAdapters[key];
  }

  prepareListAdapter() {}

  /**
   * @param Promise
   */
  pushSetupTask() {}
}

class BaseListAdapter {
  constructor(key, parentAdapter, config) {
    this.key = key;
    this.parentAdapter = parentAdapter;
    this.fieldAdapters = [];
    this.config = config;
  }

  newFieldAdapter(fieldAdapterClass, name, path, getListByKey, config) {
    const adapter = new fieldAdapterClass(name, path, this, getListByKey, config);
    this.prepareFieldAdapter(adapter);
    this.fieldAdapters.push(adapter);
    return adapter;
  }

  prepareFieldAdapter() {}
}

class BaseFieldAdapter {
  constructor(fieldName, path, listAdapter, getListByKey, config) {
    this.fieldName = fieldName;
    this.path = path;
    this.listAdapter = listAdapter;
    this.config = config;
    this.getListByKey = getListByKey;
  }
}

module.exports = {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
};
