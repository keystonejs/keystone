const { File, MongoFileInterface } = require('../File/Implementation');

class CloudinaryImage extends File {
  constructor() {
    super(...arguments);
    this.graphQLOutputType = 'CloudinaryImage_File';
  }

  getGraphqlOutputFields() {
    return [{ name: this.path, type: this.graphQLOutputType }];
  }
  extendAdminMeta(meta) {
    // Overwrite so we have only the original meta
    return meta;
  }
  getFileUploadType() {
    return 'Upload';
  }
  getGraphqlAuxiliaryTypes() {
    const args = [
      {
        comment: `Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).`,
      },
      { comment: `All options are strings as they ultimately end up in a URL.` },
      { comment: `Rewrites the filename to be this pretty string. Do not include '/' or '.'` },
      { name: `prettyName`, type: `String` },
      { name: `width`, type: `String` },
      { name: `height`, type: `String` },
      { name: `crop`, type: `String` },
      { name: `aspect_ratio`, type: `String` },
      { name: `gravity`, type: `String` },
      { name: `zoom`, type: `String` },
      { name: `x`, type: `String` },
      { name: `y`, type: `String` },
      { name: `format`, type: `String` },
      { name: `fetch_format`, type: `String` },
      { name: `quality`, type: `String` },
      { name: `radius`, type: `String` },
      { name: `angle`, type: `String` },
      { name: `effect`, type: `String` },
      { name: `opacity`, type: `String` },
      { name: `border`, type: `String` },
      { name: `background`, type: `String` },
      { name: `overlay`, type: `String` },
      { name: `underlay`, type: `String` },
      { name: `default_image`, type: `String` },
      { name: `delay`, type: `String` },
      { name: `color`, type: `String` },
      { name: `color_space`, type: `String` },
      { name: `dpr`, type: `String` },
      { name: `page`, type: `String` },
      { name: `density`, type: `String` },
      { name: `flags`, type: `String` },
      { name: `transformation`, type: `String` },
    ];
    return [
      ...super.getGraphqlAuxiliaryTypes(),
      { prefix: 'input', name: 'CloudinaryImageFormat', args },
      {
        prefix: 'extend type',
        name: this.graphQLOutputType,
        args: [
          {
            name: 'publicUrlTransformed',
            args: [{ name: 'transformation', type: 'CloudinaryImageFormat' }],
            type: 'String',
          },
        ],
      },
    ];
  }
  // Called on `User.avatar` for example
  getGraphqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }
        return {
          publicUrl: this.config.adapter.publicUrl(itemValues),
          publicUrlTransformed: ({ transformation }) =>
            this.config.adapter.publicUrlTransformed(itemValues, transformation),
          ...itemValues,
        };
      },
    };
  }
  getGraphqlAuxiliaryMutations() {
    return [
      {
        name: 'uploadCloudinaryImage',
        args: [{ name: `file`, type: `${this.getFileUploadType()}!` }],
        type: this.graphQLOutputType,
      },
    ];
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
