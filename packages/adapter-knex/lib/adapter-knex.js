const { versionGreaterOrEqualTo } = require('@keystonejs/utils');

const knex = require('knex');
const pSettle = require('p-settle');
const { BaseKeystoneAdapter, BaseListAdapter, BaseFieldAdapter } = require('@keystonejs/keystone');
const logger = require('@keystonejs/logger').logger('knex');

const {
  escapeRegExp,
  pick,
  omit,
  arrayToObject,
  resolveAllKeys,
  identity,
} = require('@keystonejs/utils');
const slugify = require('@sindresorhus/slugify');

class KnexAdapter extends BaseKeystoneAdapter {
  constructor({ knexOptions = {}, schemaName = 'public' } = {}) {
    super(...arguments);
    this.client = knexOptions.client || 'postgres';
    this.name = 'knex';
    this.minVer = '9.6.5';
    this.schemaName = schemaName;
    this.listAdapterClass = this.listAdapterClass || this.defaultListAdapterClass;
  }

  async _connect({ name }) {
    const { knexOptions = {} } = this.config;
    const { connection } = knexOptions;
    let knexConnection =
      connection || process.env.CONNECT_TO || process.env.DATABASE_URL || process.env.KNEX_URI;

    if (!knexConnection) {
      const defaultDbName = slugify(name, { separator: '_' }) || 'keystone';
      knexConnection = `postgres://localhost/${defaultDbName}`;
      logger.warn(`No Knex connection URI specified. Defaulting to '${knexConnection}'`);
    }

    this.knex = knex({
      client: this.client,
      connection: knexConnection,
      ...knexOptions,
    });

    // Knex will not error until a connection is made
    // To check the connection we run a test query
    const result = await this.knex.raw('select 1+1 as result').catch(result => ({
      error: result.error || result,
    }));
    if (result.error) {
      const connectionError = result.error;
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

    return result;
  }

  async postConnect() {
    Object.values(this.listAdapters).forEach(listAdapter => {
      listAdapter._postConnect();
    });

    // Run this only if explicity configured and still never in production
    if (this.config.dropDatabase && process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'test') {
        console.log('Knex adapter: Dropping database');
      }
      await this.dropDatabase();
    } else {
      return [];
    }
    return this._createTables();
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

    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }

    const fkResult = [];
    await asyncForEach(Object.values(this.listAdapters), async listAdapter => {
      try {
        const relationshipAdapters = listAdapter.fieldAdapters.filter(
          adapter => adapter.isRelationship
        );

        // Add foreign key constraints on this table
        await this.schema().table(listAdapter.tableName, table => {
          relationshipAdapters
            .filter(adapter => !adapter.config.many)
            .forEach(adapter =>
              table
                .foreign(adapter.path)
                .references('id')
                .inTable(`${this.schemaName}.${adapter.getRefListAdapter().tableName}`)
            );
        });

        // Create adjacency tables for the 'many' relationships
        await Promise.all(
          relationshipAdapters
            .filter(adapter => adapter.config.many)
            .map(adapter =>
              this._createAdjacencyTable({
                tableName: listAdapter._manyTable(adapter.path),
                relationshipFa: adapter,
                leftListAdapter: listAdapter,
              })
            )
        );
      } catch (err) {
        fkResult.push({ isRejected: true, reason: err });
      }
    });
    return fkResult;
  }

  async _createAdjacencyTable({ tableName, relationshipFa, leftListAdapter }) {
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
    const leftPkFa = leftListAdapter.getPrimaryKeyAdapter();
    const leftFkPath = `${leftListAdapter.key}_${leftPkFa.path}`;

    const rightListAdapter = dbAdapter.getListAdapterByKey(relationshipFa.refListKey);
    const rightPkFa = rightListAdapter.getPrimaryKeyAdapter();
    const rightFkPath = `${rightListAdapter.key}_${leftPkFa.path}`;

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

  // This will completely drop the backing database. Use wisely.
  dropDatabase() {
    const tables = Object.values(this.listAdapters)
      .map(listAdapter => `"${this.schemaName}"."${listAdapter.tableName}"`)
      .join(',');
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
  }

  prepareFieldAdapter() {}

  _postConnect() {
    this.fieldAdapters.forEach(fieldAdapter => {
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

  _manyTable(relationshipFieldPath) {
    return `${this.key}_${relationshipFieldPath}`;
  }

  async createTable() {
    // Let the field adapter add what it needs to the table schema
    await this._schema().createTable(this.tableName, table => {
      this.fieldAdapters.forEach(adapter => adapter.addToTableSchema(table));
    });
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

  ////////// Mutations //////////

  async _createOrUpdateField({ value, adapter, itemId }) {
    const rel = {
      cardinality: 'N:N',
      tableName: this._manyTable(adapter.path),
      columnNames: { [this.key]: { near: `${this.key}_id`, far: adapter.refListId } },
    };
    const { cardinality, tableName, columnNames } = rel;
    if (cardinality === '1:1') {
      // Implement me
    } else {
      const values = value; // Rename this because we have a many situation
      if (values && values.length) {
        if (cardinality === 'N:N') {
          const itemCol = columnNames[this.key].near;
          const otherCol = columnNames[this.key].far;
          return this._query()
            .insert(values.map(id => ({ [itemCol]: itemId, [otherCol]: id })))
            .into(tableName)
            .returning(otherCol);
        } else {
          // Implement me
        }
      } else {
        return [];
      }
    }
  }

  async _create(data) {
    const realData = pick(data, this.realKeys);

    // Insert the real data into the table
    const item = (
      await this._query()
        .insert(realData)
        .into(this.tableName)
        .returning('*')
    )[0];

    // For every many-field, update the many-table
    const manyItem = await this._processNonRealFields(data, async ({ value, adapter }) =>
      this._createOrUpdateField({ value, adapter, itemId: item.id })
    );

    return { ...item, ...manyItem };
  }

  async _update(id, data) {
    const realData = pick(data, this.realKeys);
    // Update the real data
    const query = this._query()
      .table(this.tableName)
      .where({ id });
    if (Object.keys(realData).length) {
      query.update(realData);
    }
    const item = (await query.returning(['id', ...this.realKeys]))[0];

    // For every many-field, update the many-table
    await this._processNonRealFields(data, async ({ path, value: newValues, adapter }) => {
      const { refListId } = adapter;
      const rel = {
        cardinality: 'N:N',
        tableName: this._manyTable(path),
        columnNames: { [this.key]: { near: `${this.key}_id`, far: refListId } },
      };
      const { cardinality, tableName, columnNames } = rel;
      let value;
      // Future task: Is there some way to combine the following three
      // operations into a single query?

      if (cardinality !== '1:1') {
        // Work out what we've currently got
        const selectCol = columnNames[this.key].far;
        const matchCol = columnNames[this.key].near;
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
            // Implement me
          }
        }
        value = newValues.filter(id => !currentRefIds.includes(id));
      } else {
        // Implement me
      }
      await this._createOrUpdateField({ value, adapter, itemId: item.id });
    });
    return (await this._itemsQuery({ where: { id: item.id }, first: 1 }))[0] || null;
  }

  async _delete(id) {
    // Traverse all other lists and remove references to this item
    await Promise.all(
      Object.values(this.parentAdapter.listAdapters).map(adapter =>
        Promise.all(
          adapter.fieldAdapters
            .filter(a => a.isRelationship && a.refListKey === this.key)
            .map(a => {
              const rel = {
                cardinality: a.config.many ? 'N:N' : '1:N',
                columnName: a.path,
                tableName: a.config.many ? adapter._manyTable(a.path) : adapter.tableName,
                columnNames: { [this.key]: { near: a.refListId } },
              };
              const { cardinality, columnName, tableName, columnNames } = rel;
              if (cardinality === 'N:N') {
                return this._query()
                  .table(tableName)
                  .where(columnNames[this.key].near, id)
                  .del();
              } else {
                return this._query()
                  .table(tableName)
                  .where(columnName, id)
                  .update({ [columnName]: null });
              }
            })
        )
      )
    );
    // Delete the actual item
    return this._query()
      .table(this.tableName)
      .where({ id })
      .del();
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
    { where = {}, first, skip, orderBy, search },
    { meta = false, from = {} }
  ) {
    this._tableAliases = {};
    this._nextBaseTableAliasId = 0;
    const baseTableAlias = this._getNextBaseTableAlias();
    this._query = listAdapter._query().from(`${listAdapter.tableName} as ${baseTableAlias}`);
    if (meta) {
      // SELECT count from <tableName> as t0
      this._query.count();
    } else {
      // SELECT t0.* from <tableName> as t0
      this._query.column(`${baseTableAlias}.*`);
    }

    this._addJoins(this._query, listAdapter, where, baseTableAlias);
    if (Object.keys(from).length) {
      const rel = {
        cardinality: 'N:N',
        tableName: from.fromList.adapter._manyTable(from.fromField),
        columnNames: {
          [listAdapter.key]: {
            near: `${listAdapter.key}_id`,
            far: `${from.fromList.adapter.key}_id`,
          },
        },
      };
      const { cardinality, tableName, columnNames } = rel;
      const otherTableAlias = this._getNextBaseTableAlias();

      if (cardinality === 'N:N') {
        const { near, far } = columnNames[listAdapter.key];
        this._query.leftOuterJoin(
          `${tableName} as ${otherTableAlias}`,
          `${otherTableAlias}.${near}`,
          `${baseTableAlias}.id`
        );
        this._query.whereRaw('true');
        this._query.andWhere(`${otherTableAlias}.${far}`, `=`, from.fromId);
      } else {
        // Implement me
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
    if (!meta) {
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
        const [orderField, orderDirection] = orderBy.split('_');
        const sortKey = listAdapter.fieldAdaptersByPath[orderField].sortKey || orderField;
        this._query.orderBy(sortKey, orderDirection);
      }
    }
  }

  get() {
    return this._query;
  }

  _getNextBaseTableAlias() {
    const alias = `t${this._nextBaseTableAliasId++}`;
    this._tableAliases[alias] = true;
    return alias;
  }

  _getQueryConditionByPath(listAdapter, path, tableAlias) {
    const dbPath = path.split('_', 1);
    const fieldAdapter = listAdapter.fieldAdaptersByPath[dbPath];
    // Can't assume dbPath === fieldAdapter.dbPath (sometimes it isn't)
    return (
      fieldAdapter && fieldAdapter.getQueryConditions(`${tableAlias}.${fieldAdapter.dbPath}`)[path]
    );
  }

  // Recursively traverse the `where` query to identify required joins and add them to the query
  // We perform joins on non-many relationship fields which are mentioned in the where query.
  // Joins are performed as left outer joins on fromTable.fromCol to toTable.id
  _addJoins(query, listAdapter, where, tableAlias) {
    const joinPaths = Object.keys(where).filter(
      path => !this._getQueryConditionByPath(listAdapter, path)
    );
    for (let path of joinPaths) {
      if (path === 'AND' || path === 'OR') {
        // AND/OR we need to traverse their children
        where[path].forEach(x => this._addJoins(query, listAdapter, x, tableAlias));
      } else {
        const otherAdapter = listAdapter.fieldAdaptersByPath[path];
        // If no adapter is found, it must be a query of the form `foo_some`, `foo_every`, etc.
        // These correspond to many-relationships, which are handled separately
        if (otherAdapter) {
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
        const fieldAdapter = listAdapter.fieldAdaptersByPath[path];
        if (fieldAdapter) {
          // Non-many relationship. Traverse the sub-query, using the referenced list as a root.
          const otherListAdapter = listAdapter.getListAdapterByKey(fieldAdapter.refListKey);
          this._addWheres(whereJoiner, otherListAdapter, where[path], `${tableAlias}__${path}`);
        } else {
          // Many relationship
          const [p, constraintType] = path.split('_');
          const rel = {
            cardinality: 'N:N',
            tableName: listAdapter._manyTable(p),
            columnNames: {
              [listAdapter.key]: {
                near: `${listAdapter.key}_id`,
                far: `${listAdapter.fieldAdaptersByPath[p].refListKey}_id`,
              },
            },
          };
          const { cardinality, tableName, columnNames } = rel;
          const subBaseTableAlias = this._getNextBaseTableAlias();
          const otherList = listAdapter.fieldAdaptersByPath[p].refListKey;
          const otherListAdapter = listAdapter.getListAdapterByKey(otherList);
          const subQuery = listAdapter._query();
          let otherTableAlias;
          if (cardinality === '1:N' || cardinality === 'N:1') {
            // Implement me
          } else {
            otherTableAlias = `${subBaseTableAlias}__${p}`;
            subQuery
              .select(`${subBaseTableAlias}.${columnNames[listAdapter.key].near}`)
              .from(`${tableName} as ${subBaseTableAlias}`);
            subQuery.innerJoin(
              `${otherListAdapter.tableName} as ${otherTableAlias}`,
              `${otherTableAlias}.id`,
              `${subBaseTableAlias}.${columnNames[listAdapter.key].far}`
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

          if (constraintType === 'some') {
            whereJoiner(q => q.whereIn(`${tableAlias}.id`, subQuery));
          } else {
            whereJoiner(q => q.whereNotIn(`${tableAlias}.id`, subQuery));
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
    return !(this.isRelationship && this.config.many);
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

KnexAdapter.defaultListAdapterClass = KnexListAdapter;

module.exports = {
  KnexAdapter,
  KnexListAdapter,
  KnexFieldAdapter,
};
