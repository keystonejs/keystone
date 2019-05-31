const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = class LocalFileAdapter {
  constructor({ directory, route }) {
    this.directory = path.resolve(directory);
    this.route = route;

    mkdirp.sync(this.directory);
  }

  /**
   * Params: { stream, filename, mimetype, encoding, id }
   */
  save({ stream, filename: originalFilename, id }) {
    const filename = `${id}-${originalFilename}`;
    const filePath = path.join(this.directory, filename);
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
    return `${this.route}/${filename}`;
  }
};
