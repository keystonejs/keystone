const { escapeRegExp, identity, mapKeys } = require('@keystone-alpha/utils');
const FileAsync = require('lowdb/adapters/FileAsync');
const lowdb = require('lowdb');
const lodashId = require('lodash-id');
const pSettle = require('p-settle');

const {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
} = require('@keystone-alpha/keystone');
const logger = require('@keystone-alpha/logger').logger('adapter-json');

class JSONAdapter extends BaseKeystoneAdapter {
  constructor({ adapter, ...args } = {}) {
    super(args);

    this.adapter = adapter || new FileAsync();

    this.name = this.name || 'json';

    this.listAdapterClass = JSONListAdapter;
  }

  async _connect(to = './database.json') {
    // Set the source file
    this.adapter.source = to;

    // Instantiate the lowdb instance
    // - Ensures a file exists and has a value on first run
    // - Attempts to parse existing file so will throw any malformed errors
    // early
    this._dbInstance = await lowdb(this.adapter);
    this._dbInstance._.mixin(lodashId);
  }

  postConnect() {
    // Ensure we have a default empty array for all the lists
    return pSettle([
      this._dbInstance.defaults(mapKeys(this.listAdapters, () => ([]))).write()
    ]);
  }

  read() {
    return this._dbInstance.read();
  }

  write(lists) {
    return this._dbInstance.setState(lists).write();
  }

  disconnect() {
    return Promise.resolve();
  }

  // This will completely drop the backing database. Use wisely.
  dropDatabase() {
    return this.write({});
  }

  getLowDBInstanceForList(key) {
    return this._dbInstance.get(key);
  }

  getLodash() {
    return this._dbInstance._;
  }
}

class JSONListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter) {
    super(...arguments);

    this._parentAdapter = parentAdapter;
    this.getDBCollection = parentAdapter.getLowDBInstanceForList.bind(parentAdapter, key);
    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
  }

  async _create(input) {
    return await this.getDBCollection().insert(input).write();
  }

  async _delete(id) {
    return await this.getDBCollection()
      // Remove it by id
      .remove({ id })
      // Return only the first item in the set that was removed
      .head()
      .write();
  }

  async _update(id, data) {
    return await this.getDBCollection()
      .find({ id })
      .assign(data)
      .thru(value => {
        // it doesn't exist, so return null as a fallback to the "return the new
        // item" API.
        if (!value.id) {
          return null;
        }
        return value;
      })
      .write();
  }

  async _findAll() {
    return await this.getDBCollection().value();
  }

  async _findById(id) {
    const foundItem = this.getDBCollection().getById(id).value();
    // If it doesn't exist, return null not `undefined`
    return await (foundItem || null);
  }

  async _find(condition) {
    return await this.getDBCollection().find(condition).value();
  }

  async _findOne(condition) {
    return await this.getDBCollection()
      .find(condition)
      .head()
      .value();
  }

  async _itemsQuery({ where, first, skip, orderBy, search }, { meta = false } = {}) {
    let chain = this.getDBCollection();

    if (where) {
      // TODO
      debugger;
      throw new Error('JSONAdapter#_itemsQuery() `where` param not implemented');
    }

    if (search) {
      const _ = this._parentAdapter.getLodash();
      chain = chain.filter(value => {
        // An array of all 'string' values in the object
        const strings = _.values(_.pickBy(value, _.isString));
        return _.some(strings, str => str.includes(search));
      });
    }

    if (orderBy) {
      const [field, direction] = orderBy.split('_');
      if (!field || !direction || !['ASC', 'DESC'].includes(direction)) {
        throw new Error('Invalid `orderBy` option received: ' + orderBy);
      }
      chain = chain.orderBy([field], [direction.toLowerCase()]);
    }

    if (typeof skip === 'number') {
      chain = chain.drop(skip);
    }

    if (typeof first === 'number') {
      chain = chain.take(first);
    }

    const items = await chain.value();

    if (!meta) {
      return items;
    }

    return {
      count: items.length,
    };
  }
}

class JSONFieldAdapter extends BaseFieldAdapter {
  // The following methods provide helpers for constructing the return values of `getQueryConditions`.
  // Each method takes:
  //   `dbPath`: The database field/column name to be used in the comparison
  //   `f`: (non-string methods only) A value transformation function which converts from a string type
  //        provided by graphQL into a native adapter type.
  equalityConditions(dbPath, f = identity) {
    return {
      [this.path]: value => (chain, _) => chain.filter(_.matchesProperty(dbPath, f(value))),
      [`${this.path}_not`]: value => (chain, _) =>
        chain.reject(_.matchesProperty(dbPath, f(value))),
    };
  }

  equalityConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    const matcher = value => item => new RegExp(`^${f(value)}$`, 'i').test(item[dbPath]);
    return {
      [`${this.path}_i`]: value => chain => chain.filter(matcher(value)),
      [`${this.path}_not_i`]: value => chain => chain.reject(matcher(value)),
    };
  }

  inConditions(dbPath, f = identity) {
    const matcher = value => item => (value || []).map(f).includes(item[dbPath]);
    return {
      [`${this.path}_in`]: value => chain => chain.filter(matcher(value)),
      [`${this.path}_not_in`]: value => chain => chain.reject(matcher(value)),
    };
  }

  orderingConditions(dbPath, f = identity) {
    return {
      [`${this.path}_lt`]: value => chain => chain.filter(item => item[dbPath] < f(value)),
      [`${this.path}_lte`]: value => chain => chain.filter(item => item[dbPath] <= f(value)),
      [`${this.path}_gt`]: value => chain => chain.filter(item => item[dbPath] > f(value)),
      [`${this.path}_gte`]: value => chain => chain.filter(item => item[dbPath] >= f(value)),
    };
  }

  stringConditions(dbPath) {
    const f = escapeRegExp;
    return {
      [`${this.path}_contains`]: value => chain =>
        chain.filter(item => new RegExp(f(value)).test(item[dbPath])),
      [`${this.path}_not_contains`]: value => chain =>
        chain.filter(item => !new RegExp(f(value)).test(item[dbPath])),
      [`${this.path}_starts_with`]: value => chain =>
        chain.filter(item => new RegExp(`^${f(value)}`).test(item[dbPath])),
      [`${this.path}_not_starts_with`]: value => chain =>
        chain.filter(item => !new RegExp(`^${f(value)}`).test(item[dbPath])),
      [`${this.path}_ends_with`]: value => chain =>
        chain.filter(item => new RegExp(`${f(value)}$`).test(item[dbPath])),
      [`${this.path}_not_ends_with`]: value => chain =>
        chain.filter(item => !new RegExp(`${f(value)}$`).test(item[dbPath])),
    };
  }

  stringConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    return {
      [`${this.path}_contains_i`]: value => chain =>
        chain.filter(item => new RegExp(f(value), 'i').test(item[dbPath])),
      [`${this.path}_not_contains_i`]: value => chain =>
        chain.filter(item => !new RegExp(f(value), 'i').test(item[dbPath])),
      [`${this.path}_starts_with_i`]: value => chain =>
        chain.filter(item => new RegExp(`^${f(value)}`, 'i').test(item[dbPath])),
      [`${this.path}_not_starts_with_i`]: value => chain =>
        chain.filter(item => !new RegExp(`^${f(value)}`, 'i').test(item[dbPath])),
      [`${this.path}_ends_with_i`]: value => chain =>
        chain.filter(item => new RegExp(`${f(value)}$`, 'i').test(item[dbPath])),
      [`${this.path}_not_ends_with_i`]: value => chain =>
        chain.filter(item => !new RegExp(`${f(value)}$`, 'i').test(item[dbPath])),
    };
  }
}

JSONAdapter.defaultListAdapterClass = JSONListAdapter;

module.exports = {
  JSONAdapter,
  JSONListAdapter,
  JSONFieldAdapter,
};
