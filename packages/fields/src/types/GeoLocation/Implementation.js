import mongoose from 'mongoose';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';
import isEqual from 'lodash.isequal';

export class GeoLocation extends Implementation {
  constructor(path, { defaultZoom, defaultCenter, googleApiKey, defaultValue }) {
    super(...arguments);
    this.defaultCenter = defaultCenter || {
      lat: 22.28552,
      lng: 114.15769,
    };
    this.defaultValue = defaultValue || defaultCenter;
    this.defaultZoom = defaultZoom || 11;
    this.googleApiKey = googleApiKey;
  }

  gqlOutputFields() {
    return [`${this.path}: String`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.orderingInputFields('String'),
      ...this.inInputFields('String'),
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
      defaultCenter: this.defaultCenter,
      defaultZoom: this.defaultZoom,
      googleApiKey: this.googleApiKey,
    };
  }
}

export class MongoGeoLocationInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const validator = a => {
      if (typeof a !== 'string') {
        return false;
      }
      const deserialized = JSON.parse(decodeURI(a));
      return (
        (isEqual(Object.keys(deserialized), ['lng', 'lat']) ||
          isEqual(Object.keys(deserialized), ['lat', 'lng'])) &&
        deserialized.lng >= 0 &&
        deserialized.lng <= 180 &&
        deserialized.lat >= 0 &&
        deserialized.lat <= 90
      );
    };
    const schemaOptions = {
      type: mongoose.Mixed,
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not a Decimal value',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }

  setupHooks({ addPreSaveHook, addPostReadHook }) {
    // Updates the relevant value in the item provided (by reference)
    addPreSaveHook(item => {
      if (!item[this.path]) {
        item[this.path] = null;
      }
      return item;
    });
    addPostReadHook(item => {
      if (item[this.path]) {
        item[this.path] = item[this.path];
      }
      return item;
    });
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, mongoose.Types.Decimal128.fromString),
      ...this.orderingConditions(dbPath, mongoose.Types.Decimal128.fromString),
      ...this.inConditions(dbPath, mongoose.Types.Decimal128.fromString),
    };
  }
}

export class KnexGeoLocationInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;

    // In addition to the standard knexOptions this type supports precision and scale
    const { precision, scale } = this.knexOptions;
    this.precision = precision === null ? null : parseInt(precision) || 18;
    this.scale = scale === null ? null : (this.precision, parseInt(scale) || 4);
    if (this.scale !== null && this.precision !== null && this.scale > this.precision) {
      throw `The scale configured for Decimal field '${this.path}' (${this.scale}) ` +
        `must not be larger than the field's precision (${this.precision})`;
    }
  }

  addToTableSchema(table) {
    const column = table.decimal(this.path, this.precision, this.scale);
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (typeof this.defaultTo !== 'undefined') column.defaultTo(this.defaultTo);
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
