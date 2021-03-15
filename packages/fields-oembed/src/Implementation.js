import { MongooseFieldAdapter } from '@keystone-next/adapter-mongoose-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields-legacy';

export class OEmbed extends Implementation {
  constructor(path, { adapter, parameters = {} }, { listKey }) {
    super(...arguments);

    if (!adapter) {
      throw new Error(
        `An OEmbed Adapter must be supplied for the OEmbed field to fetch oEmbed data. See the ${listKey}.${path} field.`
      );
    }

    if (typeof adapter.fetch !== 'function') {
      throw new Error(
        `An invalid OEmbed Adapter was set on the ${listKey}.${path} field - it does not implement the #fetch() method.`
      );
    }

    if (typeof parameters !== 'object') {
      throw new Error(
        `parameters passed to the OEmbed Adapter must be an object. See the ${listKey}.${path} field.`
      );
    }

    this.graphQLOutputType = 'OEmbed';
    this.adapter = adapter;
    this.parameters = parameters;
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }

  gqlQueryInputFields() {
    return [...this.equalityInputFields('String'), ...this.inInputFields('String')];
  }

  getGqlAuxTypes() {
    const baseFields = `
      # The resource type. One of 'photo'/'video'/'link'/'rich'
      type: String!
      # The original input URL which the oEmbed data was generated from
      originalUrl: String!
      # The oEmbed version number. Will be 1.0.
      version: String
      # A text title, describing the resource.
      title: String
      # The suggested cache lifetime for this resource, in seconds. Consumers may choose to use this value or not.
      cacheAge: String
      # The resource provider.
      provider: ${this.graphQLOutputType}Provider
      # The author/owner of the resource.
      author: ${this.graphQLOutputType}Author
      # An optional thumbnail image representing the resource.
      thumbnail: ${this.graphQLOutputType}Thumbnail
    `;
    return [
      `
        type ${this.graphQLOutputType}Thumbnail {
          # A URL to a thumbnail image
          url: String!
          # The width of the thumbnail in pixels
          width: String!
          # The height of the thumbnail
          height: String!
        }
      `,
      `
        type ${this.graphQLOutputType}Author {
          # The name of the author/owner of the resource.
          name: String
          # A URL for the author/owner of the resource.
          url: String
        }
      `,
      `
        type ${this.graphQLOutputType}Provider {
          # The name of the resource provider.
          name: String
          # The url of the resource provider.
          url: String
        }
      `,
      `
        """
        The base ${this.graphQLOutputType} type.
        See the following implementations:
        - ${this.graphQLOutputType}Link
        - ${this.graphQLOutputType}Photo
        - ${this.graphQLOutputType}Video
        - ${this.graphQLOutputType}Rich
        """
        interface ${this.graphQLOutputType} {
          ${baseFields}
        }
      `,
      // NOTE: The Link type only implements the base fields
      `
        # Generic embed data.
        type ${this.graphQLOutputType}Link implements ${this.graphQLOutputType} {
          ${baseFields}
        }
      `,
      `
        # This type is used for representing static photos in oEmbed data.
        type ${this.graphQLOutputType}Photo implements ${this.graphQLOutputType} {
          ${baseFields}
          # The source URL of the image. Consumers should be able to insert this URL into an <img> element. Only HTTP and HTTPS URLs are valid.
          url: String!
          # The width in pixels of the image
          width: String
          # The height in pixels of the image
          height: String
        }
      `,
      `
        # This type is used for representing playable videos in oEmbed data.
        type ${this.graphQLOutputType}Video implements ${this.graphQLOutputType} {
          ${baseFields}
          # The HTML required to embed a video player. The HTML should have no padding or margins. Consumers may wish to load the HTML in an off-domain iframe to avoid XSS vulnerabilities.
          html: String!
          # The width in pixels required to display the HTML.
          width: String
          # The height in pixels required to display the HTML.
          height: String
        }
      `,
      `
        # This type is used for rich HTML content that does not fall under ${this.graphQLOutputType}Link, ${this.graphQLOutputType}Photo, or ${this.graphQLOutputType}Video.
        type ${this.graphQLOutputType}Rich implements ${this.graphQLOutputType} {
          ${baseFields}
          # The HTML required to display the resource. The HTML should have no padding or margins. Consumers may wish to load the HTML in an off-domain iframe to avoid XSS vulnerabilities. The markup should be valid XHTML 1.0 Basic.
          html: String!
          # The width in pixels required to display the HTML.
          width: String
          # The height in pixels required to display the HTML.
          height: String
        }
      `,
    ];
  }

  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        if (!item[this.path]) {
          return null;
        }

        // Because we're returning an interface, we have to tell GraphQL what
        // __typename to use.
        let __typename = {
          photo: `${this.graphQLOutputType}Photo`,
          video: `${this.graphQLOutputType}Video`,
          link: `${this.graphQLOutputType}Link`,
          rich: `${this.graphQLOutputType}Rich`,
        }[item[this.path].type];

        return {
          ...item[this.path],
          __typename,
        };
      },
    };
  }

  async resolveInput({ resolvedData }) {
    const inputUrl = resolvedData[this.path];

    // NOTE: The following two conditions could easily be combined into a
    // single `if (!inputUrl) return inputUrl`, but that would lose the nuance of
    // returning `undefined` vs `null`.
    // Premature Optimisers; be ware!
    if (typeof inputUrl === 'undefined') {
      // Nothing was passed in, so we can bail early.
      return undefined;
    }

    if (inputUrl === null || inputUrl.trim() === '') {
      // `null` or `''` was specifically uploaded, and we should set the field
      // value to null. To do that we... return `null`
      return null;
    }

    // Pull all possible oEmbed fields from the adapter
    const {
      type,
      version,
      title,
      author_name,
      author_url,
      provider_name,
      provider_url,
      cache_age,
      thumbnail_url,
      thumbnail_width,
      thumbnail_height,
      url,
      html,
      width,
      height,
      error,
    } = await this.adapter.fetch({
      ...this.parameters,
      // Force the url parameter
      url: inputUrl,
    });

    // Convert them into a more GraphQL friendly format
    return {
      originalUrl: inputUrl,
      type: type || 'link',
      version,
      title,
      cache_age,
      // Only parts of the author might exist
      author:
        author_name || author_url
          ? {
              name: author_name || null,
              url: author_url || null,
            }
          : null,
      // Only parts of the author might exist
      provider:
        provider_name || provider_url
          ? {
              name: provider_name || null,
              url: provider_url || null,
            }
          : null,
      // All fields of thumbnail are required
      thumbnail:
        thumbnail_url && thumbnail_width && thumbnail_height
          ? {
              url: thumbnail_url,
              width: thumbnail_width,
              height: thumbnail_height,
            }
          : null,
      url,
      html,
      width,
      height,
      error,
    };
  }

  gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'Record<string, any> | null' } };
  }
}

const CommonOEmbedInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoOEmbedInterface extends CommonOEmbedInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = { type: Object };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexOEmbedInterface extends CommonOEmbedInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw (
        `The OEmbed field type doesn't support indexes on Knex. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  addToTableSchema(table) {
    const column = table.jsonb(this.path);
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
}

export class PrismaOEmbedInterface extends CommonOEmbedInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);
    if (this.listAdapter.parentAdapter.provider === 'sqlite') {
      throw new Error(
        `PrismaAdapter provider "sqlite" does not support field type "${this.field.constructor.name}"`
      );
    }
    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw (
        `The OEmbed field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'Json' })];
  }
}
