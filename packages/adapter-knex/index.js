const knex = require('knex');
const pSettle = require('p-settle');
const {
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
} = require('@voussoir/keystone/adapters');
const {
  objMerge,
  flatten,
  escapeRegExp,
  pick,
  omit,
  arrayToObject,
  resolveAllKeys,
  identity,
} = require('@voussoir/utils');

class KnexAdapter extends BaseKeystoneAdapter {
  constructor() {
    super(...arguments);
    this.name = this.name || 'knex';
    this.listAdapterClass = this.listAdapterClass || this.defaultListAdapterClass;
  }

  async _connect(to, config = {}) {
    const {
      client = 'postgres',
      connection = to ||
        process.env.KNEX_URI ||
        'postgres://keystone5:k3yst0n3@127.0.0.1:5432/ks5_dev',
      schemaName = 'keystone',
      ...rest
    } = config;
    this.knex = knex({
      ...rest,
      client,
      connection,
    });
    this.schemaName = schemaName;
  }

  async postConnect() {
    await this.dropDatabase();

    const createResult = await pSettle(
      Object.values(this.listAdapters).map(listAdapter => listAdapter.createTable())
    );

    const errors = createResult.filter(({ isRejected }) => isRejected);

    if (errors.length) {
      const error = new Error('Post connection error - in postConnect');
      error.errors = errors.map(({ reason }) => reason);
      console.log(error.errors);
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
        await listAdapter.createForeignKeys();
      } catch (err) {
        fkResult.push({ isRejected: true, reason: err });
      }
    });
    return fkResult;
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
      .map(listAdapter => `${this.schemaName}."${listAdapter.key}"`)
      .join(',');
    return this.knex.raw(`DROP TABLE IF EXISTS ${tables} CASCADE`);
  }
}

class KnexListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter) {
    super(...arguments);
    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
    this.realKeys = [];
  }

  prepareFieldAdapter(fieldAdapter) {
    if (!(fieldAdapter.isRelationship && fieldAdapter.config.many)) {
      this.realKeys.push(...(fieldAdapter.realKeys ? fieldAdapter.realKeys : [fieldAdapter.path]));
    }
  }

  _schema() {
    return this.parentAdapter.schema();
  }

  _query() {
    return this.parentAdapter.getQueryBuilder();
  }

  _manyTable(path) {
    return `${this.key}_${path}`;
  }

  async createTable() {
    await this._schema().createTable(this.key, table => {
      // Create an index column
      table.increments('id');
      // Create the required columns for each field;
      this.fieldAdapters.forEach(adapter => {
        if (!(adapter.isRelationship && adapter.config.many)) {
          const column = adapter.createColumn(table);
          if (adapter.config.isUnique) {
            column.unique();
          }
          if (adapter.config.isRequired && !adapter.isRelationship) {
            column.notNullable(column);
          }
        }
      });
    });
  }

  async createForeignKeys() {
    const relationshipAdapters = this.fieldAdapters.filter(adapter => adapter.isRelationship);

    // Add foreign key constraints on this table
    await this._schema().table(this.key, table => {
      relationshipAdapters
        .filter(adapter => !adapter.config.many)
        .forEach(adapter => adapter.createForiegnKey(table, this.parentAdapter.schemaName));
    });

    // Create adjacency tables for the 'many' relationships
    await Promise.all(
      relationshipAdapters
        .filter(adapter => adapter.config.many)
        .map(async adapter => {
          const tableName = this._manyTable(adapter.path);
          try {
            await this._schema().dropTableIfExists(tableName);
          } catch (err) {
            console.log('Failed to drop');
            console.log(err);
            throw err;
          }
          await this._schema().createTable(tableName, table => {
            table.increments('id');
            table.integer(`${this.key}_id`).unsigned();
            table
              .foreign(`${this.key}_id`)
              .references('id')
              .inTable(`${this.parentAdapter.schemaName}.${this.key}`)
              .onDelete('CASCADE');
            table.integer(adapter.refListId).unsigned();
            table
              .foreign(adapter.refListId)
              .references('id')
              .inTable(`${this.parentAdapter.schemaName}.${adapter.refListKey}`)
              .onDelete('CASCADE');
          });
        })
    );
  }

  async _create(data) {
    // Insert the real data into the table
    const realData = pick(data, this.realKeys);
    const item = (await this._query()
      .insert(realData)
      .into(this.key)
      .returning(['id', ...Object.keys(realData)]))[0];

    // For every many-field, update the many-table
    const manyItem = await resolveAllKeys(
      arrayToObject(
        this.fieldAdapters.filter(
          fieldAdapter =>
            fieldAdapter.isRelationship &&
            fieldAdapter.config.many &&
            data[fieldAdapter.path] &&
            data[fieldAdapter.path].length
        ),
        'path',
        async a =>
          this._query()
            .insert(
              data[a.path].map(id => ({
                [`${this.key}_id`]: item.id,
                [a.refListId]: parseInt(id, 10),
              }))
            )
            .into(this._manyTable(a.path))
            .returning(a.refListId)
      )
    );

    return { ...item, ...manyItem };
  }

  async _delete(id) {
    // Traverse all other lists and remove references to this item
    await Promise.all(
      Object.values(this.parentAdapter.listAdapters).map(adapter =>
        Promise.all(
          adapter.fieldAdapters
            .filter(a => a.isRelationship && a.refListKey === this.key)
            .map(a =>
              a.config.many
                ? adapter
                    ._query()
                    .table(adapter._manyTable(a.path))
                    .where(a.refListId, id)
                    .del()
                : adapter
                    ._query()
                    .table(adapter.key)
                    .where(a.path, id)
                    .update({ [a.path]: null })
            )
        )
      )
    );
    // Delete the actual item
    return this._query()
      .table(this.key)
      .where({ id })
      .del();
  }

  async _populateMany(result) {
    // Takes an existing result and merges in all the many-relationship fields
    // by performing a query on their join-tables.
    return {
      ...result,
      ...(await resolveAllKeys(
        arrayToObject(
          this.fieldAdapters.filter(a => a.isRelationship && a.config.many),
          'path',
          async a =>
            (await this._query()
              .select(a.refListId)
              .from(this._manyTable(a.path))
              .where(`${this.key}_id`, result.id)
              .returning(a.refListId)).map(x => x[a.refListId])
        )
      )),
    };
  }

  async _update(id, data) {
    // Update the real data
    const realData = pick(data, this.realKeys);
    const query = this._query()
      .table(this.key)
      .where({ id });
    if (Object.keys(realData).length) {
      query.update(realData);
    }
    const item = (await query.returning(['id', ...this.realKeys]))[0];

    // For every many-field, update the many-table
    const manyData = omit(data, this.realKeys);
    await Promise.all(
      Object.entries(manyData).map(async ([path, newValues]) => {
        newValues = newValues.map(id => parseInt(id, 10));
        const a = this.fieldAdaptersByPath[path];
        const tableName = this._manyTable(a.path);

        // Future task: Is there some way to combine the following three
        // operations into a single query?

        // Work out what we've currently got
        const currentValues = await this._query()
          .select('id', a.refListId)
          .from(tableName)
          .where(`${this.key}_id`, item.id);

        // Delete what needs to be deleted
        const needsDelete = currentValues
          .filter(x => !newValues.includes(x[a.refListId]))
          .map(({ id }) => id);
        if (needsDelete.length) {
          await this._query()
            .table(tableName)
            .whereIn('id', needsDelete)
            .del();
        }
        // Add what needs to be added
        const currentRefIds = currentValues.map(x => x[a.refListId]);
        const valuesToInsert = newValues
          .filter(id => !currentRefIds.includes(id))
          .map(id => ({
            [`${this.key}_id`]: item.id,
            [a.refListId]: id,
          }));
        if (valuesToInsert.length) {
          await this._query()
            .insert(valuesToInsert)
            .into(tableName);
        }
      })
    );

    return this._populateMany(item);
  }

  async _findAll() {
    const results = await this._query()
      .table(this.key)
      .select();
    return results.map(result => this._populateMany(result));
  }

  async _findById(id) {
    const result = (await this._query()
      .table(this.key)
      .select()
      .where('id', parseInt(id, 10)))[0];
    return result ? await this._populateMany(result) : null;
  }

  async _find(condition) {
    return await this._itemsQuery({ where: { ...condition } });
  }

  async _findOne(condition) {
    return (await this._itemsQuery({ where: { ...condition } }))[0];
  }

  _allQueryConditions(tableAlias) {
    const dbPathTransform = dbPath => `${tableAlias}.${dbPath}`;
    const idPath = dbPathTransform('id');
    return {
      id: value => b => b.where(idPath, parseInt(value, 10)),
      id_not: value => b =>
        value === null
          ? b.whereNotNull(idPath)
          : b.where(idPath, '!=', parseInt(value, 10)).orWhereNull(idPath),
      id_in: value => b =>
        value.includes(null)
          ? b
              .whereIn(idPath, value.filter(x => x !== null).map(x => parseInt(x, 10)))
              .orWhereNull(idPath)
          : b.whereIn(idPath, value.map(x => parseInt(x, 10))),
      id_not_in: value => b =>
        value.includes(null)
          ? b
              .whereNotIn(idPath, value.filter(x => x !== null).map(x => parseInt(x, 10)))
              .whereNotNull(idPath)
          : b.whereNotIn(idPath, value.map(x => parseInt(x, 10))).orWhereNull(idPath),
      ...objMerge(
        this.fieldAdapters.map(fieldAdapter =>
          fieldAdapter.getQueryConditions(dbPathTransform(fieldAdapter.dbPath))
        )
      ),
    };
  }

  // Recursively traverse the `where` query to identify which tables need to be joined, and on which fields.
  // We perform joins on non-many relationship fields which are mentioned in the where query.
  // Many relationships are handle with separate queries.
  // Joins are performed as left outer joins on fromTable.fromCol to toTable.id
  // Returns: [{
  //   fromCol:
  //   fromTable:
  //   toTable:
  // }]
  _traverseJoins(where, alias, aliases) {
    // These are the conditions which we know how to explicitly handle
    const nonJoinConditions = Object.keys(this._allQueryConditions());
    // Which means these are all the `where` conditions which are non-trivial and may require a join operation.
    Object.keys(where)
      .filter(path => !nonJoinConditions.includes(path))
      .forEach(path => {
        if (path === 'AND' || path === 'OR') {
          // AND/OR we need to traverse their children
          where[path].forEach(x => this._traverseJoins(x, alias, aliases));
        } else {
          const adapter = this.fieldAdaptersByPath[path];
          if (adapter) {
            // If no adapter is found, it must be a query of the form `foo_some`, `foo_every`, etc.
            // These correspond to many-relationships, which are handled separately

            // We need a join of the form:
            // ... LEFT OUTER JOIN {otherList} AS t1 ON {alias}.{path} = t1.id
            // Each join should result in a unique alias (t1, t2, etc), so we key the aliases
            // object on a key which combines the current alias, path, and the name of the list we're joining to.
            const otherList = adapter.refListKey;
            const key = `${alias}.${path}.${otherList}`;
            if (!aliases[key]) {
              aliases[key] = `t${Object.keys(aliases).length + 1}`;
            }
            this.getListAdapterByKey(otherList)._traverseJoins(where[path], aliases[key], aliases);
          }
        }
      });
  }

  async _buildManyWhereClause(path, where) {
    // Many relationship. Do explicit queries to identify which IDs match the query
    // and return a where clause of the form `id in [...]`.
    // (NB: Is there a more efficient way to do this? Quite probably. Definitely worth
    // investigating for someone with mad SQL skills)
    const [p, q] = path.split('_');
    const thisID = `${this.key}_id`;
    const tableName = this._manyTable(p);
    const otherList = this.fieldAdaptersByPath[p].refListKey;

    // If performing an <>_every query, we need to count how many related items each item has
    const relatedCountById =
      q === 'every' &&
      arrayToObject(
        await this._query()
          .select(thisID)
          .count('*')
          .from(tableName)
          .groupBy(thisID),
        thisID,
        x => x.count
      );

    // Identify and count all the items in the referenced list which match the query
    const matchingItems = await this.getListAdapterByKey(otherList)._itemsQuery({ where });
    const matchingCount = await this._query()
      .select(thisID)
      .count('*')
      .from(tableName)
      .whereIn(`${otherList}_id`, matchingItems.map(({ id }) => id))
      .groupBy(thisID);
    const matchingCountById = arrayToObject(matchingCount, thisID, x => x.count);

    // Identify all the IDs in this table which meet the every/some/none criteria
    const validIDs = (await this._query()
      .select('id')
      .from(tableName))
      .map(({ id }) => ({ id, count: matchingCountById[id] || 0 }))
      .filter(
        ({ id, count }) =>
          (q === 'every' && count === (relatedCountById[id] || 0)) ||
          (q === 'some' && count > 0) ||
          (q === 'none' && count === 0)
      )
      .map(({ id }) => id);
    return b => b.whereIn('id', validIDs);
  }

  // Recursively traverses the `where` query to build up a list of knex query functions.
  // These will be applied as a where ... andWhere chain on the joined table.
  async _traverseWhereClauses(where, alias, aliases) {
    let whereClauses = [];
    const conditions = this._allQueryConditions(alias);
    const nonJoinConditions = Object.keys(conditions);

    await Promise.all(
      Object.keys(where).map(async path => {
        if (nonJoinConditions.includes(path)) {
          // This is a simple data field which we know how to handle
          whereClauses.push(conditions[path](where[path]));
        } else if (path === 'AND' || path === 'OR') {
          // AND/OR need to traverse both side of the query
          const subClauses = flatten(
            await Promise.all(where[path].map(d => this._traverseWhereClauses(d, alias, aliases)))
          );
          whereClauses.push(b => {
            b.where(subClauses[0]);
            subClauses.slice(1).forEach(whereClause => {
              if (path === 'AND') b.andWhere(whereClause);
              else b.orWhere(whereClause);
            });
          });
        } else {
          // We have a relationship field
          const adapter = this.fieldAdaptersByPath[path];
          if (adapter) {
            // Non-many relationship. Traverse the sub-query, using the referenced list as a root.
            whereClauses.push(
              ...(await this.getListAdapterByKey(adapter.refListKey)._traverseWhereClauses(
                where[path],
                aliases[`${alias}.${path}.${adapter.refListKey}`],
                aliases
              ))
            );
          } else {
            // Many relationship
            whereClauses.push(await this._buildManyWhereClause(path, where[path]));
          }
        }
      })
    );
    return whereClauses;
  }

  async _itemsQuery(args, { meta = false } = {}) {
    const { where = {}, first, skip, orderBy } = args;

    // Construct the base of the query, which will either be a select or count operation
    const baseAlias = 't0';
    const partialQuery = this._query().from(`${this.key} as ${baseAlias}`);
    if (meta) {
      partialQuery.count();
    } else {
      partialQuery.select(`${baseAlias}.*`);
    }

    // Join all the tables required to perform the query
    const aliases = {};
    this._traverseJoins(where, baseAlias, aliases);
    Object.entries(aliases).forEach(([key, toAlias]) => {
      const [fromAlias, fromCol, toTable] = key.split('.');
      partialQuery.leftOuterJoin(
        `${toTable} as ${toAlias}`,
        `${toAlias}.id`,
        `${fromAlias}.${fromCol}`
      );
    });

    // Add all the where clauses to the query
    const whereClauses = await this._traverseWhereClauses(where, baseAlias, aliases);
    if (whereClauses.length) {
      partialQuery.where(whereClauses[0]);
      whereClauses.slice(1).forEach(whereClause => {
        partialQuery.andWhere(whereClause);
      });
    }

    // Add query modifiers as required
    if (!meta) {
      if (first !== undefined) {
        partialQuery.limit(first);
      }
      if (skip !== undefined) {
        partialQuery.offset(skip);
      }
      if (orderBy !== undefined) {
        const [orderField, orderDirection] = orderBy.split('_');
        const sortKey = this.fieldAdaptersByPath[orderField].sortKey || orderField;
        partialQuery.orderBy(sortKey, orderDirection);
      }
    }

    // Perform the query for everything except the `many` fields.
    const results = await partialQuery;

    if (meta) {
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

    // Populate the `many` fields with IDs and return the result
    return Promise.all(results.map(result => this._populateMany(result)));
  }
}

class KnexFieldAdapter extends BaseFieldAdapter {
  createColumn() {
    throw `createColumn not supported for field ${this.path} of type ${this.fieldName}`;
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
