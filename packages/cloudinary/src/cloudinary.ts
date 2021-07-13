import fs from 'fs';
import cloudinary from 'cloudinary';

export type File = { id: string; filename: string; _meta: cloudinary.UploadApiResponse };

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

function uploadStream(
  stream: fs.ReadStream,
  options: cloudinary.UploadApiOptions
): Promise<cloudinary.UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const cloudinaryStream = cloudinary.v2.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        return reject(error);
      }
      resolve(result);
    });

    stream.pipe(cloudinaryStream);
  });
}

export class CloudinaryAdapter {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
  constructor({
    cloudName,
    apiKey,
    apiSecret,
    folder,
  }: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
  }) {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('CloudinaryAdapter requires cloudName, apiKey, and apiSecret');
    }
    this.cloudName = cloudName;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.folder = folder || undefined;
  }

  /**
   * Params: { stream, filename, id }
   */
  save({ stream, filename, id }: { stream: fs.ReadStream; filename: string; id: string }) {
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
  delete(file?: File, options = {}) {
    const destroyOptions = {
      // Auth
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      cloud_name: this.cloudName,
      ...options,
    };

    return new Promise((resolve, reject) => {
      if (file) {
        // @ts-ignore
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

  publicUrl(file?: File) {
    return file?._meta?.secure_url || null;
  }

  publicUrlTransformed(file: File, options: CloudinaryImageFormat = {}) {
    if (!file._meta) {
      return null;
    }

    const { prettyName, ...transformation } = options;
    // No formatting options provided, return the publicUrl field
    if (!Object.keys(transformation).length) {
      return this.publicUrl(file);
    }
    const { public_id, format } = file._meta;

    // Docs: https://github.com/cloudinary/cloudinary_npm/blob/439586eac73cee7f2803cf19f885e98f237183b3/src/utils.coffee#L472 (LOL)
    // @ts-ignore
    return cloudinary.url(public_id, {
      type: 'upload',
      format,
      secure: true,
      url_suffix: prettyName,
      transformation,
      cloud_name: this.cloudName,
    });
  }
}
