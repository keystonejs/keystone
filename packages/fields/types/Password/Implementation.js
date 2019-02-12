const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { KnexFieldAdapter } = require('@voussoir/adapter-knex');

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

  get gqlOutputFields() {
    return [`${this.path}_is_set: Boolean`];
  }
  get gqlOutputFieldResolvers() {
    return {
      [`${this.path}_is_set`]: item => {
        const val = item[this.path];
        return !!val;
        // FIXME: Re-enable this test once bcrypt for Knex is supported.
        // return bcryptHashRegex.test(val);
      },
    };
  }

  get gqlQueryInputFields() {
    return [`${this.path}_is_set: Boolean`];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: String`];
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

  addToMongooseSchema(schema, _, { addPreSaveHook }) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: String }, this.config) });

    // Updates the relevant value in the item provided (by referrence)
    addPreSaveHook(async item => {
      const list = this.getListByKey(this.listAdapter.key);
      const field = list.fieldsByPath[this.path];
      const plaintext = item[field.path];

      if (typeof plaintext === 'undefined') {
        return item;
      }

      if (String(plaintext) === plaintext && plaintext !== '') {
        item[field.path] = await field.generateHash(plaintext);
      } else {
        item[field.path] = null;
      }
      return item;
    });
  }

  getQueryConditions() {
    return {
      [`${this.path}_is_set`]: value => ({
        [this.path]: value ? { $regex: bcryptHashRegex } : { $not: bcryptHashRegex },
      }),
    };
  }
}

class KnexPasswordInterface extends KnexFieldAdapter {
  createColumn(table) {
    table.text(this.path);
  }
  getQueryConditions(f, g) {
    return {
      [`${this.path}_is_set`]: value => b =>
        value ? b.whereNot(g(this.path), '') : b.where(g(this.path), '').orWhereNull(g(this.path)),
    };
  }
}

module.exports = {
  Password,
  MongoPasswordInterface,
  KnexPasswordInterface,
};
