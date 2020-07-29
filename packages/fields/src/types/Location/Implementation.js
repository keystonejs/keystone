import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import mongoose from 'mongoose';

import fetch from 'node-fetch';

// Disabling the getter of mongoose >= 5.1.0
// https://github.com/Automattic/mongoose/blob/master/migrating_to_5.md#checking-if-a-path-is-populated
mongoose.set('objectIdGetter', false);

const {
  Types: { ObjectId },
} = mongoose;

export class Location extends Implementation {
  constructor(_, { googleMapsKey }) {
    super(...arguments);
    this.graphQLOutputType = 'Location';

    if (!googleMapsKey) {
      throw new Error(
        'You must provide a `googleMapsKey` to Location Field. To generate a Google Maps API please visit: https://developers.google.com/maps/documentation/javascript/get-api-key'
      );
    }

    this._googleMapsKey = googleMapsKey;
  }

  get _supportsUnique() {
    return false;
  }

  extendAdminMeta(meta) {
    return {
      ...meta,
      googleMapsKey: this._googleMapsKey,
    };
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.stringInputFields('String'),
      ...this.inInputFields('String'),
    ];
  }

  getGqlAuxTypes() {
    return [
      `
      type ${this.graphQLOutputType} {
        id: ID
        googlePlaceID: String
        formattedAddress: String
        lat: Float
        lng: Float
      }
    `,
    ];
  }

  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }
        return itemValues;
      },
    };
  }

  async resolveInput({ resolvedData }) {
    const placeId = resolvedData[this.path];

    // NOTE: The following two conditions could easily be combined into a
    // single `if (!inputId) return inputId`, but that would lose the nuance of
    // returning `undefined` vs `null`.
    // Premature Optimisers; be ware!
    if (typeof placeId === 'undefined') {
      // Nothing was passed in, so we can bail early.
      return undefined;
    }

    if (placeId === null) {
      // `null` was specifically set, and we should set the field value to null
      // To do that we... return `null`
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${this._googleMapsKey}`
    ).then(r => r.json());

    if (response.results && response.results[0]) {
      const { place_id, formatted_address } = response.results[0];
      const { lat, lng } = response.results[0].geometry.location;
      return {
        id: new ObjectId(),
        googlePlaceID: place_id,
        formattedAddress: formatted_address,
        lat: lat,
        lng: lng,
      };
    }

    return null;
  }

  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }

  get gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
}

const CommonLocationInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.stringConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoLocationInterface extends CommonLocationInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = {
      type: {
        id: ObjectId,
        googlePlaceID: String,
        formattedAddress: String,
        lat: Number,
        lng: Number,
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexLocationInterface extends CommonLocationInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw `The Location field type doesn't support indexes on Knex. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`;
    }
  }

  addToTableSchema(table) {
    const column = table.jsonb(this.path);
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
}
