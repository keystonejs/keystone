const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = class LocalFileAdapter {
  constructor({ src, path: inputPath }) {
    this.src = path.resolve(src);
    this.path = inputPath;

    if (!this.src) {
      throw new Error('LocalFileAdapter requires a src attribute.');
    }

    if (!this.path) {
      this.path = src;
    }

    mkdirp.sync(this.src);
  }

  /**
   * Params: { stream, filename, mimetype, encoding, id }
   */
  save({ stream, filename: originalFilename, id }) {
    const filename = `${id}-${originalFilename}`;
    const filePath = path.join(this.src, filename);
    return new Promise((resolve, reject) =>
      stream
        .on('error', error => {
          if (stream.truncated) {
            // Delete the truncated file
            fs.unlinkSync(filePath);
          }
          reject(error);
        })
        .pipe(fs.createWriteStream(filePath))
        .on('error', error => reject(error))
        .on('finish', () => resolve({ filename, id }))
    );
  }

  /**
   * Params: { id, filename }
   */
  publicUrl({ filename }) {
    return `${this.path}/${filename}`;
  }
};
