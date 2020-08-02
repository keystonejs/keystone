import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import UnsplashAPI, { toJson } from 'unsplash-js';
import queryString from 'query-string';

import { Implementation } from '../../Implementation';

// Polyfill fetch so unsplash-js works
global.fetch = global.fetch || require('node-fetch');

const defaultTransforms = {
  fm: 'jpg',
  q: 75,
  fit: 'max',
};

function transformUserFromApiToKs5(user, { includeId = false } = {}) {
  return {
    ...(includeId && { id: user.id }),
    unsplashId: user.id,
    username: user.username,
    name: user.name,
    url: user.links.html,
    portfolioUrl: user.portfolio_url,
    bio: user.bio,
    location: user.location,
  };
}

function transformImageFromApiToKs5(image, { includeId = false } = {}) {
  return {
    ...(includeId && { id: image.id }),
    unsplashId: image.id,
    width: image.width,
    height: image.height,
    color: image.color,
    description: image.description || null,
    alt: image.alt_description || null,
    publicUrl: image.urls.raw,
    user: transformUserFromApiToKs5(image.user, { includeId }),
  };
}

export class Unsplash extends Implementation {
  constructor(_, { accessKey, secretKey }) {
    if (!accessKey) {
      throw new Error(
        'Must provide an accessKey to Unsplash Image Field. See https://unsplash.com/documentation#creating-a-developer-account'
      );
    }

    if (!secretKey) {
      throw new Error(
        'Must provide a secretKey to Unsplash Image Field. See https://unsplash.com/documentation#creating-a-developer-account'
      );
    }

    super(...arguments);
    this.graphQLOutputType = 'UnsplashImage';

    this.unsplash = new UnsplashAPI({
      accessKey,
      secret: secretKey,
    });
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }

  // Filter based on Unsplash Image IDs
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
        # A stripped down set of information about an Unsplash User
        # as returned from the Unsplash API
        type UnsplashUser {
          id: ID
          unsplashId: String
          username: String
          name: String
          # The user's URL on Unsplash
          url: String
          # The user supplied portfolio URL
          portfolioUrl: String
          bio: String
          location: String
        }
      `,
      `
        # Mirrors the formatting options [Unsplash provides](https://unsplash.com/documentation#dynamically-resizable-images).
        # All options are strings as they ultimately end up in a URL.
        input UnsplashImageFormat {
          w: String
          h: String
          crop: String
          # default: ${defaultTransforms.fm}
          fm: String
          auto: String
          # default: ${defaultTransforms.q}
          q: String
          # default: ${defaultTransforms.fit}
          fit: String
          dpi: String
        }
      `,
      `
        # Information describing an image as hosted by Unsplash
        # NOTE: The public URLs returned here are Unsplash CDN URLs as per their terms:
        # https://unsplash.com/api-terms
        type ${this.graphQLOutputType} {
          id: ID
          unsplashId: String
          width: Int
          height: Int
          color: String
          # The author-supplied description of this photo
          description: String
          # A description of the photo for use with screen readers
          alt: String
          publicUrl: String
          publicUrlTransformed(transformation: UnsplashImageFormat): String
          user: UnsplashUser
        }
      `,
      `
        enum UnsplashOrientation {
          landscape
          portrait
          squarish
        }
      `,
      `
        type UnsplashSearchResults {
          total: Int
          totalPages: Int
          results: [${this.graphQLOutputType}]
        }
      `,
    ];
  }

  getGqlAuxQueries() {
    return [
      `searchUnsplash(query: String!, page: Int, perPage: Int, orientation: UnsplashOrientation, collections: [String]): UnsplashSearchResults`,
    ];
  }

  gqlAuxQueryResolvers() {
    return {
      searchUnsplash: async (_, { query, page, perPage, orientation, collections }) => {
        const { total, total_pages, results } = await this.unsplash
          .request({
            url: '/search/photos',
            method: 'GET',
            query: {
              query,
              ...(typeof page !== 'undefined' && { page }),
              ...(typeof perPage !== 'undefined' && { per_page: perPage }),
              ...(typeof orientation !== 'undefined' && { orientation }),
              ...(collections && collections.length && { collections: collections.join(',') }),
            },
          })
          .then(toJson);

        return {
          total,
          totalPages: total_pages,
          results: results.map(result =>
            this.injectPublicUrlFields(transformImageFromApiToKs5(result, { includeId: true }))
          ),
        };
      },
    };
  }

  injectPublicUrlFields(data) {
    return {
      ...data,
      // We want the default transformations applied to the regular public
      // URL, so we do a "transformation" here too
      publicUrl: this.publicUrlTransformed(data.publicUrl),
      publicUrlTransformed: ({ transformation }) =>
        this.publicUrlTransformed(data.publicUrl, transformation),
    };
  }

  publicUrlTransformed(publicUrl, transformation) {
    const { url, query } = queryString.parseUrl(publicUrl);
    const transformationQueryString = queryString.stringify({
      // defaults first so they can be overwritten
      ...defaultTransforms,
      // User-supplided transformations get applied
      ...transformation,
      // Original query params go last so they can't be overwritten
      ...query,
    });
    return `${url}${transformationQueryString ? `?${transformationQueryString}` : ''}`;
  }

  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }

        return this.injectPublicUrlFields(itemValues);
      },
    };
  }

  async resolveInput({ resolvedData }) {
    const inputId = resolvedData[this.path];

    // NOTE: The following two conditions could easily be combined into a
    // single `if (!inputId) return inputId`, but that would lose the nuance of
    // returning `undefined` vs `null`.
    // Premature Optimisers; be ware!
    if (typeof inputId === 'undefined') {
      // Nothing was passed in, so we can bail early.
      return undefined;
    }

    if (inputId === null) {
      // `null` was specifically uploaded, and we should set the field value to
      // null. To do that we... return `null`
      return null;
    }

    const apiResponse = await this.unsplash.photos.getPhoto(inputId).then(toJson);

    // NOTE: No need to await the response here, it's an event trigger for
    // Unsplash.
    this.unsplash.photos.downloadPhoto(apiResponse);

    // NOTE: we need to provide an id for the image to avoid issues with Apollo
    // More info here: https://github.com/keystonejs/keystone/pull/1799
    return transformImageFromApiToKs5(apiResponse, { includeId: true });
  }

  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
}

const CommonUnsplashInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath, ({ unsplashId }) => unsplashId),
        ...this.stringConditions(dbPath, ({ unsplashId }) => unsplashId),
        ...this.inConditions(dbPath, ({ unsplashId }) => unsplashId),
      };
    }
  };

export class MongoUnsplashInterface extends CommonUnsplashInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = { type: Object };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexUnsplashInterface extends CommonUnsplashInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw `The Unsplash field type doesn't support indexes on Knex. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`;
    }
  }

  addToTableSchema(table) {
    const column = table.jsonb(this.path);
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
}
