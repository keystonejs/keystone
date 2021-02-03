const pWaterfall = require('p-waterfall');

class BaseKeystoneAdapter {
  constructor(config = {}) {
    this.config = { ...config };
    this.listAdapters = {};
    this.listAdapterClass = undefined;
  }

  newListAdapter(key, adapterConfig) {
    this.listAdapters[key] = new this.listAdapterClass(key, this, adapterConfig);
    return this.listAdapters[key];
  }

  getListAdapterByKey(key) {
    return this.listAdapters[key];
  }

  async connect({ rels }) {
    // Connect to the database
    await this._connect({ rels }, this.config);

    // Set up all list adapters
    try {
      // Validate the minimum database version requirements are met.
      await this.checkDatabaseVersion();

      const taskResults = await this.postConnect({ rels });
      const errors = taskResults.filter(({ isRejected }) => isRejected).map(({ reason }) => reason);

      if (errors.length) {
        if (errors.length === 1) throw errors[0];
        const error = new Error('Multiple errors in BaseKeystoneAdapter.postConnect():');
        error.errors = errors;
        throw error;
      }
    } catch (error) {
      // close the database connection if it was opened
      try {
        await this.disconnect();
      } catch (closeError) {
        // Add the inability to close the database connection as an additional
        // error
        error.errors = error.errors || [];
        error.errors.push(closeError);
      }
      // re-throw the error
      throw error;
    }
  }

  async postConnect() {}

  async checkDatabaseVersion() {}
}

class BaseListAdapter {
  constructor(key, parentAdapter, config) {
    this.key = key;
    this.parentAdapter = parentAdapter;
    this.fieldAdapters = [];
    this.fieldAdaptersByPath = {};
    this.config = config;

    this.preSaveHooks = [];
    this.postReadHooks = [
      item => {
        // FIXME: This can hopefully be removed once graphql 14.1.0 is released.
        // https://github.com/graphql/graphql-js/pull/1520
        if (item && item.id) item.id = item.id.toString();
        return item;
      },
    ];
  }

  newFieldAdapter(fieldAdapterClass, name, path, field, getListByKey, config) {
    const adapter = new fieldAdapterClass(name, path, field, this, getListByKey, config);
    adapter.setupHooks({
      addPreSaveHook: this.addPreSaveHook.bind(this),
      addPostReadHook: this.addPostReadHook.bind(this),
    });
    this.fieldAdapters.push(adapter);
    this.fieldAdaptersByPath[adapter.path] = adapter;
    return adapter;
  }

  addPreSaveHook(hook) {
    this.preSaveHooks.push(hook);
  }

  addPostReadHook(hook) {
    this.postReadHooks.push(hook);
  }

  onPreSave(item) {
    // We waterfall so the final item is a composed version of the input passing
    // through each consecutive hook
    return pWaterfall(this.preSaveHooks, item);
  }

  async onPostRead(item) {
    // We waterfall so the final item is a composed version of the input passing
    // through each consecutive hook
    return pWaterfall(this.postReadHooks, await item);
  }

  async create(data) {
    return this.onPostRead(this._create(await this.onPreSave(data)));
  }

  async delete(id) {
    return this._delete(id);
  }

  async update(id, data) {
    return this.onPostRead(this._update(id, await this.onPreSave(data)));
  }

  async findAll() {
    return Promise.all((await this._itemsQuery({})).map(item => this.onPostRead(item)));
  }

  async findById(id) {
    return this.onPostRead((await this._itemsQuery({ where: { id }, first: 1 }))[0] || null);
  }

  async find(condition) {
    return Promise.all(
      (await this._itemsQuery({ where: condition })).map(item => this.onPostRead(item))
    );
  }

  async findOne(condition) {
    return this.onPostRead((await this._itemsQuery({ where: condition, first: 1 }))[0]);
  }

  async itemsQuery(args, { meta = false, from = {} } = {}) {
    const results = await this._itemsQuery(args, { meta, from });
    return meta ? results : Promise.all(results.map(item => this.onPostRead(item)));
  }

  itemsQueryMeta(args) {
    return this.itemsQuery(args, { meta: true });
  }

  getFieldAdapterByPath(path) {
    return this.fieldAdaptersByPath[path];
  }
  getPrimaryKeyAdapter() {
    return this.fieldAdaptersByPath['id'];
  }
}

class BaseFieldAdapter {
  constructor(fieldName, path, field, listAdapter, getListByKey, config = {}) {
    this.fieldName = fieldName;
    this.path = path;
    this.field = field;
    this.listAdapter = listAdapter;
    this.config = config;
    this.getListByKey = getListByKey;
    this.dbPath = path;
  }

  setupHooks() {}
}

module.exports = {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
};
