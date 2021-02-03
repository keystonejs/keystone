import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { DateTime, FixedOffsetZone } from 'luxon';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';
import { Implementation } from '../../Implementation';

class _DateTime extends Implementation {
  constructor(path, { format, yearRangeFrom, yearRangeTo, yearPickerType }) {
    super(...arguments);
    this.format = format;
    this.yearRangeFrom = yearRangeFrom;
    this.yearRangeTo = yearRangeTo;
    this.yearPickerType = yearPickerType;
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: DateTime`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('DateTime'),
      ...this.orderingInputFields('DateTime'),
      ...this.inInputFields('DateTime'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: DateTime`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: DateTime`];
  }
  getGqlAuxTypes() {
    return [`scalar DateTime`];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      format: this.format,
      yearRangeFrom: this.yearRangeFrom,
      yearRangeTo: this.yearRangeTo,
      yearPickerType: this.yearPickerType,
    };
  }
  gqlAuxFieldResolvers() {
    return {
      DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'DateTime custom scalar represents an ISO 8601 datetime string',
        parseValue(value) {
          return value; // value from the client
        },
        serialize(value) {
          return value; // value sent to the client
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.STRING) {
            return ast.value; // ast value is always in string format
          }
          return null;
        },
      }),
    };
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

const toDate = s => s && DateTime.fromISO(s, { zone: 'utc' }).toJSDate();

const CommonDateTimeInterface = superclass =>
  class extends superclass {
    setupHooks({ addPreSaveHook, addPostReadHook }) {
      const field_path = this.path;
      const utc_field = `${field_path}_utc`;
      const offset_field = `${field_path}_offset`;

      // Updates the relevant value in the item provided (by referrence)
      addPreSaveHook(item => {
        // Only run the hook if the item actually contains the datetime field
        // NOTE: Can't use hasOwnProperty here, as the mongoose data object
        // returned isn't a POJO
        if (!(field_path in item)) {
          return item;
        }

        const datetimeString = item[field_path];

        // NOTE: Even though `0` is a valid timestamp (the unix epoch), it's not a valid ISO string,
        // so it's ok to check for falseyness here.
        if (!datetimeString) {
          item[utc_field] = null;
          item[offset_field] = null;
          delete item[field_path]; // Never store this field
          return item;
        }

        if (!DateTime.fromISO(datetimeString, { zone: 'utc' }).isValid) {
          throw new Error(
            'Validation failed: DateTime must be either `null` or a valid ISO 8601 string'
          );
        }

        item[utc_field] = toDate(datetimeString);
        item[offset_field] = DateTime.fromISO(datetimeString, { setZone: true }).toFormat('ZZ');
        delete item[field_path]; // Never store this field

        return item;
      });

      addPostReadHook(item => {
        // If there's no fields stored in the DB (can happen with MongoDB), then
        // don't bother trying to process anything
        // NOTE: Can't use hasOwnProperty here, as the mongoose data object
        // returned isn't a POJO
        if (!(utc_field in item) && !(offset_field in item)) {
          return item;
        }

        if (!item[utc_field] || !item[offset_field]) {
          item[field_path] = null;
          return item;
        }

        const datetimeString = DateTime.fromJSDate(item[utc_field], { zone: 'utc' })
          .setZone(
            new FixedOffsetZone(
              DateTime.fromISO(`1234-01-01T00:00:00${item[offset_field]}`, {
                setZone: true,
              }).offset
            )
          )
          .toISO();

        item[field_path] = datetimeString;
        item[utc_field] = undefined;
        item[offset_field] = undefined;

        return item;
      });
    }

    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath, toDate),
        ...this.orderingConditions(dbPath, toDate),
        ...this.inConditions(dbPath, toDate),
      };
    }
  };

export class MongoDateTimeInterface extends CommonDateTimeInterface(MongooseFieldAdapter) {
  constructor() {
    super(...arguments);
    this.utcPath = `${this.path}_utc`;
    this.offsetPath = `${this.path}_offset`;
    this.realKeys = [this.utcPath, this.offsetPath];
    this.dbPath = this.utcPath;
  }

  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      // FIXME: Mongoose needs to know about this field in order for the correct
      // attributes to make it through to the pre-hooks.
      [this.path]: { type: String, ...mongooseOptions },
      // These are the actual fields we care about storing in the database.
      [this.utcPath]: this.mergeSchemaOptions({ type: Date }, this.config),
      [this.offsetPath]: { type: String, ...mongooseOptions },
    });
  }

  getMongoFieldName() {
    return `${this.path}_utc`;
  }
}

export class KnexDateTimeInterface extends CommonDateTimeInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    this.utcPath = `${this.path}_utc`;
    this.offsetPath = `${this.path}_offset`;
    this.realKeys = [this.utcPath, this.offsetPath];
    this.sortKey = this.utcPath;
    this.dbPath = this.utcPath;

    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  addToTableSchema(table) {
    // TODO: Should use a single field on PG
    // .. although 2 cols is nice for MySQL (no native datetime with tz)
    const utcColumn = table.timestamp(this.utcPath, { useTz: false });
    const offsetColumn = table.text(this.offsetPath);

    // Interpret the index options as effecting both elements
    if (this.isUnique) table.unique([this.utcPath, this.offsetPath]);
    else if (this.isIndexed) table.index([this.utcPath, this.offsetPath]);

    // Interpret not nullable to mean neither field is nullable
    if (this.isNotNullable) {
      utcColumn.notNullable();
      offsetColumn.notNullable();
    }

    // Allow defaults to be set for both elements of the value by nesting them
    // TODO: Add to docs..
    if (this.defaultTo && (this.defaultTo.utc || this.defaultTo.offset)) {
      if (this.defaultTo.utc) utcColumn.defaultTo(this.defaultTo.utc);
      if (this.defaultTo.offset) offsetColumn.defaultTo(this.defaultTo.offset);
    } else if (this.defaultTo) {
      utcColumn.defaultTo(this.defaultTo);
    }
  }
}

export class PrismaDateTimeInterface extends CommonDateTimeInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);

    this.utcPath = `${this.path}_utc`;
    this.offsetPath = `${this.path}_offset`;
    this.realKeys = [this.utcPath, this.offsetPath];
    this.sortKey = this.utcPath;
    this.dbPath = this.utcPath;

    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [
      `${this.path}_utc    DateTime? ${this.config.isUnique ? '@unique' : ''}`,
      `${this.path}_offset String?`,
    ];
  }
}

export { _DateTime as DateTime };
