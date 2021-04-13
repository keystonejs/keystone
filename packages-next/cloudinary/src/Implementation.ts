import cuid from 'cuid';
import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation, FieldConfigArgs, FieldExtraArgs } from '@keystone-next/fields';
import { BaseKeystoneList } from '@keystone-next/types';
import cloudinary from 'cloudinary';
import { FileUpload } from 'graphql-upload';
import { CloudinaryAdapter, File } from './cloudinary';

type StoredFile = {
  id: string;
  filename: string;
  originalFilename: string;
  mimetype: any;
  encoding: any;
  _meta: cloudinary.UploadApiResponse;
};

export type CloudinaryImageFormat = {
  prettyName?: string | null;
  width?: string | null;
  height?: string | null;
  crop?: string | null;
  aspect_ratio?: string | null;
  gravity?: string | null;
  zoom?: string | null;
  x?: string | null;
  y?: string | null;
  format?: string | null;
  fetch_format?: string | null;
  quality?: string | null;
  radius?: string | null;
  angle?: string | null;
  effect?: string | null;
  opacity?: string | null;
  border?: string | null;
  background?: string | null;
  overlay?: string | null;
  underlay?: string | null;
  default_image?: string | null;
  delay?: string | null;
  color?: string | null;
  color_space?: string | null;
  dpr?: string | null;
  page?: string | null;
  density?: string | null;
  flags?: string | null;
  transformation?: string | null;
};

class CloudinaryImage<P extends string> extends Implementation<P> {
  fileAdapter: CloudinaryAdapter;
  graphQLOutputType: string;
  constructor(
    path: P,
    { adapter, ...configArgs }: FieldConfigArgs & { adapter: CloudinaryAdapter },
    extraArgs: FieldExtraArgs
  ) {
    super(path, { adapter, ...configArgs }, extraArgs);
    this.graphQLOutputType = 'CloudinaryImage_File';
    this.fileAdapter = adapter;

    if (!this.fileAdapter) {
      throw new Error(`No file adapter provided for File field.`);
    }
    // Ducktype the adapter
    if (typeof this.fileAdapter.publicUrlTransformed !== 'function') {
      throw new Error('CloudinaryImage field must be used with CloudinaryAdapter');
    }
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

  getFileUploadType() {
    return 'Upload';
  }

  getGqlAuxTypes() {
    return [
      `
      type ${this.graphQLOutputType} {
        id: ID
        path: String
        filename: String
        originalFilename: String
        mimetype: String
        encoding: String
        publicUrl: String
      }
    `,
      `
      """
      Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).
      All options are strings as they ultimately end up in a URL.
      """
      input CloudinaryImageFormat {
        """ Rewrites the filename to be this pretty string. Do not include \`/\` or \`.\` """
        prettyName: String
        width: String
        height: String
        crop: String
        aspect_ratio: String
        gravity: String
        zoom: String
        x: String
        y: String
        format: String
        fetch_format: String
        quality: String
        radius: String
        angle: String
        effect: String
        opacity: String
        border: String
        background: String
        overlay: String
        underlay: String
        default_image: String
        delay: String
        color: String
        color_space: String
        dpr: String
        page: String
        density: String
        flags: String
        transformation: String
      }`,

      `extend type ${this.graphQLOutputType} {
        publicUrlTransformed(transformation: CloudinaryImageFormat): String
      }`,
    ];
  }

  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: (item: Record<P, undefined | null | string | File>) => {
        let itemValues: undefined | null | string | File = item[this.path];
        if (itemValues === null || itemValues === undefined) {
          return null;
        }
        if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
          // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
          // https://github.com/prisma/prisma/issues/3786
          try {
            itemValues = JSON.parse(itemValues as string) as File;
          } catch (err) {}
        }
        const _itemValues = itemValues as File;
        return {
          publicUrl: this.fileAdapter.publicUrl(_itemValues),
          publicUrlTransformed: ({ transformation }: { transformation: CloudinaryImageFormat }) =>
            this.fileAdapter.publicUrlTransformed(_itemValues, transformation),
          ..._itemValues,
        };
      },
    };
  }

  async resolveInput({
    resolvedData,
    existingItem,
  }: {
    resolvedData: Record<P, FileUpload>;
    existingItem?: Record<P, string | StoredFile>;
  }) {
    const previousData: string | StoredFile | undefined = existingItem && existingItem[this.path];
    const uploadData = resolvedData[this.path];

    // NOTE: The following two conditions could easily be combined into a
    // single `if (!uploadData) return uploadData`, but that would lose the
    // nuance of returning `undefined` vs `null`.
    // Premature Optimisers; be ware!
    if (typeof uploadData === 'undefined') {
      // Nothing was passed in, so we can bail early.
      return undefined;
    }

    if (uploadData === null) {
      // `null` was specifically uploaded, and we should set the field value to
      // null. To do that we... return `null`
      return null;
    }

    const { createReadStream, filename: originalFilename, mimetype, encoding } = await uploadData;
    const stream = createReadStream();

    if (!stream && previousData) {
      // TODO: FIXME: Handle when stream is null. Can happen when:
      // Updating some other part of the item, but not the file (gets null
      // because no File DOM element is uploaded)
      return previousData;
    }

    const { id, filename, _meta } = await this.fileAdapter.save({
      stream,
      filename: originalFilename,
      id: cuid(),
    });

    const ret: StoredFile = { id, filename, originalFilename, mimetype, encoding, _meta };
    if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
      // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
      // https://github.com/prisma/prisma/issues/3786
      return JSON.stringify(ret);
    }
    return ret;
  }

  gqlUpdateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }

  gqlCreateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'any' } };
  }
}

class PrismaCloudinaryImageInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: CloudinaryImage<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw (
        `The CloudinaryImage field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }
  getPrismaSchema() {
    // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
    // https://github.com/prisma/prisma/issues/3786
    return [
      this._schemaField({
        type: this.listAdapter.parentAdapter.provider === 'sqlite' ? 'String' : 'Json',
      }),
    ];
  }
  getQueryConditions(dbPath: string) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}

export { CloudinaryImage, PrismaCloudinaryImageInterface };
