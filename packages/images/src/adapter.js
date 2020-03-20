const cloudinary = require('cloudinary');
const util = require('util');

const uploader = {
  delete: util.promisify(cloudinary.v2.uploader.destroy),
  uploadStream: util.promisify(cloudinary.v2.uploader.upload_stream),
};

async function uploadStream(stream, options) {
  const cloudinaryStream = await uploader.uploadStream(options);
  stream.pipe(cloudinaryStream);
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
  async save({ stream, filename, id }) {
    // Push to cloudinary
    const result = await uploadStream(stream, {
      public_id: id,
      folder: this.folder,
      // Auth
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      cloud_name: this.cloudName,
    });

    return {
      // Return the relevant data for the File api
      id,
      filename,
      _meta: result,
    };
  }

  /**
   * Deletes the given file from cloudinary
   * @param file File field data
   * @param options Delete options passed to cloudinary.
   *                For available options refer to the [Cloudinary destroy API](https://cloudinary.com/documentation/image_upload_api_reference#destroy_method).
   */
  async delete(file, options = {}) {
    if (!file) {
      throw new Error('Missing required argument \'file\'.');
    }

    return uploader.destroy(file.id, options);
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
    if (Object.keys(transformation).length === 0) {
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
