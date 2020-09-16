const cloudinary = require('cloudinary');

function uploadStream(stream, options) {
  return new Promise((resolve, reject) => {
    const cloudinaryStream = cloudinary.v2.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    stream.pipe(cloudinaryStream);
  });
}

module.exports = class CloudinaryAdapter {
  constructor({ cloudName, apiKey, apiSecret, folder }) {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('CloudinaryAdapter requires cloudName, apiKey, and apiSecret');
    }
    this.cloudName = cloudName;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.folder = folder || undefined;
  }

  /**
   * Params: { stream, filename, mimetype, encoding, id }
   */
  save({ stream, filename, id }) {
    // Push to cloudinary
    return uploadStream(stream, {
      public_id: id,
      folder: this.folder,
      // Auth
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      cloud_name: this.cloudName,
    }).then(result => ({
      // Return the relevant data for the File api
      id,
      filename,
      _meta: result,
    }));
  }

  /**
   * Deletes the given file from cloudinary
   * @param file File field data
   * @param options Delete options passed to cloudinary.
   *                For available options refer to the [Cloudinary destroy API](https://cloudinary.com/documentation/image_upload_api_reference#destroy_method).
   */
  delete(file, options = {}) {
    const destroyOptions = {
      // Auth
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      cloud_name: this.cloudName,
      ...options,
    };

    return new Promise((resolve, reject) => {
      if (file) {
        cloudinary.v2.uploader.destroy(file._meta.public_id, destroyOptions, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } else {
        reject(new Error("Missing required argument 'file'."));
      }
    });
  }

  publicUrl({ _meta: { secure_url } = {} } = {}) {
    return secure_url || null;
  }

  publicUrlTransformed({ _meta } = {}, options = {}) {
    if (!_meta) {
      return null;
    }

    const { prettyName, ...transformation } = options;
    // No formatting options provided, return the publicUrl field
    if (!Object.keys(transformation).length) {
      return this.publicUrl({ _meta });
    }
    const { public_id, format } = _meta;

    // Docs: https://github.com/cloudinary/cloudinary_npm/blob/439586eac73cee7f2803cf19f885e98f237183b3/src/utils.coffee#L472 (LOL)
    return cloudinary.url(public_id, {
      type: 'upload',
      format,
      secure: true,
      url_suffix: prettyName,
      transformation,
      cloud_name: this.cloudName,
    });
  }
};
