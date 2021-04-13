import pWaterfall from 'p-waterfall';
import { defaultObj, mapKeys, identity, flatten } from '@keystone-next/utils-legacy';
import { Implementation } from '@keystone-next/fields';
import { BaseKeystoneList } from '@keystone-next/types';

// Note: These type definitions are preliminary while we're working towards
// a full TypeScript conversion.
type Rel = {
  left: Implementation<any>;
  right: Implementation<any>;
  cardinality: 'N:N' | 'N:1' | '1:N' | '1:1';
  tableName: string;
  columnName: string;
};
type Rels = Rel[];

type ListAdapterConfig = { searchField?: string };

type ItemQueryArgs = Record<string, any>;

type IdType = string | number;

type FromType = { fromId?: IdType; fromField?: string; fromList?: BaseKeystoneList };

type PrismaModel = {
  count: (filter: Filter) => Promise<number>;
  findMany: (filter: Filter) => Promise<any[]>;
  delete: (arg: { where: { id: number } }) => Promise<void>;
  findUnique: (args: {
    where: { id: number };
    include?: Record<string, any>;
  }) => Promise<Record<string, any> | undefined>;
  create: (args: { data: Record<string, any>; include?: Record<string, any> }) => Promise<any>;
  update: (args: {
    where: { id: number };
    data: Record<string, any>;
    include?: Record<string, any>;
  }) => Promise<any>;
};

type Filter = {
  where?: Record<string, any>;
  take?: number;
  skip?: number;
  orderBy?: Record<string, any>;
  include?: Record<string, boolean>;
};

class PrismaAdapter {
  config: {
    prismaClient?: any;
    provider?: 'postgresql' | 'sqlite';
    enableLogging?: boolean;
    url?: string;
  };
  listAdapters: Record<string, PrismaListAdapter>;
  listAdapterClass?: typeof PrismaListAdapter;
  name: 'prisma';
  provider: 'postgresql' | 'sqlite';
  enableLogging: boolean;
  url: string;

  schemaPath?: string;
  clientPath?: string;
  prisma: any;

  constructor(config = {}) {
    this.config = { ...config };
    this.listAdapters = {};
    this.name = 'prisma';
    this.provider = this.config.provider || 'postgresql';
    this.enableLogging = this.config.enableLogging || false;
    this.url = this.config.url || process.env.DATABASE_URL || '';
  }

  newListAdapter(key: string, adapterConfig: ListAdapterConfig) {
    this.listAdapters[key] = new PrismaListAdapter(key, this, adapterConfig);
    return this.listAdapters[key];
  }

  getListAdapterByKey(key: string) {
    return this.listAdapters[key];
  }

  async connect({ rels }: { rels: Rels }) {
    // Connect to the database
    // the adapter was already connected since we have a prisma client
    // it may have been disconnected since it was connected though
    // so connect but don't regenerate the prisma client
    if (this.prisma) {
      await this.prisma.$connect();
      return;
    }
    if (!this.config.prismaClient) {
      throw new Error('You must pass the prismaClient option to connect to a database');
    }
    this.prisma = new this.config.prismaClient({
      log: this.enableLogging && ['query'],
      datasources: { [this.provider]: { url: this.url } },
    });

    // Set up all list adapter models
    Object.values(this.listAdapters).forEach(listAdapter => {
      listAdapter._setupModel({ rels, prisma: this.prisma });
    });

    await this.prisma.$connect();
  }

  _generatePrismaSchema({ rels, clientDir }: { rels: Rels; clientDir: string }) {
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
              const r = rels.find(r => r.left === f || r.right === f) as Rel;
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
              `from_${listKey}_${path} ${listKey}[] @relation("${tableName}", references: [id])`,
            ])
        ),
        ...flatten(
          rels
            .filter(({ right }) => !right)
            .filter(({ left }) => left.refListKey === listAdapter.key)
            .filter(({ cardinality }) => cardinality === '1:N' || cardinality === 'N:1')
            .map(({ left: { path, listKey }, tableName, columnName }) => [
              `from_${listKey}_${path} ${listKey}[] @relation("${tableName}${columnName}")`,
            ])
        ),
      ];

      const indexes = flatten(
        listAdapter.fieldAdapters
          .map(({ field }) => field)
          .filter(f => f.isRelationship)
          .map(f => {
            const r = rels.find(r => r.left === f || r.right === f) as Rel;
            const isLeft = r.left === f;
            if (
              (r.cardinality === 'N:1' && isLeft) ||
              (r.cardinality === '1:N' && !isLeft) ||
              (r.cardinality === '1:1' && isLeft)
            ) {
              return [`@@index([${f.path}Id])`];
            }
            return [];
          })
      );

      return `
        model ${listAdapter.key} {
          ${[...scalarFields, ...relFields, ...indexes].join('\n  ')}
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
    return header + models.join('\n') + '\n' + enums.join('\n');
  }

  disconnect() {
    return this.prisma.$disconnect();
  }
}

class PrismaListAdapter {
  key: string;
  parentAdapter: PrismaAdapter;
  fieldAdapters: PrismaFieldAdapter<any>[];
  fieldAdaptersByPath: Record<string, PrismaFieldAdapter<any>>;
  config: ListAdapterConfig;
  preSaveHooks: any[];
  postReadHooks: any[];
  model?: PrismaModel;
  getListAdapterByKey: (key: string) => PrismaListAdapter | undefined;

  constructor(key: string, parentAdapter: PrismaAdapter, config: ListAdapterConfig) {
    this.key = key;
    this.parentAdapter = parentAdapter;
    this.fieldAdapters = [];
    this.fieldAdaptersByPath = {};
    this.config = config;

    this.preSaveHooks = [];
    this.postReadHooks = [
      (item: any) => {
        // FIXME: This can hopefully be removed once graphql 14.1.0 is released.
        // https://github.com/graphql/graphql-js/pull/1520
        if (item && item.id) item.id = item.id.toString();
        return item;
      },
    ];
    this.getListAdapterByKey = parentAdapter.getListAdapterByKey.bind(parentAdapter);
  }

  newFieldAdapter<P extends string>(
    fieldAdapterClass: typeof PrismaFieldAdapter,
    name: string,
    path: P,
    field: Implementation<P>,
    getListByKey: (key: string) => BaseKeystoneList | undefined,
    config: Record<string, any>
  ) {
    const adapter = new fieldAdapterClass(name, path, field, this, getListByKey, config);
    adapter.setupHooks({
      addPreSaveHook: this.addPreSaveHook.bind(this),
      addPostReadHook: this.addPostReadHook.bind(this),
    });
    this.fieldAdapters.push(adapter);
    this.fieldAdaptersByPath[adapter.path] = adapter;
    return adapter;
  }

  addPreSaveHook(hook: any) {
    this.preSaveHooks.push(hook);
  }

  addPostReadHook(hook: any) {
    this.postReadHooks.push(hook);
  }

  onPreSave(item: any) {
    // We waterfall so the final item is a composed version of the input passing
    // through each consecutive hook
    return pWaterfall(this.preSaveHooks, item) as Promise<Record<string, any>>;
  }

  async onPostRead(item: Promise<any>) {
    // We waterfall so the final item is a composed version of the input passing
    // through each consecutive hook
    return pWaterfall(this.postReadHooks, await item);
  }

  async create(data: any) {
    return this.onPostRead(this._create(await this.onPreSave(data)));
  }

  async delete(id: IdType) {
    return this._delete(id);
  }

  async update(id: IdType, data: any) {
    return this.onPostRead(this._update(id, await this.onPreSave(data)));
  }

  async itemsQuery(args: ItemQueryArgs, { meta = false, from = {} } = {}) {
    const results = await this._itemsQuery(args, { meta, from });
    return meta
      ? results
      : Promise.all((results as any[]).map((item: any) => this.onPostRead(item)));
  }

  _setupModel({ rels, prisma }: { rels: Rels; prisma: any }) {
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
        .filter(a => a.config.many || (a.rel!.cardinality === '1:1' && a.rel!.right.adapter === a))
        .map(a => a.path),
      { select: { id: true } }
    );
    return Object.keys(include).length > 0 ? include : undefined;
  }

  async _create(_data: Record<string, any>) {
    return this.model!.create({
      data: mapKeys(_data, (value, path) =>
        this.fieldAdaptersByPath[path] && this.fieldAdaptersByPath[path].isRelationship
          ? {
              connect: Array.isArray(value)
                ? value.map(x => ({ id: Number(x) }))
                : { id: Number(value) },
            }
          : this.fieldAdaptersByPath[path]
          ? this.fieldAdaptersByPath[path].gqlToPrisma(value)
          : value
      ),
      include: this._include(),
    });
  }

  async _update(id: IdType, _data: Record<string, any>) {
    const include = this._include();
    const existingItem = await this.model!.findUnique({ where: { id: Number(id) }, include });
    return this.model!.update({
      where: { id: Number(id) },
      data: mapKeys(_data, (value, path) => {
        if (
          this.fieldAdaptersByPath[path] &&
          this.fieldAdaptersByPath[path].isRelationship &&
          Array.isArray(value)
        ) {
          const vs = value.map(x => Number(x));
          const toDisconnect = (existingItem![path] as { id: number }[]).filter(
            ({ id }) => !vs.includes(id)
          );
          const toConnect = vs
            .filter(
              id => !(existingItem![path] as { id: number }[]).map(({ id }) => id).includes(id)
            )
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

  async _delete(id: IdType) {
    return this.model!.delete({ where: { id: Number(id) } });
  }

  ////////// Queries //////////
  async _itemsQuery(
    args: ItemQueryArgs,
    { meta = false, from = {} }: { meta?: boolean; from?: FromType } = {}
  ) {
    const filter = this.prismaFilter({ args, meta, from });
    if (meta) {
      let count = await this.model!.count(filter);
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
      return this.model!.findMany(filter);
    }
  }

  prismaFilter({
    args: { where = {}, first, skip, sortBy, orderBy, search },
    meta,
    from,
  }: {
    args: {
      where?: Record<string, any>;
      first?: number;
      skip?: number;
      sortBy?: string[];
      orderBy?: Record<string, any>;
      search?: string;
    };
    meta: boolean;
    from: FromType;
  }) {
    const ret: Filter = {};
    const allWheres = this.processWheres(where);

    if (allWheres) {
      ret.where = allWheres;
    }

    if (from.fromId) {
      if (!ret.where) {
        ret.where = {};
      }
      const a = from.fromList!.adapter.fieldAdaptersByPath[from.fromField!];
      if (!a.rel) throw Error(`Relationship information missing from field adapter ${a}`);
      if (a.rel.cardinality === 'N:N') {
        const path = a.rel.right
          ? a.field === a.rel.right // Two-sided
            ? a.rel.left.path
            : a.rel.right.path
          : `from_${a.rel.left.listKey}_${a.rel.left.path}`; // One-sided
        ret.where[path] = { some: { id: Number(from.fromId) } };
      } else {
        ret.where[a.rel.columnName] = { id: Number(from.fromId) };
      }
    }

    // TODO: Implement configurable search fields for lists
    const searchFieldName = this.config.searchField || 'name';
    const searchField = this.fieldAdaptersByPath[searchFieldName];
    if (search !== undefined && search !== '' && searchField) {
      if (searchField.fieldName === 'Text') {
        // FIXME: Think about regex
        const mode = this.parentAdapter.provider === 'sqlite' ? undefined : 'insensitive';
        if (!ret.where) {
          ret.where = { [searchFieldName]: { contains: search, mode } };
        } else {
          ret.where = {
            AND: [ret.where, { [searchFieldName]: { contains: search, mode } }],
          };
        }
        // const f = escapeRegExp;
        // this._query.andWhere(`${baseTableAlias}.${searchFieldName}`, '~*', f(search));
      } else {
        // Return no results
        if (!ret.where) {
          ret.where = { AND: [{ [searchFieldName]: null }, { NOT: { [searchFieldName]: null } }] };
        } else {
          ret.where = {
            AND: [ret.where, { [searchFieldName]: null }, { NOT: { [searchFieldName]: null } }],
          };
        }
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
          ret.orderBy![sortKey] = orderDirection.toLowerCase();
        });
      }

      this.fieldAdapters
        .filter(a => a.isRelationship && a.rel!.cardinality === '1:1' && a.rel!.right === a.field)
        .forEach(({ path }) => {
          if (!ret.include) ret.include = {};
          ret.include[path] = true;
        });
    }
    return ret;
  }

  processWheres(where: Record<string, any>): Record<string, any> | undefined {
    const processRelClause = (fieldPath: string, clause: Record<string, any>) =>
      this.getListAdapterByKey(this.fieldAdaptersByPath[fieldPath].refListKey!)!.processWheres(
        clause
      );
    const wheres = Object.entries(where).map(([condition, value]) => {
      if (condition === 'AND' || condition === 'OR') {
        return { [condition]: (value as Record<string, any>[]).map(w => this.processWheres(w)) };
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

// FIXME: Enumerate the valid types
type PrismaType = string;

class PrismaFieldAdapter<P extends string> {
  fieldName: string;
  path: P;
  field: Implementation<P>;
  listAdapter: PrismaListAdapter;
  config: Record<string, any>;
  getListByKey: (arg: string) => BaseKeystoneList | undefined;
  dbPath: string;
  isRelationship?: boolean;
  rel?: Rel;
  sortKey?: string;
  refListKey?: string;

  constructor(
    fieldName: string,
    path: P,
    field: Implementation<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    this.fieldName = fieldName;
    this.path = path;
    this.field = field;
    this.listAdapter = listAdapter;
    this.config = config;
    this.getListByKey = getListByKey;
    this.dbPath = path;
  }

  setupHooks({}) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getQueryConditions(dbPath: string) {
    return {} as Record<string, any>;
  }

  gqlToPrisma(value: any) {
    return value;
  }

  _schemaField({ type, extra = '' }: { type: PrismaType; extra?: string }) {
    const { isRequired, isUnique } = this.config;
    return `${this.path} ${type}${isRequired || this.field.isPrimaryKey ? '' : '?'} ${
      this.field.isPrimaryKey ? '@id' : ''
    } ${isUnique && !this.field.isPrimaryKey ? '@unique' : ''} ${extra}`;
  }

  getPrismaSchema(): string[] {
    return [this._schemaField({ type: 'String' })];
  }

  getPrismaEnums(): string[] {
    return [];
  }

  // The following methods provide helpers for constructing the return values of `getQueryConditions`.
  // Each method takes:
  //   `dbPath`: The database field/column name to be used in the comparison
  //   `f`: (non-string methods only) A value transformation function which converts from a string type
  //        provided by graphQL into a native adapter type.
  equalityConditions<T>(dbPath: string, f: (a: any) => any = identity) {
    return {
      [this.path]: (value: T) => ({ [dbPath]: { equals: f(value) } }),
      [`${this.path}_not`]: (value: T | null) =>
        value === null
          ? { NOT: { [dbPath]: { equals: f(value) } } }
          : {
              OR: [{ NOT: { [dbPath]: { equals: f(value) } } }, { [dbPath]: { equals: null } }],
            },
    };
  }

  equalityConditionsInsensitive(dbPath: string, f: (a: any) => any = identity) {
    return {
      [`${this.path}_i`]: (value: string) => ({
        [dbPath]: { equals: f(value), mode: 'insensitive' },
      }),
      [`${this.path}_not_i`]: (value: string) =>
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

  inConditions<T>(dbPath: string, f: (a: any) => any = identity) {
    return {
      [`${this.path}_in`]: (value: (T | null)[]) =>
        (value.includes(null)
          ? { OR: [{ [dbPath]: { in: value.filter(x => x !== null).map(f) } }, { [dbPath]: null }] }
          : { [dbPath]: { in: value.map(f) } }) as Record<string, any>,
      [`${this.path}_not_in`]: (value: (T | null)[]) =>
        (value.includes(null)
          ? {
              AND: [
                { NOT: { [dbPath]: { in: value.filter(x => x !== null).map(f) } } },
                { NOT: { [dbPath]: null } },
              ],
            }
          : {
              OR: [{ NOT: { [dbPath]: { in: value.map(f) } } }, { [dbPath]: null }],
            }) as Record<string, any>,
    };
  }

  orderingConditions<T>(dbPath: string, f: (a: any) => any = identity) {
    return {
      [`${this.path}_lt`]: (value: T) => ({ [dbPath]: { lt: f(value) } }),
      [`${this.path}_lte`]: (value: T) => ({ [dbPath]: { lte: f(value) } }),
      [`${this.path}_gt`]: (value: T) => ({ [dbPath]: { gt: f(value) } }),
      [`${this.path}_gte`]: (value: T) => ({ [dbPath]: { gte: f(value) } }),
    };
  }

  containsConditions(dbPath: string, f: (a: any) => any = identity) {
    return {
      [`${this.path}_contains`]: (value: string) => ({ [dbPath]: { contains: f(value) } }),
      [`${this.path}_not_contains`]: (value: string) => ({
        OR: [{ NOT: { [dbPath]: { contains: f(value) } } }, { [dbPath]: null }],
      }),
    };
  }

  stringConditions(dbPath: string, f: (a: any) => any = identity) {
    return {
      ...this.containsConditions(dbPath, f),
      [`${this.path}_starts_with`]: (value: string) => ({ [dbPath]: { startsWith: f(value) } }),
      [`${this.path}_not_starts_with`]: (value: string) => ({
        OR: [{ NOT: { [dbPath]: { startsWith: f(value) } } }, { [dbPath]: null }],
      }),
      [`${this.path}_ends_with`]: (value: string) => ({ [dbPath]: { endsWith: f(value) } }),
      [`${this.path}_not_ends_with`]: (value: string) => ({
        OR: [{ NOT: { [dbPath]: { endsWith: f(value) } } }, { [dbPath]: null }],
      }),
    };
  }

  stringConditionsInsensitive(dbPath: string, f: (a: any) => any = identity) {
    return {
      [`${this.path}_contains_i`]: (value: string) => ({
        [dbPath]: { contains: f(value), mode: 'insensitive' },
      }),
      [`${this.path}_not_contains_i`]: (value: string) => ({
        OR: [
          { NOT: { [dbPath]: { contains: f(value), mode: 'insensitive' } } },
          { [dbPath]: null },
        ],
      }),
      [`${this.path}_starts_with_i`]: (value: string) => ({
        [dbPath]: { startsWith: f(value), mode: 'insensitive' },
      }),
      [`${this.path}_not_starts_with_i`]: (value: string) => ({
        OR: [
          { NOT: { [dbPath]: { startsWith: f(value), mode: 'insensitive' } } },
          { [dbPath]: null },
        ],
      }),
      [`${this.path}_ends_with_i`]: (value: string) => ({
        [dbPath]: { endsWith: f(value), mode: 'insensitive' },
      }),
      [`${this.path}_not_ends_with_i`]: (value: string) => ({
        OR: [
          { NOT: { [dbPath]: { endsWith: f(value), mode: 'insensitive' } } },
          { [dbPath]: null },
        ],
      }),
    };
  }
}

export { PrismaAdapter, PrismaListAdapter, PrismaFieldAdapter };
