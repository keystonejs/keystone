const pWaterfall = require('p-waterfall');

class BaseKeystoneAdapter {
  constructor(config) {
    this.config = { ...config };
    this.name = this.config.name;
    this.listAdapters = {};
  }

  newListAdapter(key, config = {}) {
    const listAdapterClass =
      config.listAdapterClass ||
      this.config.listAdapterClass ||
      this.constructor.defaultListAdapterClass;
    this.listAdapters[key] = new listAdapterClass(key, this, config);
    return this.listAdapters[key];
  }

  getListAdapterByKey(key) {
    return this.listAdapters[key];
  }

  async connect(to, config = {}) {
    // Connect to the database
    await this._connect(to, config);

    // Set up all list adapters
    try {
      const taskResults = await this.postConnect();
      const errors = taskResults.filter(({ isRejected }) => isRejected);

      if (errors.length) {
        const error = new Error('Post connection error');
        error.errors = errors.map(({ reason }) => reason);
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

  newFieldAdapter(fieldAdapterClass, name, path, getListByKey, config) {
    const adapter = new fieldAdapterClass(name, path, this, getListByKey, config);
    this.prepareFieldAdapter(adapter);
    adapter.setupHooks({
      addPreSaveHook: this.addPreSaveHook.bind(this),
      addPostReadHook: this.addPostReadHook.bind(this),
    });
    this.fieldAdapters.push(adapter);
    this.fieldAdaptersByPath[adapter.path] = adapter;
    return adapter;
  }

  prepareFieldAdapter() {}

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
    return this.onPostRead(this._delete(id));
  }

  async update(id, data) {
    return this.onPostRead(this._update(id, await this.onPreSave(data)));
  }

  async findAll() {
    return Promise.all((await this._findAll()).map(item => this.onPostRead(item)));
  }

  async findById(id) {
    return this.onPostRead(this._findById(id));
  }

  async find(condition) {
    return Promise.all((await this._find(condition)).map(item => this.onPostRead(item)));
  }

  async findOne(condition) {
    return this.onPostRead(this._findOne(condition));
  }

  async itemsQuery(args, { meta = false } = {}) {
    const results = await this._itemsQuery(args, { meta });
    return meta ? results : Promise.all(results.map(item => this.onPostRead(item)));
  }

  itemsQueryMeta(args) {
    return this.itemsQuery(args, { meta: true });
  }

  findFieldAdapterForQuerySegment(segment) {
    return this.fieldAdapters
      .filter(adapter => adapter.isRelationship)
      .find(adapter => adapter.supportsRelationshipQuery(segment));
  }
}

class BaseFieldAdapter {
  constructor(fieldName, path, listAdapter, getListByKey, { isRequired, isUnique, ...config }) {
    this.fieldName = fieldName;
    this.path = path;
    this.listAdapter = listAdapter;
    this.config = config;
    this.getListByKey = getListByKey;
    this.dbPath = path;
    this.isRequired = isRequired;
    this.isUnique = isUnique;
  }

  setupHooks() {}
}

module.exports = {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
};
