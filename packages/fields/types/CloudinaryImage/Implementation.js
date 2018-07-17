const { File, MongoFileInterface } = require('../File/Implementation');

class CloudinaryImage extends File {
  constructor() {
    super(...arguments);
    this.graphQLType = 'CloudinaryImage_File';
  }
  extendAdminMeta(meta) {
    // Overwrite so we have only the original meta
    return meta;
  }
  getFileUploadType() {
    return 'CloudinaryImage_Upload';
  }
  getGraphqlAuxiliaryTypes() {
    return `
      ${super.getGraphqlAuxiliaryTypes()}

      # Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).
      # All options are strings as they ultimately end up in a URL.
      input CloudinaryImageFormat {
        # Rewrites the filename to be this pretty string. Do not include '/' or '.'
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
      }

      extend type ${this.graphQLType} {
        publicUrlTransformed(transformation: CloudinaryImageFormat): String
      }
    `;
  }
  // Called on `User.avatar` for example
  getGraphqlFieldResolvers() {
    return {
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }
        return {
          publicUrl: this.config.adapter.publicUrl(itemValues),
          publicUrlTransformed: ({ transformation }) =>
            this.config.adapter.publicUrlTransformed(
              itemValues,
              transformation
            ),
          ...itemValues,
        };
      },
    };
  }
  getGraphqlAuxiliaryMutations() {
    return `
      uploadCloudinaryImage(file: ${this.getFileUploadType()}!): ${
      this.graphQLType
    }
    `;
  }
  getGraphqlAuxiliaryMutationResolvers() {
    return {
      /**
       * @param obj {Object} ... an object
       * @param data {Object} With key `file`
       */
      uploadCloudinaryImage: () => {
        throw new Error('uploadCloudinaryImage mutation not implemented');
        //return this.processUpload(file);
      },
    };
  }
}

module.exports = {
  CloudinaryImage,
  MongoCloudinaryImageInterface: MongoFileInterface,
};
