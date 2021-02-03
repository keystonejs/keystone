const { versionGreaterOrEqualTo } = require('@keystonejs/utils');

const knex = require('knex');
const pSettle = require('p-settle');
const { BaseKeystoneAdapter, BaseListAdapter, BaseFieldAdapter } = require('@keystonejs/keystone');

const {
  escapeRegExp,
  pick,
  omit,
  arrayToObject,
  resolveAllKeys,
  identity,
} = require('@keystonejs/utils');

class KnexAdapter extends BaseKeystoneAdapter {
  constructor({ knexOptions = {}, schemaName = 'public' } = {}) {
    super(...arguments);
    this.listAdapterClass = KnexListAdapter;
    this.client = knexOptions.client || 'postgres';
    this.name = 'knex';
    this.minVer = '9.6.5';
    this.schemaName = schemaName;
    this.rels = undefined;
  }

  async _connect() {
    const { knexOptions = {} } = this.config;
    const { connection } = knexOptions;
    let knexConnection =
      connection || process.env.CONNECT_TO || process.env.DATABASE_URL || process.env.KNEX_URI;

    if (!knexConnection) {
      throw new Error(`No Knex connection URI specified.`);
    }
    this.knex = knex({
      client: this.client,
      connection: knexConnection,
      ...knexOptions,
    });

    // Knex will not error until a connection is made
    // To check the connection we run a test query
    const connectResult = await this.knex.raw('select 1+1 as result').catch(result => ({
      error: result.error || result,
    }));
    if (connectResult.error) {
      const connectionError = connectResult.error;
      let dbName;
      if (typeof knexConnection === 'string') {
        dbName = knexConnection.split('/').pop();
      } else {
        dbName = knexConnection.database;
      }
      console.error(`Could not connect to database: '${dbName}'`);
      console.warn(
        `If this is the first time you've run Keystone, you can create your database with the following command:`
      );
      console.warn(`createdb ${dbName}`);
      throw connectionError;
    }
    return true;
  }

  async postConnect({ rels }) {
    this.rels = rels;
    Object.values(this.listAdapters).forEach(listAdapter => {
      listAdapter._postConnect({ rels });
    });

    if (this.config.dropDatabase && process.env.NODE_ENV !== 'production') {
      await this.dropDatabase();
      return this._createTables();
    } else {
      return [];
    }
  }

  async _verifyTables() {
    return pSettle(
      Object.values(this.listAdapters).map(listAdapter => {
        const { tableName } = listAdapter;
        // In theory it's possible for lists to have different adapters
        // check the adapter has a createTable method
        if (listAdapter.createTable) {
          return this.knex.schema
            .hasTable(tableName)
            .then(result => ({ tableName, hasTable: result }));
        } else {
          // For unknown list adapters, skip, by returning true
          return { tableName, hasTable: true };
        }
      })
    );
  }

  async _createTables() {
    const createResult = await pSettle(
      Object.values(this.listAdapters).map(listAdapter => listAdapter.createTable())
    );
    const errors = createResult.filter(({ isRejected }) => isRejected).map(({ reason }) => reason);

    if (errors.length) {
      if (errors.length === 1) throw errors[0];
      const error = new Error('Multiple errors in KnexAdapter.postConnect():');
      error.errors = errors;
      throw error;
    }

    const fkResult = [];
    for (const { left, right, cardinality, tableName } of this.rels) {
      try {
        if (cardinality === 'N:N') {
          await this._createAdjacencyTable({ left, tableName });
        } else if (cardinality === '1:N') {
          // create a FK on the right
          await this.schema().table(right.listKey, table => {
            table
              .foreign(right.path)
              .references('id')
              .inTable(`${this.schemaName}.${left.adapter.listAdapter.tableName}`);
          });
        } else if (cardinality === 'N:1') {
          // create a FK on the left
          await this.schema().table(left.listKey, table => {
            table
              .foreign(left.path)
              .references('id')
              .inTable(`${this.schemaName}.${left.adapter.refListKey}`);
          });
        } else {
          // 1:1, do it on the left. (c.f. Relationship/Implementation.js:addToTableSchema())
          await this.schema().table(left.listKey, table => {
            table
              .foreign(left.path)
              .references('id')
              .inTable(`${this.schemaName}.${left.adapter.refListKey}`);
          });
        }
      } catch (err) {
        fkResult.push({ isRejected: true, reason: err });
      }
    }
    return fkResult;
  }

  async _createAdjacencyTable({ left, tableName }) {
    // Create an adjacency table for the (many to many) relationship field adapter provided
    const dbAdapter = this;
    try {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Dropping table ${tableName}`);
      }
      await dbAdapter.schema().dropTableIfExists(tableName);
    } catch (err) {
      console.log('Failed to drop');
      console.log(err);
      throw err;
    }

    // To be clear..
    const { near, far } = left.adapter.listAdapter._getNearFar(left.adapter);
    const leftListAdapter = left.adapter.listAdapter;
    const leftPkFa = leftListAdapter.getPrimaryKeyAdapter();
    const leftFkPath = near;

    const rightListAdapter = dbAdapter.getListAdapterByKey(left.adapter.refListKey);
    const rightPkFa = rightListAdapter.getPrimaryKeyAdapter();
    const rightFkPath = far;

    // So right now, apparently, `many: true` indicates many-to-many
    // It's not clear how isUnique would be configured at the moment
    // Foreign keys are always indexed for now
    // We don't allow duplicate relationships so we don't actually need a primary key here
    await dbAdapter.schema().createTable(tableName, table => {
      leftPkFa.addToForeignTableSchema(table, {
        path: leftFkPath,
        isUnique: false,
        isIndexed: true,
        isNotNullable: true,
      });
      table
        .foreign(leftFkPath)
        .references(leftPkFa.path) // 'id'
        .inTable(`${dbAdapter.schemaName}.${leftListAdapter.tableName}`)
        .onDelete('CASCADE');

      rightPkFa.addToForeignTableSchema(table, {
        path: rightFkPath,
        isUnique: false,
        isIndexed: true,
        isNotNullable: true,
      });
      table
        .foreign(rightFkPath)
        .references(rightPkFa.path) // 'id'
        .inTable(`${dbAdapter.schemaName}.${rightListAdapter.tableName}`)
        .onDelete('CASCADE');
    });
  }

  schema() {
    return this.knex.schema.withSchema(this.schemaName);
  }

  getQueryBuilder() {
    return this.knex.withSchema(this.schemaName);
  }

  disconnect() {
    this.knex.destroy();
  }

  // This will drop all the tables in the backing database. Use wisely.
  dropDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Knex adapter: Dropping database');
    }
    const tables = [
      ...Object.values(this.listAdapters).map(
        listAdapter => `"${this.schemaName}"."${listAdapter.tableName}"`
      ),
      ...this.rels
        .filter(({ cardinality }) => cardinality === 'N:N')
        .map(({ tableName }) => `"${this.schemaName}"."${tableName}"`),
    ].join(',');
    return this.knex.raw(`DROP TABLE IF EXISTS ${tables} CASCADE`);
  }

  getDefaultPrimaryKeyConfig() {
    // Required here due to circular refs
    const { AutoIncrement } = require('@keystonejs/fields-auto-increment');
    return AutoIncrement.primaryKeyDefaults[this.name].getConfig(this.client);
  }

  async checkDatabaseVersion() {
    // Knex accepts both 'postgresql' and 'pg' as aliases for 'postgres'.
    if (!['postgres', 'postgresql', 'pg'].includes(this.client)) {
      console.log(
        `Knex adapter is not using a PostgreSQL client (${this.client}). Skipping database version check.`
      );

      return;
    }

    let version;
    try {
      // Using `raw` due to knex not having the SHOW command
      const result = await this.knex.raw('SHOW server_version;');
      // the version is inside the first row "server_version"
      version = result.rows[0].server_version;
    } catch (error) {
      throw new Error(`Error reading version from PostgreSQL: ${error}`);
    }

    if (!versionGreaterOrEqualTo(version, this.minVer)) {
      throw new Error(
        `PostgreSQL version ${version} is incompatible. Version ${this.minVer} or later is required.`
      );
    }
  }
}

class KnexListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter) {
    super(...arguments);
    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
    this.realKeys = [];
    this.tableName = this.key;
    this.rels = undefined;
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

  _schema() {
    return this.parentAdapter.schema();
  }

  _query() {
    return this.parentAdapter.getQueryBuilder();
  }

  _manyTable(relationshipAdapter) {
    return relationshipAdapter.rel.tableName;
  }

  async createTable() {
    // Let the field adapter add what it needs to the table schema
    await this._schema().createTable(this.tableName, table => {
      this.fieldAdapters.forEach(adapter => adapter.addToTableSchema(table, this.rels));
    });
  }

  ////////// Mutations //////////

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

  async _unsetForeignOneToOneValues(data, id) {
    // If there's a 1:1 FK in the data on a different list we need to go and
    // delete it from any other item;
    await Promise.all(
      Object.keys(data)
        .map(key => ({ adapter: this.fieldAdaptersByPath[key] }))
        .filter(({ adapter }) => adapter && adapter.isRelationship)
        .filter(
          ({ adapter: { rel } }) => rel.cardinality === '1:1' && rel.tableName !== this.tableName
        )
        .map(({ adapter: { rel: { tableName, columnName } } }) =>
          this._setNullByValue({ tableName, columnName, value: id })
        )
    );
  }

  async _processNonRealFields(data, processFunction) {
    return resolveAllKeys(
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
  }

  _getNearFar(fieldAdapter) {
    const { rel, path, listAdapter } = fieldAdapter;
    const { columnNames } = rel;
    const columnKey = `${listAdapter.key}.${path}`;
    return columnNames[columnKey];
  }

  async _createSingle(realData) {
    const item = (await this._query().insert(realData).into(this.tableName).returning('*'))[0];
    return { item, itemId: item.id };
  }

  async _setNullByValue({ tableName, columnName, value }) {
    return this._query()
      .table(tableName)
      .where(columnName, value)
      .update({ [columnName]: null });
  }

  async _createOrUpdateField({ value, adapter, itemId }) {
    const { cardinality, columnName, tableName } = adapter.rel;
    // N:N - put it in the many table
    // 1:N - put it in the FK col of the other table
    // 1:1 - put it in the FK col of the other table
    if (cardinality === '1:1') {
      if (value !== null) {
        return this._query()
          .table(tableName)
          .where('id', value)
          .update({ [columnName]: itemId })
          .returning('id');
      } else {
        return null;
      }
    } else {
      const values = value; // Rename this because we have a many situation
      if (values.length) {
        if (cardinality === 'N:N') {
          const { near, far } = this._getNearFar(adapter);
          return this._query()
            .insert(values.map(id => ({ [near]: itemId, [far]: id })))
            .into(tableName)
            .returning(far);
        } else {
          return this._query()
            .table(tableName)
            .whereIn('id', values) // 1:N
            .update({ [columnName]: itemId })
            .returning('id');
        }
      } else {
        return [];
      }
    }
  }

  async _create(data) {
    const realData = pick(data, this.realKeys);

    // Unset any real 1:1 fields
    await this._unsetOneToOneValues(realData);

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

  async _update(id, data) {
    const realData = pick(data, this.realKeys);

    // Unset any real 1:1 fields
    await this._unsetOneToOneValues(realData);
    await this._unsetForeignOneToOneValues(data, id);

    // Update the real data
    const query = this._query().table(this.tableName).where({ id });
    if (Object.keys(realData).length) {
      query.update(realData);
    }
    const item = (await query.returning(['id', ...this.realKeys]))[0];

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
          matchCol = columnName;
          selectCol = 'id';
        }
        const currentRefIds = (
          await this._query()
            .select(selectCol)
            .from(tableName)
            .where(matchCol, item.id)
            .returning(selectCol)
        ).map(x => x[selectCol].toString());

        // Delete what needs to be deleted
        const needsDelete = currentRefIds.filter(x => !newValues.includes(x));
        if (needsDelete.length) {
          if (cardinality === 'N:N') {
            await this._query()
              .table(tableName)
              .where(matchCol, item.id) // near side
              .whereIn(selectCol, needsDelete) // far side
              .del();
          } else {
            await this._query()
              .table(tableName)
              .whereIn(selectCol, needsDelete)
              .update({ [columnName]: null });
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
    return (await this._itemsQuery({ where: { id: item.id }, first: 1 }))[0] || null;
  }

  async _delete(id) {
    // Traverse all other lists and remove references to this item
    // We can't just traverse our own fields, because we might have been
    // a silent partner in a relationship, so we have no self-knowledge of it.
    await Promise.all(
      Object.values(this.parentAdapter.listAdapters).map(adapter =>
        Promise.all(
          adapter.fieldAdapters
            .filter(
              a => a.isRelationship && a.refListKey === this.key && a.rel.tableName !== this.key
            ) // If I (a list adapter) an implicated in the .rel of this field adapter
            .map(fieldAdapter => {
              const { cardinality, columnName, tableName } = fieldAdapter.rel;
              if (cardinality === 'N:N') {
                // FIXME: There is a User <-> User case which isn't captured here.
                const { far } = adapter._getNearFar(fieldAdapter);
                return this._query().table(tableName).where(far, id).del();
              } else {
                return this._setNullByValue({ tableName, columnName, value: id });
              }
            })
        )
      )
    );

    // Now traverse all self-referential relationships and sort them right out.
    await Promise.all(
      this.rels
        .filter(({ tableName, left }) => tableName === this.key && left.listKey === left.refListKey)
        .map(({ columnName, tableName }) =>
          this._setNullByValue({ tableName, columnName, value: id })
        )
    );

    // Delete the actual item
    return this._query().table(this.tableName).where({ id }).del();
  }

  ////////// Queries //////////

  async _itemsQuery(args, { meta = false, from = {} } = {}) {
    const query = new QueryBuilder(this, args, { meta, from }).get();
    const results = await query;

    if (meta) {
      const { first, skip } = args;
      const ret = results[0];
      let count = ret.count;

      // Adjust the count as appropriate
      if (skip !== undefined) {
        count -= skip;
      }
      if (first !== undefined) {
        count = Math.min(count, first);
      }
      count = Math.max(0, count); // Don't want to go negative from a skip!
      return { count };
    }

    return results;
  }
}

class QueryBuilder {
  constructor(
    listAdapter,
    { where = {}, first, skip, sortBy, orderBy, search },
    { meta = false, from = {} }
  ) {
    this._tableAliases = {};
    this._nextBaseTableAliasId = 0;
    const baseTableAlias = this._getNextBaseTableAlias();
    this._query = listAdapter._query().from(`${listAdapter.tableName} as ${baseTableAlias}`);

    if (search) {
      console.log('Knex adapter does not currently support search!');
    }

    if (!meta) {
      // SELECT t0.* from <tableName> as t0
      this._query.column(`${baseTableAlias}.*`);
    }

    this._addJoins(this._query, listAdapter, where, baseTableAlias);

    // Joins/where to effectively translate us onto a different list
    if (Object.keys(from).length) {
      const a = from.fromList.adapter.fieldAdaptersByPath[from.fromField];
      const { cardinality, tableName, columnName } = a.rel;
      const otherTableAlias = this._getNextBaseTableAlias();

      if (cardinality === 'N:N') {
        const { near, far } = from.fromList.adapter._getNearFar(a);
        this._query.leftOuterJoin(
          `${tableName} as ${otherTableAlias}`,
          `${otherTableAlias}.${far}`,
          `${baseTableAlias}.id`
        );
        this._query.whereRaw('true');
        this._query.andWhere(`${otherTableAlias}.${near}`, `=`, from.fromId);
      } else {
        this._query.leftOuterJoin(
          `${tableName} as ${otherTableAlias}`,
          `${baseTableAlias}.${columnName}`,
          `${otherTableAlias}.id`
        );
        this._query.whereRaw('true');
        this._query.andWhere(`${baseTableAlias}.${columnName}`, `=`, from.fromId);
      }
    } else {
      // Dumb sentinel to avoid juggling where() vs andWhere()
      // PG is smart enough to see it's a no-op, and now we can just keep chaining andWhere()
      this._query.whereRaw('true');
    }

    this._addWheres(w => this._query.andWhere(w), listAdapter, where, baseTableAlias);

    // TODO: Implement configurable search fields for lists
    const searchField = listAdapter.fieldAdaptersByPath['name'];
    if (search !== undefined && searchField) {
      if (searchField.fieldName === 'Text') {
        const f = escapeRegExp;
        this._query.andWhere(`${baseTableAlias}.name`, '~*', f(search));
      } else {
        this._query.whereRaw('false'); // Return no results
      }
    }

    // Add query modifiers as required
    if (meta) {
      this._query = listAdapter.parentAdapter.knex
        .count('* as count')
        .from(this._query.as('unused_alias'));
    } else {
      if (first !== undefined) {
        // SELECT ... LIMIT <first>
        this._query.limit(first);
      }
      if (skip !== undefined) {
        // SELECT ... OFFSET <skip>
        this._query.offset(skip);
      }
      if (orderBy !== undefined) {
        // SELECT ... ORDER BY <orderField>
        const [orderField, orderDirection] = this._getOrderFieldAndDirection(orderBy);
        const sortKey = listAdapter.fieldAdaptersByPath[orderField].sortKey || orderField;
        this._query.orderBy(sortKey, orderDirection);
      }
      if (sortBy !== undefined) {
        // SELECT ... ORDER BY <orderField>[, <orderField>, ...]
        this._query.orderBy(
          sortBy.map(s => {
            const [orderField, orderDirection] = this._getOrderFieldAndDirection(s);
            const sortKey = listAdapter.fieldAdaptersByPath[orderField].sortKey || orderField;

            return { column: sortKey, order: orderDirection };
          })
        );
      }
    }
  }

  get() {
    return this._query;
  }

  _getOrderFieldAndDirection(str) {
    const splits = str.split('_');
    const orderField = splits.slice(0, splits.length - 1).join('_');
    const orderDirection = splits[splits.length - 1];
    return [orderField, orderDirection];
  }

  _getNextBaseTableAlias() {
    const alias = `t${this._nextBaseTableAliasId++}`;
    this._tableAliases[alias] = true;
    return alias;
  }

  _getQueryConditionByPath(listAdapter, path, tableAlias) {
    let dbPath = path;
    let fieldAdapter = listAdapter.fieldAdaptersByPath[dbPath];

    while (!fieldAdapter && dbPath.includes('_')) {
      dbPath = dbPath.split('_').slice(0, -1).join('_');
      fieldAdapter = listAdapter.fieldAdaptersByPath[dbPath];
    }

    // Can't assume dbPath === fieldAdapter.dbPath (sometimes it isn't)
    return (
      fieldAdapter &&
      fieldAdapter.getQueryConditions(
        fieldAdapter.isRelationship &&
          fieldAdapter.rel.cardinality === '1:1' &&
          fieldAdapter.rel.right === fieldAdapter.field
          ? `${tableAlias}__${fieldAdapter.path}.id`
          : `${tableAlias}.${fieldAdapter.dbPath}`
      )[path]
    );
  }

  // Recursively traverse the `where` query to identify required joins and add them to the query
  // We perform joins on non-many relationship fields which are mentioned in the where query.
  // Joins are performed as left outer joins on fromTable.fromCol to toTable.id
  _addJoins(query, listAdapter, where, tableAlias) {
    // Insert joins to handle 1:1 relationships where the FK is stored on the other table.
    // We join against the other table and select its ID as the path name, so that it appears
    // as if it existed on the primary table all along!

    const joinPaths = Object.keys(where).filter(
      path => !this._getQueryConditionByPath(listAdapter, path)
    );

    const joinedPaths = [];
    listAdapter.fieldAdapters
      .filter(a => a.isRelationship && a.rel.cardinality === '1:1' && a.rel.right === a.field)
      .forEach(({ path, rel }) => {
        const { tableName, columnName } = rel;
        const otherTableAlias = `${tableAlias}__${path}`;
        if (!this._tableAliases[otherTableAlias]) {
          this._tableAliases[otherTableAlias] = true;
          // LEFT OUTERJOIN on ... table>.<id> = <otherTable>.<columnName> SELECT <othertable>.<id> as <path>
          query.leftOuterJoin(
            `${tableName} as ${otherTableAlias}`,
            `${otherTableAlias}.${columnName}`,
            `${tableAlias}.id`
          );
          query.select(`${otherTableAlias}.id as ${path}`);
          joinedPaths.push(path);
        }
      });

    for (let path of joinPaths) {
      if (path === 'AND' || path === 'OR') {
        // AND/OR we need to traverse their children
        where[path].forEach(x => this._addJoins(query, listAdapter, x, tableAlias));
      } else {
        const otherAdapter = listAdapter.fieldAdaptersByPath[path];
        // If no adapter is found, it must be a query of the form `foo_some`, `foo_every`, etc.
        // These correspond to many-relationships, which are handled separately
        if (otherAdapter && !joinedPaths.includes(path)) {
          // We need a join of the form:
          // ... LEFT OUTER JOIN {otherList} AS t1 ON {tableAlias}.{path} = t1.id
          // Each table has a unique path to the root table via foreign keys
          // This is used to give each table join a unique alias
          // E.g., t0__fk1__fk2
          const otherList = otherAdapter.refListKey;
          const otherListAdapter = listAdapter.getListAdapterByKey(otherList);
          const otherTableAlias = `${tableAlias}__${path}`;
          if (!this._tableAliases[otherTableAlias]) {
            this._tableAliases[otherTableAlias] = true;
            query.leftOuterJoin(
              `${otherListAdapter.tableName} as ${otherTableAlias}`,
              `${otherTableAlias}.id`,
              `${tableAlias}.${path}`
            );
          }
          this._addJoins(query, otherListAdapter, where[path], otherTableAlias);
        }
      }
    }
  }

  // Recursively traverses the `where` query and pushes knex query functions to whereJoiner,
  // which will normally do something like pass it to q.andWhere() to add to a query
  _addWheres(whereJoiner, listAdapter, where, tableAlias) {
    for (let path of Object.keys(where)) {
      const condition = this._getQueryConditionByPath(listAdapter, path, tableAlias);
      if (condition) {
        whereJoiner(condition(where[path]));
      } else if (path === 'AND' || path === 'OR') {
        whereJoiner(q => {
          // AND/OR need to traverse both side of the query
          let subJoiner;
          if (path == 'AND') {
            q.whereRaw('true');
            subJoiner = w => q.andWhere(w);
          } else {
            q.whereRaw('false');
            subJoiner = w => q.orWhere(w);
          }
          where[path].forEach(subWhere =>
            this._addWheres(subJoiner, listAdapter, subWhere, tableAlias)
          );
        });
      } else {
        // We have a relationship field
        let fieldAdapter = listAdapter.fieldAdaptersByPath[path];
        if (fieldAdapter) {
          // Non-many relationship. Traverse the sub-query, using the referenced list as a root.
          const otherListAdapter = listAdapter.getListAdapterByKey(fieldAdapter.refListKey);
          this._addWheres(whereJoiner, otherListAdapter, where[path], `${tableAlias}__${path}`);
        } else {
          // Many relationship
          const [p, constraintType] = path.split('_');
          fieldAdapter = listAdapter.fieldAdaptersByPath[p];
          const { rel } = fieldAdapter;
          const { cardinality, tableName, columnName } = rel;
          const subBaseTableAlias = this._getNextBaseTableAlias();
          const otherList = fieldAdapter.refListKey;
          const otherListAdapter = listAdapter.getListAdapterByKey(otherList);
          const subQuery = listAdapter._query();
          let otherTableAlias;
          let selectCol;
          if (cardinality === '1:N' || cardinality === 'N:1') {
            otherTableAlias = subBaseTableAlias;
            selectCol = columnName;
            subQuery
              .select(`${subBaseTableAlias}.${selectCol}`)
              .from(`${tableName} as ${subBaseTableAlias}`);
            // We need to filter out nulls before passing back to the top level query
            // otherwise postgres will give very incorrect answers.
            subQuery.whereNotNull(columnName);
          } else {
            const { near, far } = listAdapter._getNearFar(fieldAdapter);
            otherTableAlias = `${subBaseTableAlias}__${p}`;
            selectCol = near;
            subQuery
              .select(`${subBaseTableAlias}.${selectCol}`)
              .from(`${tableName} as ${subBaseTableAlias}`);
            subQuery.innerJoin(
              `${otherListAdapter.tableName} as ${otherTableAlias}`,
              `${otherTableAlias}.id`,
              `${subBaseTableAlias}.${far}`
            );
          }
          this._addJoins(subQuery, otherListAdapter, where[path], otherTableAlias);

          // some: the ID is in the examples found
          // none: the ID is not in the examples found
          // every: the ID is not in the counterexamples found
          // FIXME: This works in a general and logical way, but doesn't always generate the queries that PG can best optimise
          // 'some' queries would more efficient as inner joins

          if (constraintType === 'every') {
            subQuery.whereNot(q => {
              q.whereRaw('true');
              this._addWheres(w => q.andWhere(w), otherListAdapter, where[path], otherTableAlias);
            });
          } else {
            subQuery.whereRaw('true');
            this._addWheres(
              w => subQuery.andWhere(w),
              otherListAdapter,
              where[path],
              otherTableAlias
            );
          }

          // Ensure there therwhereIn/whereNotIn query is run against
          // a table with exactly one column.
          const subSubQuery = listAdapter.parentAdapter.knex
            .select(selectCol)
            .from(subQuery.as('unused_alias'));
          if (constraintType === 'some') {
            whereJoiner(q => q.whereIn(`${tableAlias}.id`, subSubQuery));
          } else {
            whereJoiner(q => q.whereNotIn(`${tableAlias}.id`, subSubQuery));
          }
        }
      }
    }
  }
}

class KnexFieldAdapter extends BaseFieldAdapter {
  constructor() {
    super(...arguments);

    // Just store the knexOptions; let the field types figure the rest out
    this.knexOptions = this.config.knexOptions || {};
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

  // Gives us a way to reference knex when configuring DB-level defaults, eg:
  // knexOptions: { dbDefault: (knex) => knex.raw('uuid_generate_v4()') }
  // We can't do this in the constructor as the knex instance doesn't exists
  get defaultTo() {
    if (this._defaultTo) {
      return this._defaultTo;
    }

    const defaultToSupplied = this.knexOptions.defaultTo;
    const knex = this.listAdapter.parentAdapter.knex;

    if (typeof defaultToSupplied === 'function') {
      this._defaultTo = defaultToSupplied(knex);
    } else {
      this._defaultTo = defaultToSupplied;
    }

    return this._defaultTo;
  }

  // Default nullability from isRequired in most cases
  // Some field types replace this logic (ie. Relationships)
  get isNotNullable() {
    if (this._isNotNullable) return this._isNotNullable;

    if (typeof this.knexOptions.isNotNullable === 'undefined') {
      if (this.field.isRequired) {
        this._isNotNullable = true;
      } else {
        // NOTE: We do our best to check for a default value below, but if a
        // function was supplied, we have no way of knowing what that function
        // will return until it's executed, so we err on the side of
        // permissiveness and assume the function may return `null`, and hence
        // this field is nullable.
        if (typeof this.field.defaultValue === 'function') {
          this._isNotNullable = false;
        } else {
          this._isNotNullable =
            typeof this.field.defaultValue !== 'undefined' && this.field.defaultValue !== null;
        }
      }
    }

    return this._isNotNullable;
  }

  addToTableSchema() {
    throw `addToTableSchema() missing from the ${this.fieldName} field type (used by ${this.path})`;
  }

  // The following methods provide helpers for constructing the return values of `getQueryConditions`.
  // Each method takes:
  //   `dbPath`: The database field/column name to be used in the comparison
  //   `f`: (non-string methods only) A value transformation function which converts from a string type
  //        provided by graphQL into a native adapter type.
  equalityConditions(dbPath, f = identity) {
    return {
      [this.path]: value => b => b.where(dbPath, f(value)),
      [`${this.path}_not`]: value => b =>
        value === null
          ? b.whereNotNull(dbPath)
          : b.where(dbPath, '!=', f(value)).orWhereNull(dbPath),
    };
  }

  equalityConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    return {
      [`${this.path}_i`]: value => b => b.where(dbPath, '~*', `^${f(value)}$`),
      [`${this.path}_not_i`]: value => b =>
        b.where(dbPath, '!~*', `^${f(value)}$`).orWhereNull(dbPath),
    };
  }

  inConditions(dbPath, f = identity) {
    return {
      [`${this.path}_in`]: value => b =>
        value.includes(null)
          ? b.whereIn(dbPath, value.filter(x => x !== null).map(f)).orWhereNull(dbPath)
          : b.whereIn(dbPath, value.map(f)),
      [`${this.path}_not_in`]: value => b =>
        value.includes(null)
          ? b.whereNotIn(dbPath, value.filter(x => x !== null).map(f)).whereNotNull(dbPath)
          : b.whereNotIn(dbPath, value.map(f)).orWhereNull(dbPath),
    };
  }

  orderingConditions(dbPath, f = identity) {
    return {
      [`${this.path}_lt`]: value => b => b.where(dbPath, '<', f(value)),
      [`${this.path}_lte`]: value => b => b.where(dbPath, '<=', f(value)),
      [`${this.path}_gt`]: value => b => b.where(dbPath, '>', f(value)),
      [`${this.path}_gte`]: value => b => b.where(dbPath, '>=', f(value)),
    };
  }

  stringConditions(dbPath) {
    const f = escapeRegExp;
    return {
      [`${this.path}_contains`]: value => b => b.where(dbPath, '~', f(value)),
      [`${this.path}_not_contains`]: value => b =>
        b.where(dbPath, '!~', f(value)).orWhereNull(dbPath),
      [`${this.path}_starts_with`]: value => b => b.where(dbPath, '~', `^${f(value)}`),
      [`${this.path}_not_starts_with`]: value => b =>
        b.where(dbPath, '!~', `^${f(value)}`).orWhereNull(dbPath),
      [`${this.path}_ends_with`]: value => b => b.where(dbPath, '~', `${f(value)}$`),
      [`${this.path}_not_ends_with`]: value => b =>
        b.where(dbPath, '!~', `${f(value)}$`).orWhereNull(dbPath),
    };
  }

  stringConditionsInsensitive(dbPath) {
    const f = escapeRegExp;
    return {
      [`${this.path}_contains_i`]: value => b => b.where(dbPath, '~*', f(value)),
      [`${this.path}_not_contains_i`]: value => b =>
        b.where(dbPath, '!~*', f(value)).orWhereNull(dbPath),
      [`${this.path}_starts_with_i`]: value => b => b.where(dbPath, '~*', `^${f(value)}`),
      [`${this.path}_not_starts_with_i`]: value => b =>
        b.where(dbPath, '!~*', `^${f(value)}`).orWhereNull(dbPath),
      [`${this.path}_ends_with_i`]: value => b => b.where(dbPath, '~*', `${f(value)}$`),
      [`${this.path}_not_ends_with_i`]: value => b =>
        b.where(dbPath, '!~*', `${f(value)}$`).orWhereNull(dbPath),
    };
  }
}

module.exports = {
  KnexAdapter,
  KnexListAdapter,
  KnexFieldAdapter,
};
