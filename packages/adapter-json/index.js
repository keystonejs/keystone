const { escapeRegExp, identity, mapKeys, objMerge, flatten } = require('@keystone-alpha/utils');
const FileAsync = require('lowdb/adapters/FileAsync');
const lowdb = require('lowdb');
const lodashId = require('lodash-id');
const pSettle = require('p-settle');
const memoizeOne = require('memoize-one');

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
    return pSettle([this._dbInstance.defaults(mapKeys(this.listAdapters, () => [])).write()]);
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

/**
 * Testing with:
 *
 *
mutation add {
  first: createTodo(data: { name: "Do something" }) {
    id
    name
  }
  second: createTodo(data: { name: "Foo a thing" }) {
    id
    name
  }
}

query allTodos {
  allTodos {
    id
    name
  }
}

query whereID {
  allTodos(where: { id_not_in: ["50c571fe-c3dd-4f39-be94-5e56ecae43ac"] }) {
    id
    name
  }
}

query whereName {
  allTodos(
    where: {
      name_contains: "some"
      OR: [{ name_contains: "Dont" }, { name_contains_i: "THING" }]
    }
  ) {
    id
    name
  }
}

query onlyOR {
  allTodos(where: { OR: [{ name_contains_i: "do" }, { name_contains_i: "foo" }] }) {
    id
    name
  }
}
 */
class JSONListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter) {
    super(...arguments);

    this._parentAdapter = parentAdapter;
    this.getDBCollection = parentAdapter.getLowDBInstanceForList.bind(parentAdapter, key);
    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);

    this._allQueryConditions = memoizeOne(() => {
      const idMatcher = value => item => (value || []).includes(item.id);

      const buildChainableClauses = this._buildChainableClauses.bind(this);

      // prettier-ignore
      return {
        id:        value =>  _ =>          _.matchesProperty('id', value),
        id_not:    value =>  _ => _.negate(_.matchesProperty('id', value)),

        id_in:     value => () =>          idMatcher(value),
        id_not_in: value =>  _ => _.negate(idMatcher(value)),

        AND: values => _ => _.overEvery(
          flatten(values.map(buildChainableClauses))
            .map(clause => clause(_))
        ),

        OR: values => _ => _.overSome(
          flatten(values.map(buildChainableClauses))
            .map(clause => clause(_))
        ),

        ...objMerge(
          this.fieldAdapters.map(fieldAdapter =>
            fieldAdapter.getQueryConditions(fieldAdapter.dbPath)
          )
        ),
      };
    });
  }

  async _create(input) {
    return await this.getDBCollection()
      .insert(input)
      .write();
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
    const foundItem = this.getDBCollection()
      .getById(id)
      .value();
    // If it doesn't exist, return null not `undefined`
    return await (foundItem || null);
  }

  _find(where) {
    return this._constructWhereChain(this.getDBCollection(), where).value();
  }

  _findOne(where) {
    return this._constructWhereChain(this.getDBCollection(), where)
      .head()
      .value();
  }

  _buildChainableClauses(where) {
    const conditions = this._allQueryConditions();
    // Build up a list of functions we want to chain together as AND filters
    return Object.entries(where).map(([condition, value]) => {
      // TODO: if (isRelationship(condition)) { return buildRelationshipClause(condition, value) }
      return conditions[condition](value);
    });
  }

  _constructWhereChain(chain, where) {
    const lodash = this._parentAdapter.getLodash();
    return this._buildChainableClauses(where).reduce(
      (whereChain, clause) => whereChain.filter(clause(lodash)),
      chain
    );
  }

  /**
   * Given a where clause such as:
   *
   * where: {
   *   name_contains: 'foo',
   *   AND: [
   *     { done: false },
   *     { deleted: false },
   *   ],
   *   OR: [
   *     { name_contains: 'bar' },
   *     { name_contains: 'zip' },
   *   ],
   * }
   *
   * Turn this into a filter on the collection which ultimately ends up as:
   *
   * collection
   *   .filter(item => new RegExp(f('foo')).test(item.name))
   *   .filter(_.overEvery([
   *     .filter(item => item.done === false)
   *     .filter(item => item.deleted === false)
   *   ]))
   *   .filter(_.overSome([
   *     item => new RegExp(f('bar')).test(item.name),
   *     item => new RegExp(f('zip')).test(item.name),
   *   ]))
   */
  async _itemsQuery({ where, first, skip, orderBy, search }, { meta = false } = {}) {
    let chain = this.getDBCollection();

    if (where) {
      chain = this._constructWhereChain(chain, where);
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
    // prettier-ignore
    return {
      [this.path]:          value => _ =>          _.matchesProperty(dbPath, f(value)),
      [`${this.path}_not`]: value => _ => _.negate(_.matchesProperty(dbPath, f(value))),
    };
  }

  equalityConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    const matcher = value => item => new RegExp(`^${f(value)}$`, 'i').test(item[dbPath]);
    // prettier-ignore
    return {
      [`${this.path}_i`]:     value => () =>          matcher(value),
      [`${this.path}_not_i`]: value =>  _ => _.negate(matcher(value)),
    };
  }

  inConditions(dbPath, f = identity) {
    const matcher = value => item => (value || []).map(f).includes(item[dbPath]);
    // prettier-ignore
    return {
      [`${this.path}_in`]:     value => () =>          matcher(value),
      [`${this.path}_not_in`]: value =>  _ => _.negate(matcher(value)),
    };
  }

  orderingConditions(dbPath, f = identity) {
    // prettier-ignore
    return {
      [`${this.path}_lt`]:  value => () => item => item[dbPath] <  f(value),
      [`${this.path}_lte`]: value => () => item => item[dbPath] <= f(value),
      [`${this.path}_gt`]:  value => () => item => item[dbPath] >  f(value),
      [`${this.path}_gte`]: value => () => item => item[dbPath] >= f(value),
    };
  }

  stringConditions(dbPath) {
    const f = escapeRegExp;
    const regexTest = (regex, item) => new RegExp(regex).test(item[dbPath]);
    // prettier-ignore
    return {
      [`${this.path}_contains`]:        value => () => item =>  regexTest(f(value), item),
      [`${this.path}_not_contains`]:    value => () => item => !regexTest(f(value), item),
      [`${this.path}_starts_with`]:     value => () => item =>  regexTest(`^${f(value)}`, item),
      [`${this.path}_not_starts_with`]: value => () => item => !regexTest(`^${f(value)}`, item),
      [`${this.path}_ends_with`]:       value => () => item =>  regexTest(`${f(value)}$`, item),
      [`${this.path}_not_ends_with`]:   value => () => item => !regexTest(`${f(value)}$`, item),
    };
  }

  stringConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    const regexTest = (regex, item) => new RegExp(regex, 'i').test(item[dbPath]);
    // prettier-ignore
    return {
      [`${this.path}_contains_i`]:        value => () => item =>  regexTest(f(value), item),
      [`${this.path}_not_contains_i`]:    value => () => item => !regexTest(f(value), item),
      [`${this.path}_starts_with_i`]:     value => () => item =>  regexTest(`^${f(value)}`, item),
      [`${this.path}_not_starts_with_i`]: value => () => item => !regexTest(`^${f(value)}`, item),
      [`${this.path}_ends_with_i`]:       value => () => item =>  regexTest(`${f(value)}$`, item),
      [`${this.path}_not_ends_with_i`]:   value => () => item => !regexTest(`${f(value)}$`, item),
    };
  }
}

JSONAdapter.defaultListAdapterClass = JSONListAdapter;

module.exports = {
  JSONAdapter,
  JSONListAdapter,
  JSONFieldAdapter,
};
