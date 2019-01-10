const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { DateTime, FixedOffsetZone } = require('luxon');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { Implementation } = require('../../Implementation');

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

class MongoDateTimeInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema, _, { addPreSaveHook, addPostReadHook }) {
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
        item[field_path] = undefined; // Never store this field
        return item;
      }

      if (!DateTime.fromISO(datetimeString, { zone: 'utc' }).isValid) {
        throw new Error(
          'Validation failed: DateTime must be either `null` or a valid ISO 8601 string'
        );
      }

      item[utc_field] = toDate(datetimeString);
      item[offset_field] = DateTime.fromISO(datetimeString, { setZone: true }).toFormat('ZZ');
      item[field_path] = undefined; // Never store this field

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

  getQueryConditions() {
    return {
      ...this.equalityConditions(toDate, p => `${p}_utc`),
      ...this.orderingConditions(toDate, p => `${p}_utc`),
      ...this.inConditions(toDate, p => `${p}_utc`),
    };
  }

  getMongoFieldName() {
    return `${this.path}_utc`;
  }
}

module.exports = {
  DateTime: _DateTime,
  MongoDateTimeInterface,
};
