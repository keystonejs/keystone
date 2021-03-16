import inflection from 'inflection';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-next/adapter-mongoose-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';

function initOptions(options) {
  let optionsArray = options;
  if (typeof options === 'string') optionsArray = options.split(/\,\s*/);
  if (!Array.isArray(optionsArray)) return null;
  return optionsArray.map(i => {
    return typeof i === 'string' ? { value: i, label: inflection.humanize(i) } : i;
  });
}

const VALID_DATA_TYPES = ['enum', 'string', 'integer'];
const DOCS_URL = 'https://keystonejs.com/keystonejs/fields/src/types/select/';

function validateOptions({ options, dataType, listKey, path }) {
  if (!VALID_DATA_TYPES.includes(dataType)) {
    throw new Error(
      `
🚫 The select field ${listKey}.${path} is not configured with a valid data type;
📖 see ${DOCS_URL}
`
    );
  }
  options.forEach((option, i) => {
    if (dataType === 'enum') {
      if (!/^[a-zA-Z]\w*$/.test(option.value)) {
        throw new Error(
          `
🚫 The select field ${listKey}.${path} contains an invalid enum value ("${option.value}") in option ${i}
👉 You may want to use the "string" dataType
📖 see ${DOCS_URL}
`
        );
      }
    } else if (dataType === 'string') {
      if (typeof option.value !== 'string') {
        const integerHint =
          typeof option.value === 'number'
            ? `
👉 Did you mean to use the the "integer" dataType?`
            : '';
        throw new Error(
          `
🚫 The select field ${listKey}.${path} contains an invalid value (type ${typeof option.value}) in option ${i}${integerHint}
📖 see ${DOCS_URL}
`
        );
      }
    } else if (dataType === 'integer') {
      if (!Number.isInteger(option.value)) {
        throw new Error(
          `
🚫 The select field ${listKey}.${path} contains an invalid integer value ("${option.value}") in option ${i}
📖 see ${DOCS_URL}
`
        );
      }
    }
  });
}

export class Select extends Implementation {
  constructor(path, { options, dataType = 'enum' }) {
    super(...arguments);
    this.options = initOptions(options);
    validateOptions({ options: this.options, dataType, listKey: this.listKey, path });
    this.dataType = dataType;
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getTypeName() {
    if (this.dataType === 'enum') {
      return `${this.listKey}${inflection.classify(this.path)}Type`;
    } else if (this.dataType === 'integer') {
      return 'Int';
    } else {
      return 'String';
    }
  }
  getGqlAuxTypes() {
    return this.dataType === 'enum'
      ? [
          `
      enum ${this.getTypeName()} {
        ${this.options.map(i => i.value).join('\n        ')}
      }
    `,
        ]
      : [];
  }

  extendAdminMeta(meta) {
    const { options, dataType } = this;
    return { ...meta, options, dataType };
  }
  gqlQueryInputFields() {
    // TODO: This could be extended for Int type options with numeric filters
    return [
      ...this.equalityInputFields(this.getTypeName()),
      ...this.inInputFields(this.getTypeName()),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

const CommonSelectInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoSelectInterface extends CommonSelectInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const options =
      this.field.dataType === 'integer'
        ? { type: Number }
        : {
            type: String,
            enum: [...this.field.options.map(i => i.value), null],
          };
    schema.add({ [this.path]: this.mergeSchemaOptions(options, this.config) });
  }
}

export class KnexSelectInterface extends CommonSelectInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  addToTableSchema(table) {
    let column;
    if (this.field.dataType === 'enum') {
      column = table.enu(
        this.path,
        this.field.options.map(({ value }) => value)
      );
    } else if (this.field.dataType === 'integer') {
      column = table.integer(this.path);
    } else {
      column = table.text(this.path);
    }
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (typeof this.defaultTo !== 'undefined') column.defaultTo(this.defaultTo);
  }
}

export class PrismaSelectInterface extends CommonSelectInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
    this._prismaType =
      this.config.dataType === 'enum' && this.listAdapter.parentAdapter.provider !== 'sqlite'
        ? `${this.field.listKey}${inflection.classify(this.path)}Enum`
        : this.config.dataType === 'integer'
        ? 'Int'
        : 'String';
  }

  getPrismaEnums() {
    if (!['Int', 'String'].includes(this._prismaType)) {
      return [
        `enum ${this._prismaType} {
          ${this.field.options.map(i => i.value).join('\n')}
        }`,
      ];
    } else return [];
  }

  getPrismaSchema() {
    return [this._schemaField({ type: this._prismaType })];
  }
}
