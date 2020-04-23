const {
  escapeRegExp,
  pick,
  omit,
  arrayToObject,
  resolveAllKeys,
  identity,
  mapKeys,
  objMerge,
  flatten,
} = require('@keystonejs/utils');
const FileAsync = require('lowdb/adapters/FileAsync');
const Memory = require('lowdb/adapters/Memory');
const lowdb = require('lowdb');
const lodashId = require('lodash-id');
const pSettle = require('p-settle');
const memoizeOne = require('memoize-one');
const { BaseKeystoneAdapter, BaseListAdapter, BaseFieldAdapter } = require('@keystonejs/keystone');

class JSONAdapter extends BaseKeystoneAdapter {
  constructor({ adapter, inMemory = false, ...args } = {}) {
    super(args);
    this.adapter = adapter || inMemory ? new Memory() : new FileAsync();
    this.name = this.name || 'json';
    this.listAdapterClass = JSONListAdapter;
  }

  logDB() {
    return JSON.parse(JSON.stringify(this._dbInstance.getState(), null, 2));
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

  async postConnect({ rels }) {
    this.rels = rels;
    Object.values(this.listAdapters).forEach(listAdapter => {
      listAdapter._postConnect({ rels });
    });
    // Ensure we have a default empty array for all the lists

    let adjacencyTables = {};

    rels
      .filter(({ cardinality }) => {
        return cardinality === 'N:N';
      })
      .forEach(({ tableName }) => {
        adjacencyTables = { ...adjacencyTables, [tableName]: [] };
      });

    const listTables = mapKeys(this.listAdapters, () => []);
    return pSettle([this._dbInstance.defaults({ ...listTables, ...adjacencyTables }).write()]);
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

  getDefaultPrimaryKeyConfig() {
    // Required here due to circular refs
    const { Uuid } = require('@keystonejs/fields');
    return Uuid.primaryKeyDefaults[this.name].getConfig();
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
    this.getDBCollection = (collection = key) =>
      parentAdapter.getLowDBInstanceForList.bind(parentAdapter)(collection);
    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
    this.realKeys = [];
    this.tableName = this.key;
    this.rels = undefined;

    this._allQueryConditions = memoizeOne(() => {
      const idMatcher = value => item => (value || []).includes(item.id);

      const buildChainableClauses = this._buildChainableClauses.bind(this);

      return {
        id: value => _ => _.matchesProperty('id', value),
        id_not: value => _ => _.negate(_.matchesProperty('id', value)),

        id_in: value => () => idMatcher(value),
        id_not_in: value => _ => _.negate(idMatcher(value)),

        AND: values => _ =>
          _.overEvery(flatten(values.map(buildChainableClauses)).map(clause => clause(_))),

        OR: values => _ =>
          _.overSome(flatten(values.map(buildChainableClauses)).map(clause => clause(_))),

        ...objMerge(
          this.fieldAdapters.map(fieldAdapter =>
            fieldAdapter.getQueryConditions(fieldAdapter.dbPath)
          )
        ),
      };
    });
  }

  _postConnect({ rels }) {
    this.rels = rels;
    this.fieldAdapters.forEach(fieldAdapter => {
      fieldAdapter.rel = rels.find(
        ({ left, right }) =>
          left.adapter === fieldAdapter || (right && right.adapter === fieldAdapter)
      );
      if (fieldAdapter._hasRealKeys()) {
        this.realKeys.push(
          ...(fieldAdapter.realKeys ? fieldAdapter.realKeys : [fieldAdapter.path])
        );
      }
    });
  }

  async _processNonRealFields(data, processFunction) {
    const processed = await resolveAllKeys(
      arrayToObject(
        Object.entries(omit(data, this.realKeys)).map(([path, value]) => ({
          path,
          value,
          adapter: this.fieldAdaptersByPath[path],
        })),
        'path',
        processFunction
      )
    );
    return processed;
  }

  logDB() {
    return JSON.parse(JSON.stringify(this.parentAdapter._dbInstance.getState(), null, 2));
  }

  async _createSingle(realData) {
    const item = await this.getDBCollection()
      .insert(realData)
      .write();
    return { item, itemId: item.id };
  }

  async _create(data) {
    const realData = pick(data, this.realKeys);
    // Unset any real 1:1 fields
    await this._unsetOneToOneValues(realData);
    // await this._unsetForeignOneToOneValues(data, id); // todo

    // Insert the real data into the table
    const { item, itemId } = await this._createSingle(realData);

    // For every non-real-field, update the corresponding FK/join table.
    const manyItem = await this._processNonRealFields(data, async ({ value, adapter }) =>
      this._createOrUpdateField({ value, adapter, itemId })
    );

    // This currently over-populates the returned item.
    // We should only be populating non-many fields, but the non-real-fields are generally many,
    // which we want to ignore, with the exception of 1:1 fields with the FK on the other table,
    // which we want to actually keep!

    return { ...item, ...manyItem };
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
    const realData = pick(data, this.realKeys);

    // Unset any real 1:1 fields
    await this._unsetOneToOneValues(realData);
    // await this._unsetForeignOneToOneValues(data, id);
    const db = this.getDBCollection();

    // Update the real data
    if (Object.keys(realData).length) {
      await db
        .find({ id })
        .assign(realData)
        .write();
    }

    const item = await db
      .find({ id })
      .thru(value => (!value.id ? null : value))
      .pick(['id', ...this.realKeys])
      .value();

    // For every many-field, update the many-table
    await this._processNonRealFields(data, async ({ path, value: newValues, adapter }) => {
      const { cardinality, columnName, tableName } = adapter.rel;
      let value;
      // Future task: Is there some way to combine the following three
      // operations into a single query?

      if (cardinality !== '1:1') {
        // Work out what we've currently got
        let matchCol, selectCol;
        if (cardinality === 'N:N') {
          const { near, far } = this._getNearFar(adapter);
          matchCol = near;
          selectCol = far;
        } else {
          //cardinality === '1:N'
          matchCol = columnName;
          selectCol = 'id';
        }

        const currentRefIds = await this.getDBCollection(tableName)
          .filter({ [matchCol]: item.id })
          .value()
          .map(x => x[selectCol].toString());

        // Delete what needs to be deleted
        const needsDelete = currentRefIds.filter(x => !newValues.includes(x));
        if (needsDelete.length) {
          if (cardinality === 'N:N') {
            await this.getDBCollection(tableName)
              .remove(item => {
                const match1 = item[matchCol] === item.id;
                const match2 = needsDelete.includes(item[selectCol] === item.id);
                return match1 && match2;
              }) // far side
              .write();
          } else {
            //cardinality === '1:N'
            await this.getDBCollection(tableName)
              .find(item => needsDelete.includes(item[selectCol]))
              .assign({ [columnName]: null })
              .write();
          }
        }
        value = newValues.filter(id => !currentRefIds.includes(id));
      } else {
        // If there are values, update the other side to point to me,
        // otherwise, delete the thing that was pointing to me
        if (newValues === null) {
          const selectCol = columnName === path ? 'id' : columnName;
          await this._setNullByValue({ tableName, columnName: selectCol, value: item.id });
        }
        value = newValues;
      }
      await this._createOrUpdateField({ value, adapter, itemId: item.id });
    });
    const itemQRes = await this._itemsQuery({ where: { id: item.id }, first: 1 }, {}, true);
    return itemQRes[0] || null;
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

  async _find(where) {
    return this._constructWhereChain(this.getDBCollection(), where).value();
  }

  async _findOne(where) {
    return this._constructWhereChain(this.getDBCollection(), where)
      .head()
      .value();
  }

  _buildChainableClauses(where) {
    const conditions = this._allQueryConditions();
    // Build up a list of functions we want to chain together as AND filters
    return Object.entries(where).map(([condition, value]) => {
      // A "basic" condition we know how to handle
      if (conditions[condition]) {
        return conditions[condition](value);
      }

      // A more "complex" clause which some fields may support
      const fieldAdapterForClause = this.fieldAdapters.find(fieldAdapter =>
        fieldAdapter.supportsWhereClause(condition)
      );

      // Nope, nothing supports it, so we bail
      if (!fieldAdapterForClause) {
        throw new Error(
          `Unexpected where clause '${condition}: ${JSON.stringify(value)}' for list '${this.key}'.`
        );
      }

      // This adapter only knows how to handle special cases for `Relationship`
      // fields, so it'll throw for everything else left over
      if (!fieldAdapterForClause.isRelationship) {
        throw new Error(
          `Expected where clause '${condition}: ${JSON.stringify(value)}' to be handled by '${
            this.key
          }.${fieldAdapterForClause.path}', but it is not of type Relationship.`
        );
      }

      const refListAdapter = fieldAdapterForClause.getRefListAdapter();

      // Finally, we have our filter for the Relationship field
      return () => async obj => {
        const { many } = fieldAdapterForClause.config;
        // This nested where clause should only operate on the IDs that are
        // setup as relationships.
        const { dbPath, refListKey, refFieldPath } = fieldAdapterForClause;
        const relID = obj.id;
        const refCollection = this.getDBCollection(refListKey);
        // Get the ID of every related item from the refCollection
        const inIDs = await refCollection
          .filter(item => item[refFieldPath] === relID)
          .map(item => item.id)
          .value();

        const idFilter = many ? { id_in: inIDs } : { id: obj[dbPath] };

        // Combine the ID filter with whatever filter was initially passed in
        const refListWhere = { AND: [idFilter, value] };

        // And finally count how many of the related items match that filter
        const { count } = await refListAdapter._itemsQuery({ where: refListWhere }, { meta: true });

        if (many) {
          // Check for _some/_every/_none
          const conditionModifier = condition.split('_')[1];
          if (conditionModifier === 'some') {
            return count !== 0;
          } else if (conditionModifier === 'every') {
            return count === inIDs.length;
          } else if (conditionModifier === 'none') {
            return count === 0;
          }
          return false;
        }

        // For the to-single case
        return count !== 0;
      };
    });
  }

  async _constructWhereChain(chain, where) {
    const lodash = this._parentAdapter.getLodash();
    // _buildChainableClauses returns an array of functions (that, sadly, return more functions that can be async)
    // this async is 😭😭😭
    const asyncFilter = async (arr, predicate) =>
      Promise.all(arr.map(predicate)).then(results => arr.filter((_v, index) => results[index]));
    return this._buildChainableClauses(where)
      .map(clause => clause(lodash))
      .reduce(async (whereChain, clause) => asyncFilter(await whereChain, clause), chain);
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
   *     item => item.done === false,
   *     item => item.deleted === false,
   *   ]))
   *   .filter(_.overSome([
   *     item => new RegExp(f('bar')).test(item.name),
   *     item => new RegExp(f('zip')).test(item.name),
   *   ]))
   */
  async _itemsQuery({ where, first, skip, orderBy, search }, { meta = false, from = {} } = {}) {
    let chain = this.getDBCollection();

    // Joins/where to effectively translate us onto a different list
    if (Object.keys(from).length) {
      const a = from.fromList.adapter.fieldAdaptersByPath[from.fromField];

      const { cardinality, columnName } = a.rel;

      // const otherTableAlias = this._getNextBaseTableAlias();

      if (cardinality === 'N:N') {
        const { near, far } = from.fromList.adapter._getNearFar(a);
        // this._query.leftOuterJoin(
        //   `${tableName} as ${otherTableAlias}`,
        //   `${otherTableAlias}.${far}`,
        //   `${baseTableAlias}.id`
        // );
        // this._query.whereRaw('true');
        // this._query.andWhere(`${otherTableAlias}.${near}`, `=`, from.fromId);

        console.log({ near, far });

        chain = chain.filter(item => item[columnName] === from.fromId);
      } else {
        // 1:N
        chain = chain.filter(item => item[columnName] === from.fromId);
      }
    }

    if (where) {
      chain = await this._constructWhereChain(chain, where);
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
      const [orderField, orderDirection] = orderBy.split('_');

      if (!orderField || !orderDirection || !['ASC', 'DESC'].includes(orderDirection)) {
        throw new Error('Invalid `orderBy` option received: ' + orderBy);
      }
      const sortKey = this.fieldAdaptersByPath[orderField].sortKey || orderField;

      chain = chain.orderBy([sortKey], [orderDirection.toLowerCase()]);
    }

    if (typeof skip === 'number') {
      chain = chain.drop(skip);
    }

    if (typeof first === 'number') {
      chain = chain.take(first);
    }

    const items = await chain.value();

    if (meta) {
      return {
        count: items.length,
      };
    }
    return items;
  }

  _getNearFar(fieldAdapter) {
    const { rel, path, listAdapter } = fieldAdapter;
    const { columnNames } = rel;
    const columnKey = `${listAdapter.key}.${path}`;
    return columnNames[columnKey];
  }

  async _createOrUpdateField({ value, adapter, itemId }) {
    const { cardinality, columnName, tableName } = adapter.rel;

    // N:N - put it in the many table
    // 1:N - put it in the FK col of the other table
    // 1:1 - put it in the FK col of the other table

    if (cardinality === '1:1') {
      if (value !== null) {
        const item = await this.getDBCollection(tableName)
          .find({ id: value })
          .assign({ [columnName]: itemId })
          .write();
        return { id: item.id };
      } else {
        return null;
      }
    } else {
      const values = value; // Rename this because we have a many situation
      if (values.length) {
        if (cardinality === 'N:N') {
          const { near, far } = this._getNearFar(adapter);
          const item = await this.getDBCollection(tableName)
            .insert(values.map(id => ({ [near]: itemId, [far]: id })))
            .write();
          return { item };
        } else {
          // cardinality === '1:N'
          const items = await this.getDBCollection(tableName)
            .filter(d => values.includes(d.id))
            .each(item => (item[columnName] = itemId))
            .write();
          return items.map(item => item.id);
        }
      } else {
        return [];
      }
    }
  }

  // ToDo: Adapt these methods for JSON
  async _unsetOneToOneValues(realData) {
    // If there's a 1:1 FK in the real data we need to go and
    // delete it from any other item;
    await Promise.all(
      Object.entries(realData)
        .map(([key, value]) => ({ value, adapter: this.fieldAdaptersByPath[key] }))
        .filter(({ adapter }) => adapter && adapter.isRelationship)
        .filter(
          ({ value, adapter: { rel } }) =>
            rel.cardinality === '1:1' && rel.tableName === this.tableName && value !== null
        )
        .map(({ value, adapter: { rel: { tableName, columnName } } }) =>
          this._setNullByValue({ tableName, columnName, value })
        )
    );
  }

  async _setNullByValue({ tableName, columnName, value }) {
    console.log('_setNullByValue');
    // Untested:
    const item = await this.getDBCollection(tableName)
      .find({ [columnName]: value })
      .set({ [columnName]: null });

    return item;
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
      [this.path]: value => _ => item => {
        if (item[dbPath] !== null && item[dbPath] !== undefined) {
          return _.matchesProperty(dbPath, f(value))(item);
        }
        return false;
      },
      [`${this.path}_not`]: value => _ => _.negate(_.matchesProperty(dbPath, f(value))),
    };
  }

  equalityConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    const matcher = value => item => new RegExp(`^${f(value)}$`, 'i').test(item[dbPath]);

    return {
      [`${this.path}_i`]: value => () => matcher(value),
      [`${this.path}_not_i`]: value => _ => _.negate(matcher(value)),
    };
  }

  inConditions(dbPath, f = identity) {
    // using matchesProperty cause it handles date comparision
    // But there's gotta be a more "lodashy" way to write this?
    const matcher = (value, _) => item =>
      (value || []).some(v => _.matchesProperty(dbPath, f(v))(item));

    return {
      [`${this.path}_in`]: value => _ => matcher(value, _),
      [`${this.path}_not_in`]: value => _ => _.negate(matcher(value, _)),
    };
  }

  orderingConditions(dbPath, f = identity) {
    const filterNullValues = cb => item => {
      if (item[dbPath] === null) {
        return false;
      }
      return cb(item);
    };
    return {
      [`${this.path}_lt`]: value => () =>
        filterNullValues(item => item[dbPath] < f(value), f(value)),
      [`${this.path}_lte`]: value => () =>
        filterNullValues(item => item[dbPath] <= f(value), f(value)),
      [`${this.path}_gt`]: value => () =>
        filterNullValues(item => item[dbPath] > f(value), f(value)),
      [`${this.path}_gte`]: value => () =>
        filterNullValues(item => item[dbPath] >= f(value), f(value)),
    };
  }

  stringConditions(dbPath) {
    const f = escapeRegExp;
    const regexTest = (regex, item) => new RegExp(regex).test(item[dbPath]);
    return {
      [`${this.path}_contains`]: value => () => item => regexTest(f(value), item),
      [`${this.path}_not_contains`]: value => () => item => !regexTest(f(value), item),
      [`${this.path}_starts_with`]: value => () => item => regexTest(`^${f(value)}`, item),
      [`${this.path}_not_starts_with`]: value => () => item => !regexTest(`^${f(value)}`, item),
      [`${this.path}_ends_with`]: value => () => item => regexTest(`${f(value)}$`, item),
      [`${this.path}_not_ends_with`]: value => () => item => !regexTest(`${f(value)}$`, item),
    };
  }

  stringConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    const regexTest = (regex, item) => new RegExp(regex, 'i').test(item[dbPath]);

    return {
      [`${this.path}_contains_i`]: value => () => item => regexTest(f(value), item),
      [`${this.path}_not_contains_i`]: value => () => item => !regexTest(f(value), item),
      [`${this.path}_starts_with_i`]: value => () => item => regexTest(`^${f(value)}`, item),
      [`${this.path}_not_starts_with_i`]: value => () => item => !regexTest(`^${f(value)}`, item),
      [`${this.path}_ends_with_i`]: value => () => item => regexTest(`${f(value)}$`, item),
      [`${this.path}_not_ends_with_i`]: value => () => item => !regexTest(`${f(value)}$`, item),
    };
  }

  _hasRealKeys() {
    // We don't have a "real key" (i.e. a column in the table) if:
    //  * We're a N:N
    //  * We're the right hand side of a 1:1
    //  * We're the 1 side of a 1:N or N:1 (e.g we are the one with config: many)
    return !(
      this.isRelationship &&
      (this.config.many || (this.rel.cardinality === '1:1' && this.rel.right.adapter === this))
    );
  }
}

JSONAdapter.defaultListAdapterClass = JSONListAdapter;

module.exports = {
  JSONAdapter,
  JSONListAdapter,
  JSONFieldAdapter,
};
