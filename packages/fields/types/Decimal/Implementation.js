const mongoose = require('mongoose');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

class Decimal extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: String`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      `${this.path}: String`,
      `${this.path}_not: String`,
      `${this.path}_lt: String`,
      `${this.path}_lte: String`,
      `${this.path}_gt: String`,
      `${this.path}_gte: String`,
      `${this.path}_in: [String]`,
      `${this.path}_not_in: [String]`,
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      symbol: this.config.symbol,
    };
  }
}

class MongoDecimalInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions, unique } = this.config;
    const required = mongooseOptions && mongooseOptions.required;

    const isValidDecimal = s => /^-?\d*\.?\d*$/.test(s);

    schema.add({
      [this.path]: {
        type: mongoose.Decimal128,
        unique,
        validate: {
          validator: required
            ? isValidDecimal
            : a => {
                if (typeof a === 'object') return true;
                if (typeof a === 'undefined' || a === null) return true;
                return false;
              },
          message: '{VALUE} is not a Decimal value',
        },
        ...mongooseOptions,
      },
    });
    // Updates the relevant value in the item provided (by referrence)
    const toServerSide = item => {
      if (item[this.path] && typeof item[this.path] === 'string') {
        item[this.path] = mongoose.Types.Decimal128.fromString(item[this.path]);
      } else if (!item[this.path]) {
        item[this.path] = null;
      }
      // else: Must either be undefined or a Decimal128 object, so leave it alone.
    };

    const toClientSide = item => {
      if (item[this.path]) {
        item[this.path] = item[this.path].toString();
      }
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

    // Attach various pre save/update hooks to convert the decimal value
    schema.pre('validate', function() {
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

    // After saving, we return the result to the client, so we have to parse it
    // back again
    schema.post('save', function() {
      toClientSide(this);
    });

    // These are "Query middleware"; they differ from "document" middleware..
    // ".. `this` refers to the query object rather than the document being updated."
    schema.post('update', function() {
      toClientSide(this['_update'].$set || this['_update']);
    });
    schema.post('updateOne', function() {
      toClientSide(this['_update'].$set || this['_update']);
    });
    schema.post('updateMany', function() {
      toClientSide(this['_update'].$set || this['_update']);
    });
    schema.post('findOneAndUpdate', function() {
      toClientSide(this['_update'].$set || this['_update']);
    });

    // Model middleware
    // Docs as second arg? (https://github.com/Automattic/mongoose/commit/3d62d3558c15ec852bdeaab1a5138b1853b4f7cb)
    schema.post('insertMany', function(next, docs) {
      for (let doc of docs) {
        toClientSide(doc);
      }
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({ [this.path]: { $eq: mongoose.Types.Decimal128.fromString(value) } }),
      [`${this.path}_not`]: value => ({
        [this.path]: { $ne: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_lt`]: value => ({
        [this.path]: { $lt: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_lte`]: value => ({
        [this.path]: { $lte: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_gt`]: value => ({
        [this.path]: { $gt: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_gte`]: value => ({
        [this.path]: { $gte: mongoose.Types.Decimal128.fromString(value) },
      }),
    };
  }
}

module.exports = {
  Decimal,
  MongoDecimalInterface,
};
