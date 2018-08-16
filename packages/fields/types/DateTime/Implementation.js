const { DateTime, FixedOffsetZone } = require('luxon');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class _DateTime extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return `
      ${this.path}: String
    `;
  }
  getGraphqlQueryArgs() {
    return `
        ${this.path}: String
        ${this.path}_not: String
        ${this.path}_lt: String
        ${this.path}_lte: String
        ${this.path}_gt: String
        ${this.path}_gte: String
        ${this.path}_in: [String]
        ${this.path}_not_in: [String]
    `;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: String
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: String
    `;
  }
}

const toDate = s => s && DateTime.fromISO(s, { zone: 'utc' }).toJSDate();

class MongoDateTimeInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    const field_path = this.path;
    const utc_field = `${field_path}_utc`;
    const offset_field = `${field_path}_offset`;
    schema.add({
      // FIXME: Mongoose needs to know about this field in order for the correct
      // attributes to make it through to the pre-hooks.
      [field_path]: { type: String },
      // These are the actual fields we care about storing in the database.
      [utc_field]: { type: Date },
      [offset_field]: { type: String },
      ...mongooseOptions,
    });

    // Updates the relevant value in the item provided (by referrence)
    const toServerSide = item => {
      const datetimeString = item[field_path];

      if (
        datetimeString === undefined ||
        !DateTime.fromISO(datetimeString, { zone: 'utc' }).isValid
      ) {
        return;
      }

      item[utc_field] = toDate(datetimeString);
      item[offset_field] = DateTime.fromISO(datetimeString, { setZone: true }).toFormat('ZZ');
      item[field_path] = undefined; // Never store this field
    };

    const toClientSide = item => {
      if (item[utc_field] && item[offset_field] === undefined) {
        return;
      }
      const datetimeString =
        item[utc_field] &&
        item[offset_field] &&
        DateTime.fromJSDate(item[utc_field], { zone: 'utc' })
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
    };
    schema.post('aggregate', function(result) {
      result.forEach(r => toClientSide(r));
    });

    schema.post('find', function(result) {
      result.forEach(r => toClientSide(r));
    });
    schema.post('findById', function(result) {
      toClientSide(result);
    });
    schema.post('findOne', function(result) {
      toClientSide(result);
    });

    // Attach various pre save/update hooks to convert the datetime value
    schema.pre('save', function() {
      toServerSide(this);
    });

    // These are "Query middleware"; they differ from "document" middleware..
    // ".. `this` refers to the query object rather than the document being updated."
    schema.pre('update', function() {
      toServerSide(this['_update'].$set || this['_update']);
    });
    schema.pre('updateOne', function() {
      toServerSide(this['_update'].$set || this['_update']);
    });
    schema.pre('updateMany', function() {
      toServerSide(this['_update'].$set || this['_update']);
    });
    schema.pre('findOneAndUpdate', function() {
      toServerSide(this['_update'].$set || this['_update']);
    });

    // Model middleware
    // Docs as second arg? (https://github.com/Automattic/mongoose/commit/3d62d3558c15ec852bdeaab1a5138b1853b4f7cb)
    schema.pre('insertMany', function(next, docs) {
      for (let doc of docs) {
        toServerSide(doc);
      }
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({ [`${this.path}_utc`]: { $eq: toDate(value) } }),
      [`${this.path}_not`]: value => ({ [`${this.path}_utc`]: { $ne: toDate(value) } }),
      [`${this.path}_lt`]: value => ({ [`${this.path}_utc`]: { $lt: toDate(value) } }),
      [`${this.path}_lte`]: value => ({ [`${this.path}_utc`]: { $lte: toDate(value) } }),
      [`${this.path}_gt`]: value => ({ [`${this.path}_utc`]: { $gt: toDate(value) } }),
      [`${this.path}_gte`]: value => ({ [`${this.path}_utc`]: { $gte: toDate(value) } }),
      [`${this.path}_in`]: value => ({ [`${this.path}_utc`]: { $in: value.map(s => toDate(s)) } }),
      [`${this.path}_not_in`]: value => ({
        [`${this.path}_utc`]: { $not: { $in: value.map(s => toDate(s)) } },
      }),
    };
  }
}

module.exports = {
  DateTime: _DateTime,
  MongoDateTimeInterface,
};
