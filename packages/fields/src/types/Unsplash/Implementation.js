import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';
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

function transformUserFromApiToKs5(user) {
  return {
    unsplpashId: user.id,
    username: user.username,
    name: user.name,
    url: user.links.html,
    portfolioUrl: user.portfolio_url,
    bio: user.bio,
    location: user.location,
  };
}

function transformImageFromApiToKs5(image) {
  return {
    unsplashId: image.id,
    width: image.width,
    height: image.height,
    color: image.color,
    description: image.description || image.alt_description,
    publicUrl: image.urls.raw,
    user: transformUserFromApiToKs5(image.user),
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
      applicationId: accessKey,
      secret: secretKey,
    });
  }

  get gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }

  // Filter based on Unsplash Image IDs
  get gqlQueryInputFields() {
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
        type UnsplashImage {
          id: ID
          unsplashId: String
          width: Int
          height: Int
          color: String
          description: String
          publicUrl: String
          publicUrlTransformed(transformation: UnsplashImageFormat): String
          user: UnsplashUser
        }
      `,
    ];
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
  get gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }

        return {
          ...itemValues,
          // We want the default transformations applied to the regular public
          // URL, so we do a "transformation" here too
          publicUrl: this.publicUrlTransformed(itemValues.publicUrl),
          publicUrlTransformed: ({ transformation }) =>
            this.publicUrlTransformed(itemValues.publicUrl, transformation),
        };
      },
    };
  }

  async resolveInput({ resolvedData }) {
    const inputId = resolvedData[this.path];
    if (!inputId) {
      return null;
    }

    const apiResponse = await this.unsplash.photos.getPhoto(inputId).then(toJson);

    // NOTE: No need to await the response here, it's an event trigger for
    // Unsplash.
    this.unsplash.photos.downloadPhoto(apiResponse);

    return transformImageFromApiToKs5(apiResponse);
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
  createColumn(table) {
    return table.json(this.path);
  }
}
