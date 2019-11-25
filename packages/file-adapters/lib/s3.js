const path = require('path');
const AWS = require('aws-sdk');
const urlJoin = require('url-join');

module.exports = class S3Adapter {
  constructor({
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
    folder,
    publicUrl,
    s3Options,
    uploadParams,
    deleteParams,
  }) {
    if (!accessKeyId || !secretAccessKey || !region || !bucket || !folder) {
      throw new Error('S3Adapter requires accessKeyId, secretAccessKey, region, bucket, folder.');
    }
    this.s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
      ...s3Options,
    });
    this.bucket = bucket;
    this.folder = folder;
    if (publicUrl) {
      this.publicUrl = publicUrl;
    }
    this.uploadParams = uploadParams || {};
    this.deleteParams = deleteParams || {};
  }

  save({ stream, filename, id, mimetype, encoding }) {
    return new Promise((resolve, reject) => {
      let { uploadParams } = this;
      if (typeof uploadParams === 'function') {
        uploadParams = this.uploadParams({ filename, id, mimetype, encoding });
      }
      this.s3.putObject(
        {
          Body: stream,
          ContentType: mimetype,
          Bucket: this.bucket,
          Key: path.join(this.folder, filename),
          ...uploadParams,
        },
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve({ id, filename, _meta: data });
          }
          stream.close();
        }
      );
    });
  }

  /**
   * Takes a file data structure such as existingItem in a hook callback.
   */
  delete({ file }) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("'file' was not provided."));
      } else {
        let { deleteParams } = this;
        if (typeof deleteParams === 'function') {
          deleteParams = this.deleteParams(file);
        }
        this.s3.deleteObject(
          {
            Bucket: this.bucket,
            Key: path.join(this.folder, file.filename),
            ...deleteParams,
          },
          (error, data) => {
            if (error) {
              reject(error);
            } else {
              resolve(data);
            }
          }
        );
      }
    });
  }

  publicUrl({ filename }) {
    // This Url will only work if:
    // - the bucket is public OR
    // - the file is set to a canned ACL (ie, uploadParams: { ACL: 'public-read' }) OR
    // - you pass credentials during your request
    return urlJoin(`https://${this.bucket}.s3.amazonaws.com`, this.folder, filename);
  }
};
