import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { DateTime, FixedOffsetZone } from 'luxon';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';
import { Implementation } from '../../Implementation';

class _DateTime extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: DateTime`];
  }
  get gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('DateTime'),
      ...this.orderingInputFields('DateTime'),
      ...this.inInputFields('DateTime'),
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: DateTime`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: DateTime`];
  }
  getGqlAuxTypes() {
    return [`scalar DateTime`];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      format: this.config.format,
      yearRangeFrom: this.config.yearRangeFrom,
      yearRangeTo: this.config.yearRangeTo,
      yearPickerType: this.config.yearPickerType,
    };
  }
  get gqlAuxFieldResolvers() {
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
    this.dbPath = `${this.path}_utc`;
  }

  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    const field_path = this.path;
    const utc_field = `${field_path}_utc`;
    const offset_field = `${field_path}_offset`;
    schema.add({
      // FIXME: Mongoose needs to know about this field in order for the correct
      // attributes to make it through to the pre-hooks.
      [field_path]: { type: String, ...mongooseOptions },
      // These are the actual fields we care about storing in the database.
      [utc_field]: { type: Date, ...mongooseOptions },
      [offset_field]: { type: String, ...mongooseOptions },
    });
  }

  getMongoFieldName() {
    return `${this.path}_utc`;
  }
}

export class KnexDateTimeInterface extends CommonDateTimeInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    const field_path = this.path;
    const utc_field = `${field_path}_utc`;
    const offset_field = `${field_path}_offset`;
    this.realKeys = [utc_field, offset_field];
    this.sortKey = utc_field;
    this.dbPath = utc_field;
  }

  createColumn(table) {
    const field_path = this.path;
    const utc_field = `${field_path}_utc`;
    const offset_field = `${field_path}_offset`;

    table.text(offset_field);
    return table.timestamp(utc_field, { useTz: false });
  }
}

export { _DateTime as DateTime };
