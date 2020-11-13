import { File } from '@keystonejs/fields';

class CloudinaryImage extends File.implementation {
  constructor() {
    super(...arguments);
    this.graphQLOutputType = 'CloudinaryImage_File';

    // Ducktype the adapter
    if (typeof this.fileAdapter.publicUrlTransformed !== 'function') {
      throw new Error('CloudinaryImage field must be used with CloudinaryAdapter');
    }
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }

  extendAdminMeta(meta) {
    // Overwrite so we have only the original meta
    return meta;
  }

  getFileUploadType() {
    return 'Upload';
  }

  getGqlAuxTypes({ schemaName }) {
    return [
      ...super.getGqlAuxTypes({ schemaName }),
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
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }

        return {
          publicUrl: this.fileAdapter.publicUrl(itemValues),
          publicUrlTransformed: ({ transformation }) =>
            this.fileAdapter.publicUrlTransformed(itemValues, transformation),
          ...itemValues,
        };
      },
    };
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'any' } };
  }
}

const MongoCloudinaryImageInterface = File.adapters.mongoose;
const KnexCloudinaryImageInterface = File.adapters.knex;
const PrismaCloudinaryImageInterface = File.adapters.prisma;

export {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
  PrismaCloudinaryImageInterface,
};
