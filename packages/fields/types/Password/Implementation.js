const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

const bcrypt = require('bcrypt');
const dumbPasswords = require('dumb-passwords');

const bcryptHashRegex = /^\$2[aby]?\$\d{1,2}\$[.\/A-Za-z0-9]{53}$/;

class Password extends Implementation {
  constructor(path, config) {
    super(...arguments);

    // Sanitise field specific config
    this.rejectCommon = !!config.rejectCommon;
    this.minLength = Math.max(Number.parseInt(config.minLength) || 8, 1);
    // Min 4, max: 31, default: 10
    this.workFactor = Math.min(Math.max(Number.parseInt(config.workFactor) || 10, 4), 31);

    if (this.workFactor < 6) {
      console.warn(
        `The workFactor for ${this.listKey}.${this.path} is very low! ` +
          `This will cause weak hashes!`
      );
    }
  }

  getGraphqlOutputFields() {
    return `
      ${this.path}_is_set: Boolean
    `;
  }
  getGraphqlOutputFieldResolvers() {
    return {
      [`${this.path}_is_set`]: item => {
        const val = item[this.path];
        return bcryptHashRegex.test(val);
      },
    };
  }

  getGraphqlQueryArgs() {
    return `
      ${this.path}_is_set: Boolean
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

  // Wrap bcrypt functionality
  // The compare() and compareSync() functions are constant-time
  // The compare() and generateHash() functions will return a Promise if no call back is provided
  compare(candidate, hash, callback) {
    return bcrypt.compare(candidate, hash, callback);
  }
  compareSync(candidate, hash) {
    return bcrypt.compareSync(candidate, hash);
  }
  generateHash(plaintext, callback) {
    this.validateNewPassword(plaintext);
    return bcrypt.hash(plaintext, this.workFactor, callback);
  }
  generateHashSync(plaintext) {
    this.validateNewPassword(plaintext);
    return bcrypt.hashSync(plaintext, this.workFactor);
  }

  // Force values to be hashed when set
  validateNewPassword(password) {
    if (this.rejectCommon && dumbPasswords.check(password)) {
      throw new Error(
        `[password:rejectCommon:${this.listKey}:${
          this.path
        }] Common and frequently-used passwords are not allowed.`
      );
    }
    // TODO: checking string length is not simple; might need to revisit this (see https://mathiasbynens.be/notes/javascript-unicode)
    if (String(password).length < this.minLength) {
      throw new Error(
        `[password:minLength:${this.listKey}:${this.path}] Value must be at least ${
          this.minLength
        } characters long.`
      );
    }
  }
}

class MongoPasswordInterface extends MongooseFieldAdapter {
  // constructor(fieldName, path, listAdapter, getListByKey, config) {

  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });

    // Updates the relevant value in the item provided (by referrence)
    const hashFieldValue = async item => {
      const list = this.getListByKey(this.listAdapter.key);
      const field = list.fieldsByPath[this.path];
      const plaintext = item[field.path];

      if (typeof plaintext === 'undefined') {
        return;
      }

      if (String(plaintext) === plaintext && plaintext !== '') {
        item[field.path] = await field.generateHash(plaintext);
      }
      else {
        item[field.path] = null;
      }
    };

    // Attach various pre save/update hooks to hash the password value
    schema.pre('save', async function() {
      await hashFieldValue(this);
    });

    // These are "Query middleware"; they differ from "document" middleware..
    // ".. `this` refers to the query object rather than the document being updated."
    schema.pre('update', async function() {
      await hashFieldValue(this['_update'].$set || this['_update']);
    });
    schema.pre('updateOne', async function() {
      await hashFieldValue(this['_update'].$set || this['_update']);
    });
    schema.pre('updateMany', async function() {
      await hashFieldValue(this['_update'].$set || this['_update']);
    });
    schema.pre('findOneAndUpdate', async function() {
      await hashFieldValue(this['_update'].$set || this['_update']);
    });

    // Model middleware
    // Docs as second arg? (https://github.com/Automattic/mongoose/commit/3d62d3558c15ec852bdeaab1a5138b1853b4f7cb)
    schema.pre('insertMany', async function(next, docs) {
      for (let doc of docs) {
        await hashFieldValue(doc);
      }
    });
  }

  getQueryConditions(args) {
    const conditions = [];
    const is_set = `${this.path}_is_set`;
    if (is_set in args) {
      conditions.push(args[is_set] ? { $regex: bcryptHashRegex } : { $not: bcryptHashRegex });
    }
    return conditions;
  }
}

module.exports = {
  Password,
  MongoPasswordInterface,
};
