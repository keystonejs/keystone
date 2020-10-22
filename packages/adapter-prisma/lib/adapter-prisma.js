const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cuid = require('cuid');
const { getGenerators, formatSchema } = require('@prisma/sdk');
const { BaseKeystoneAdapter, BaseListAdapter, BaseFieldAdapter } = require('@keystonejs/keystone');
const { defaultObj, mapKeys, identity, flatten } = require('@keystonejs/utils');

class PrismaAdapter extends BaseKeystoneAdapter {
  constructor() {
    super(...arguments);
    this.name = 'prisma';
    this.provider = this.config.provider || 'postgresql';

    this.getPrismaPath = this.config.getPrismaPath || (() => '.prisma');
    this.getDbSchemaName = this.config.getDbSchemaName || (() => 'public');
    this.enableLogging = this.config.enableLogging || false;
    this.url = this.config.url || process.env.DATABASE_URL;
  }

  async _connect({ rels }) {
    await this._generateClient(rels);
    const { PrismaClient } = require(this.clientPath);
    this.prisma = new PrismaClient({
      log: this.enableLogging && ['query'],
      datasources: { [this.provider]: { url: this._url() } },
    });
    await this.prisma.$connect();
  }

  _url() {
    // By default we put `schema=public` onto all `DATABASE_URL` values.
    // If this isn't what a user wants, they can update `getSchemaName` to return either
    // a different dbSchemaName, or null if they just want to use the DATABASE_URL as it is.
    // TODO: Should we default to 'public' or null?
    if (this.provider === 'postgresql') {
      return this.dbSchemaName ? `${this.url}?schema=${this.dbSchemaName}` : this.url;
    }
  }

  async _generateClient(rels) {
    // 1. Generate a formatted schema

    // 2. Check for existing schema
    // 2a1. If they're the same, we're golden
    // 2a2. If they're different, generate and run a migration
    // 2b. If it doesn't exist, generate and run a migration
    const clientDir = 'generated-client';
    const prismaSchema = await this._generatePrismaSchema({ rels, clientDir });
    // See if there is a prisma client available for this hash
    const prismaPath = this.getPrismaPath({ prismaSchema });
    this.schemaPath = path.join(prismaPath, 'schema.prisma');
    this.clientPath = path.resolve(`${prismaPath}/${clientDir}`);
    this.dbSchemaName = this.getDbSchemaName({ prismaSchema });

    // // If any of our critical directories are missing, or if the schema has changed, then
    // // we've got things to do.
    // const schemaState = 'matching';
    // if (schemaState !== 'matching') {
    //   // Write schema
    // }
    // if (!fs.existsSync(this.clientPath) || schemaState !== 'matching') {
    //   // Generate prisma client
    // }
    // if (/* something */ false){
    //   // generate and run a migration
    // }

    if (
      !fs.existsSync(this.clientPath) ||
      !fs.existsSync(this.schemaPath) ||
      fs.readFileSync(this.schemaPath, { encoding: 'utf-8' }) !== prismaSchema
    ) {
      if (fs.existsSync(this.clientPath)) {
        const existing = fs.readFileSync(this.schemaPath, { encoding: 'utf-8' });
        if (existing === prismaSchema) {
          // 2a1. If they're the same, we're golden
        } else {
          // 2a2. If they're different, generate and run a migration
          // Write prisma file
          this._writePrismaSchema({ prismaSchema });

          // Generate prisma client
          await this._generatePrismaClient();

          this._saveMigration({ name: `keystone-${cuid()}` });
          this._executeMigrations();
        }
      } else {
        this._writePrismaSchema({ prismaSchema });

        // Generate prisma client
        await this._generatePrismaClient();

        // Need to generate and run a migration!!!
        this._saveMigration({ name: 'init' });
        this._executeMigrations();
      }
    }
  }

  async _writePrismaSchema({ prismaSchema }) {
    // Make output dir (you know, just in case!)
    fs.mkdirSync(this.clientPath, { recursive: true });

    // Write prisma file
    fs.writeSync(fs.openSync(this.schemaPath, 'w'), prismaSchema);
  }

  async _generatePrismaClient() {
    const generator = (await getGenerators({ schemaPath: this.schemaPath }))[0];
    await generator.generate();
    generator.stop();
  }

  async _generatePrismaSchema({ rels, clientDir }) {
    const models = Object.values(this.listAdapters).map(listAdapter => {
      const scalarFields = flatten(
        listAdapter.fieldAdapters.filter(f => !f.field.isRelationship).map(f => f.getPrismaSchema())
      );
      const relFields = [
        ...flatten(
          listAdapter.fieldAdapters
            .map(({ field }) => field)
            .filter(f => f.isRelationship)
            .map(f => {
              const r = rels.find(r => r.left === f || r.right === f);
              const isLeft = r.left === f;
              if (r.cardinality === 'N:N') {
                const relName = r.tableName;
                return [`${f.path} ${f.refListKey}[] @relation("${relName}", references: [id])`];
              } else {
                const relName = `${r.tableName}${r.columnName}`;
                if (
                  (r.cardinality === 'N:1' && isLeft) ||
                  (r.cardinality === '1:N' && !isLeft) ||
                  (r.cardinality === '1:1' && isLeft)
                ) {
                  // We're the owner of the foreign key column
                  return [
                    `${f.path} ${f.refListKey}? @relation("${relName}", fields: [${f.path}Id], references: [id])`,
                    `${f.path}Id Int? @map("${r.columnName}")`,
                  ];
                } else if (r.cardinality === '1:1') {
                  return [`${f.path} ${f.refListKey}? @relation("${relName}")`];
                } else {
                  return [`${f.path} ${f.refListKey}[] @relation("${relName}")`];
                }
              }
            })
        ),
        ...flatten(
          rels
            .filter(({ right }) => !right)
            .filter(({ left }) => left.refListKey === listAdapter.key)
            .filter(({ cardinality }) => cardinality === 'N:N')
            .map(({ left: { path, listKey }, tableName }) => [
              `from_${path} ${listKey}[] @relation("${tableName}", references: [id])`,
            ])
        ),
      ];

      return `
        model ${listAdapter.key} {
          ${[...scalarFields, ...relFields].join('\n  ')}
        }`;
    });

    const enums = flatten(
      Object.values(this.listAdapters).map(listAdapter =>
        flatten(
          listAdapter.fieldAdapters
            .filter(f => !f.field.isRelationship)
            .filter(f => f.path !== 'id')
            .map(f => f.getPrismaEnums())
        )
      )
    );

    const header = `
      datasource ${this.provider} {
        url      = env("DATABASE_URL")
        provider = "${this.provider}"
      }
      generator client {
        provider = "prisma-client-js"
        output = "${clientDir}"
      }`;
    return await formatSchema({ schema: header + models.join('\n') + '\n' + enums.join('\n') });
  }

  async postConnect({ rels }) {
    Object.values(this.listAdapters).forEach(listAdapter => {
      listAdapter._postConnect({ rels, prisma: this.prisma });
    });

    if (this.config.dropDatabase && process.env.NODE_ENV !== 'production') {
      await this.dropDatabase();
    }
    return [];
  }

  // This will drop all the tables in the backing database. Use wisely.
  async dropDatabase() {
    let migrationNeeded = true;
    if (this.provider === 'postgresql') {
      for (const { tablename } of await this.prisma.$queryRaw(
        `SELECT tablename FROM pg_tables WHERE schemaname='${this.dbSchemaName}'`
      )) {
        if (tablename.includes('_Migration')) {
          migrationNeeded = false;
        }
        await this.prisma.$queryRaw(
          `TRUNCATE TABLE \"${this.dbSchemaName}\".\"${tablename}\" CASCADE;`
        );
      }
      for (const { relname } of await this.prisma.$queryRaw(
        `SELECT c.relname FROM pg_class AS c JOIN pg_namespace AS n ON c.relnamespace = n.oid WHERE c.relkind='S' AND n.nspname='${this.dbSchemaName}';`
      )) {
        if (!relname.includes('_Migration')) {
          await this.prisma.$queryRaw(
            `ALTER SEQUENCE \"${this.dbSchemaName}\".\"${relname}\" RESTART WITH 1;`
          );
        }
      }
    }

    if (migrationNeeded) {
      this._saveMigration({ name: 'init' });
      this._executeMigrations();
    }
  }

  _saveMigration({ name }) {
    this._runPrismaCmd(`migrate save --name ${name} --experimental`);
  }

  _executeMigrations() {
    this._runPrismaCmd('migrate up --experimental');
  }

  _runPrismaCmd(cmd) {
    return execSync(`yarn prisma ${cmd} --schema ${this.schemaPath}`, {
      env: { ...process.env, DATABASE_URL: this._url() },
      encoding: 'utf-8',
    });
  }

  disconnect() {
    return this.prisma.$disconnect();
    // Everything below here is being cleaned up in an attempt to help out the garbage collector
    // delete this.prisma;
    // Object.values(this.listAdapters).forEach(listAdapter => {
    //   delete listAdapter.prisma;
    // });
    // delete require.cache[require.resolve(this.clientPath)];
  }

  getDefaultPrimaryKeyConfig() {
    // Required here due to circular refs
    const { AutoIncrement } = require('@keystonejs/fields-auto-increment');
    return AutoIncrement.primaryKeyDefaults[this.name].getConfig();
  }

  async checkDatabaseVersion() {
    // FIXME: Decide what/how we want to check things here
  }
}

class PrismaListAdapter extends BaseListAdapter {
  constructor(key, parentAdapter) {
    super(...arguments);
    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
  }

  _postConnect({ rels, prisma }) {
    // https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/models#queries-crud
    // "By default the name of the property is the lowercase form of the model name,
    // e.g. user for a User model or post for a Post model."
    this.model = prisma[this.key.slice(0, 1).toLowerCase() + this.key.slice(1)];
    this.fieldAdapters.forEach(fieldAdapter => {
      fieldAdapter.rel = rels.find(
        ({ left, right }) =>
          left.adapter === fieldAdapter || (right && right.adapter === fieldAdapter)
      );
    });
  }

  ////////// Mutations //////////
  _include() {
    // We don't have a "real key" (i.e. a column in the table) if:
    //  * We're a N:N
    //  * We're the right hand side of a 1:1
    //  * We're the 1 side of a 1:N or N:1 (e.g we are the one with config: many)
    const include = defaultObj(
      this.fieldAdapters
        .filter(({ isRelationship }) => isRelationship)
        .filter(a => a.config.many || (a.rel.cardinality === '1:1' && a.rel.right.adapter === a))
        .map(a => a.path),
      { select: { id: true } }
    );
    return Object.keys(include).length > 0 ? include : undefined;
  }

  async _create(_data) {
    return this.model.create({
      data: mapKeys(_data, (value, path) =>
        this.fieldAdaptersByPath[path] && this.fieldAdaptersByPath[path].isRelationship
          ? {
              connect: Array.isArray(value)
                ? value.map(x => ({ id: Number(x) }))
                : { id: Number(value) },
            }
          : this.fieldAdaptersByPath[path] && this.fieldAdaptersByPath[path].gqlToPrisma
          ? this.fieldAdaptersByPath[path].gqlToPrisma(value)
          : value
      ),
      include: this._include(),
    });
  }

  async _update(id, _data) {
    const include = this._include();
    const existingItem = await this.model.findOne({ where: { id: Number(id) }, include });
    return this.model.update({
      where: { id: Number(id) },
      data: mapKeys(_data, (value, path) => {
        if (
          this.fieldAdaptersByPath[path] &&
          this.fieldAdaptersByPath[path].isRelationship &&
          Array.isArray(value)
        ) {
          const vs = value.map(x => Number(x));
          const toDisconnect = existingItem[path].filter(({ id }) => !vs.includes(id));
          const toConnect = vs
            .filter(id => !existingItem[path].map(({ id }) => id).includes(id))
            .map(id => ({ id }));
          return {
            disconnect: toDisconnect.length ? toDisconnect : undefined,
            connect: toConnect.length ? toConnect : undefined,
          };
        }
        return this.fieldAdaptersByPath[path] && this.fieldAdaptersByPath[path].isRelationship
          ? value === null
            ? { disconnect: true }
            : { connect: { id: Number(value) } }
          : value;
      }),
      include,
    });
  }

  async _delete(id) {
    return this.model.delete({ where: { id: Number(id) } });
  }

  ////////// Queries //////////
  async _itemsQuery(args, { meta = false, from = {} } = {}) {
    const filter = this.prismaFilter({ args, meta, from });
    if (meta) {
      let count = await this.model.count(filter);
      const { first, skip } = args;

      // Adjust the count as appropriate
      if (skip !== undefined) {
        count -= skip;
      }
      if (first !== undefined) {
        count = Math.min(count, first);
      }
      count = Math.max(0, count); // Don't want to go negative from a skip!
      return { count };
    } else {
      return this.model.findMany(filter);
    }
  }

  prismaFilter({ args: { where = {}, first, skip, sortBy, orderBy, search }, meta, from }) {
    const ret = {};
    const allWheres = this.processWheres(where);

    if (allWheres) {
      ret.where = allWheres;
    }

    if (from.fromId) {
      if (!ret.where) {
        ret.where = {};
      }
      const a = from.fromList.adapter.fieldAdaptersByPath[from.fromField];
      if (a.rel.cardinality === 'N:N') {
        const path = a.rel.right
          ? a.field === a.rel.right // Two-sided
            ? a.rel.left.path
            : a.rel.right.path
          : `from_${a.rel.left.path}`; // One-sided
        ret.where[path] = { some: { id: Number(from.fromId) } };
      } else {
        ret.where[a.rel.columnName] = { id: Number(from.fromId) };
      }
    }

    // TODO: Implement configurable search fields for lists
    const searchField = this.fieldAdaptersByPath['name'];
    if (search !== undefined && search !== '' && searchField) {
      if (searchField.fieldName === 'Text') {
        // FIXME: Think about regex
        if (!ret.where) ret.where = { name: search };
        else ret.where = { AND: [ret.where, { name: search }] };
        // const f = escapeRegExp;
        // this._query.andWhere(`${baseTableAlias}.name`, '~*', f(search));
      } else {
        // Return no results
        if (!ret.where) ret.where = { AND: [{ name: null }, { NOT: { name: null } }] };
        else ret.where = { AND: [ret.where, { name: null }, { NOT: { name: null } }] };
      }
    }

    // Add query modifiers as required
    if (!meta) {
      if (first !== undefined) {
        // SELECT ... LIMIT <first>
        ret.take = first;
      }
      if (skip !== undefined) {
        // SELECT ... OFFSET <skip>
        ret.skip = skip;
      }
      if (orderBy !== undefined) {
        // SELECT ... ORDER BY <orderField>
        const [orderField, orderDirection] = orderBy.split('_');
        const sortKey = this.fieldAdaptersByPath[orderField].sortKey || orderField;
        ret.orderBy = { [sortKey]: orderDirection.toLowerCase() };
      }
      if (sortBy !== undefined) {
        // SELECT ... ORDER BY <orderField>[, <orderField>, ...]
        if (!ret.orderBy) ret.orderBy = {};
        sortBy.forEach(s => {
          const [orderField, orderDirection] = s.split('_');
          const sortKey = this.fieldAdaptersByPath[orderField].sortKey || orderField;
          ret.orderBy[sortKey] = orderDirection.toLowerCase();
        });
      }

      this.fieldAdapters
        .filter(a => a.isRelationship && a.rel.cardinality === '1:1' && a.rel.right === a.field)
        .forEach(({ path }) => {
          if (!ret.include) ret.include = {};
          ret.include[path] = true;
        });
    }
    return ret;
  }

  processWheres(where) {
    const processRelClause = (fieldPath, clause) =>
      this.getListAdapterByKey(this.fieldAdaptersByPath[fieldPath].refListKey).processWheres(
        clause
      );
    const wheres = Object.entries(where).map(([condition, value]) => {
      if (condition === 'AND' || condition === 'OR') {
        return { [condition]: value.map(w => this.processWheres(w)) };
      } else if (
        this.fieldAdaptersByPath[condition] &&
        this.fieldAdaptersByPath[condition].isRelationship
      ) {
        // Non-many relationship. Traverse the sub-query, using the referenced list as a root.
        return { [condition]: processRelClause(condition, value) };
      } else {
        // See if any of our fields know what to do with this condition
        let dbPath = condition;
        let fieldAdapter = this.fieldAdaptersByPath[dbPath];
        while (!fieldAdapter && dbPath.includes('_')) {
          dbPath = dbPath.split('_').slice(0, -1).join('_');
          fieldAdapter = this.fieldAdaptersByPath[dbPath];
        }

        // FIXME: ask the field adapter if it supports the condition type
        const supported =
          fieldAdapter && fieldAdapter.getQueryConditions(fieldAdapter.dbPath)[condition];
        if (supported) {
          return supported(value);
        } else {
          // Many relationship
          const [fieldPath, constraintType] = condition.split('_');
          return { [fieldPath]: { [constraintType]: processRelClause(fieldPath, value) } };
        }
      }
    });

    return wheres.length === 0 ? undefined : wheres.length === 1 ? wheres[0] : { AND: wheres };
  }
}

class PrismaFieldAdapter extends BaseFieldAdapter {
  constructor() {
    super(...arguments);
  }

  _schemaField({ type, extra = '' }) {
    const { isRequired, isUnique } = this.config;
    return `${this.path} ${type}${isRequired || this.field.isPrimaryKey ? '' : '?'} ${
      this.field.isPrimaryKey ? '@id' : ''
    } ${isUnique && !this.field.isPrimaryKey ? '@unique' : ''} ${extra}`;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'String' })];
  }

  getPrismaEnums() {
    return [];
  }

  // The following methods provide helpers for constructing the return values of `getQueryConditions`.
  // Each method takes:
  //   `dbPath`: The database field/column name to be used in the comparison
  //   `f`: (non-string methods only) A value transformation function which converts from a string type
  //        provided by graphQL into a native adapter type.
  equalityConditions(dbPath, f = identity) {
    return {
      [this.path]: value => ({ [dbPath]: { equals: f(value) } }),
      [`${this.path}_not`]: value =>
        value === null
          ? { NOT: { [dbPath]: { equals: f(value) } } }
          : {
              OR: [{ NOT: { [dbPath]: { equals: f(value) } } }, { [dbPath]: { equals: null } }],
            },
    };
  }

  equalityConditionsInsensitive(dbPath, f = identity) {
    return {
      [`${this.path}_i`]: value => ({ [dbPath]: { equals: f(value), mode: 'insensitive' } }),
      [`${this.path}_not_i`]: value =>
        value === null
          ? { NOT: { [dbPath]: { equals: f(value), mode: 'insensitive' } } }
          : {
              OR: [
                { NOT: { [dbPath]: { equals: f(value), mode: 'insensitive' } } },
                { [dbPath]: null },
              ],
            },
    };
  }

  inConditions(dbPath, f = identity) {
    return {
      [`${this.path}_in`]: value =>
        value.includes(null)
          ? { OR: [{ [dbPath]: { in: value.filter(x => x !== null).map(f) } }, { [dbPath]: null }] }
          : { [dbPath]: { in: value.map(f) } },
      [`${this.path}_not_in`]: value =>
        value.includes(null)
          ? {
              AND: [
                { NOT: { [dbPath]: { in: value.filter(x => x !== null).map(f) } } },
                { NOT: { [dbPath]: null } },
              ],
            }
          : {
              OR: [{ NOT: { [dbPath]: { in: value.map(f) } } }, { [dbPath]: null }],
            },
    };
  }

  orderingConditions(dbPath, f = identity) {
    return {
      [`${this.path}_lt`]: value => ({ [dbPath]: { lt: f(value) } }),
      [`${this.path}_lte`]: value => ({ [dbPath]: { lte: f(value) } }),
      [`${this.path}_gt`]: value => ({ [dbPath]: { gt: f(value) } }),
      [`${this.path}_gte`]: value => ({ [dbPath]: { gte: f(value) } }),
    };
  }

  stringConditions(dbPath, f = identity) {
    return {
      [`${this.path}_contains`]: value => ({ [dbPath]: { contains: f(value) } }),
      [`${this.path}_not_contains`]: value => ({
        OR: [{ NOT: { [dbPath]: { contains: f(value) } } }, { [dbPath]: null }],
      }),
      [`${this.path}_starts_with`]: value => ({ [dbPath]: { startsWith: f(value) } }),
      [`${this.path}_not_starts_with`]: value => ({
        OR: [{ NOT: { [dbPath]: { startsWith: f(value) } } }, { [dbPath]: null }],
      }),
      [`${this.path}_ends_with`]: value => ({ [dbPath]: { endsWith: f(value) } }),
      [`${this.path}_not_ends_with`]: value => ({
        OR: [{ NOT: { [dbPath]: { endsWith: f(value) } } }, { [dbPath]: null }],
      }),
    };
  }

  stringConditionsInsensitive(dbPath, f = identity) {
    return {
      [`${this.path}_contains_i`]: value => ({
        [dbPath]: { contains: f(value), mode: 'insensitive' },
      }),
      [`${this.path}_not_contains_i`]: value => ({
        OR: [
          { NOT: { [dbPath]: { contains: f(value), mode: 'insensitive' } } },
          { [dbPath]: null },
        ],
      }),
      [`${this.path}_starts_with_i`]: value => ({
        [dbPath]: { startsWith: f(value), mode: 'insensitive' },
      }),
      [`${this.path}_not_starts_with_i`]: value => ({
        OR: [
          { NOT: { [dbPath]: { startsWith: f(value), mode: 'insensitive' } } },
          { [dbPath]: null },
        ],
      }),
      [`${this.path}_ends_with_i`]: value => ({
        [dbPath]: { endsWith: f(value), mode: 'insensitive' },
      }),
      [`${this.path}_not_ends_with_i`]: value => ({
        OR: [
          { NOT: { [dbPath]: { endsWith: f(value), mode: 'insensitive' } } },
          { [dbPath]: null },
        ],
      }),
    };
  }
}

PrismaAdapter.defaultListAdapterClass = PrismaListAdapter;

module.exports = { PrismaAdapter, PrismaListAdapter, PrismaFieldAdapter };
