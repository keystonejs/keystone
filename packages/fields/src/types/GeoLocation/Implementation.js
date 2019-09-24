import mongoose from 'mongoose';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';
import isEqual from 'lodash.isequal';

export class GeoLocation extends Implementation {
  constructor(path, { defaultZoom, defaultCenter, googleApiKey, defaultValue, showMap }) {
    super(...arguments);
    this.graphQLOutputType = 'GeoLocation';
    this.defaultCenter = defaultCenter || {
      lat: 22.28552,
      lng: 114.15769,
    };
    this.defaultValue = defaultValue || defaultCenter;
    this.defaultZoom = defaultZoom || 11;
    this.googleApiKey = googleApiKey;
    if (typeof showMap == 'undefined') {
      this.showMap = true;
    } else {
      this.showMap = showMap || false;
    }
  }

  getGqlAuxTypes() {
    return [
      `
      type ${this.graphQLOutputType} {
        lat: Float
        lng: Float
      }
      input ${this.graphQLOutputType}Format{
        lat: Float
        lng: Float
      }
    `,
    ];
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }

  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => item[this.path],
    };
  }

  get gqlUpdateInputFields() {
    return [`${this.path}: ${this.graphQLOutputType}Format`];
  }

  get gqlCreateInputFields() {
    return [`${this.path}: ${this.graphQLOutputType}Format`];
  }

  extendAdminMeta(meta) {
    return {
      ...meta,
      defaultCenter: this.defaultCenter,
      defaultZoom: this.defaultZoom,
      googleApiKey: this.googleApiKey,
      showMap: this.showMap,
    };
  }
}

export class MongoGeoLocationInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const validator = location => {
      if (typeof location !== 'object') {
        return false;
      }
      return (
        (isEqual(Object.keys(location), ['lng', 'lat']) ||
          isEqual(Object.keys(location), ['lat', 'lng'])) &&
        location.lng >= 0 &&
        location.lng <= 180 &&
        location.lat >= 0 &&
        location.lat <= 90
      );
    };
    const schemaOptions = {
      type: {
        lng: mongoose.Decimal128,
        lat: mongoose.Decimal128,
      },
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not a valid geo coordinate',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }

  getQueryConditions() {
    return {};
  }
}

export class KnexGeoLocationInterface extends KnexFieldAdapter {
  addToTableSchema(table) {
    table.jsonb(this.path);
  }

  getQueryConditions() {
    return {};
  }
}
