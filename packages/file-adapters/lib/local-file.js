const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = class LocalFileAdapter {
  constructor({ src, path: inputPath, getFilename }) {
    this.src = path.resolve(src);
    this.path = inputPath;
    this.getFilename = getFilename;

    if (!this.getFilename) {
      this.getFilename = ({ id, originalFilename }) => `${id}-${originalFilename}`;
    }

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
    const filename = this.getFilename({ id, originalFilename });
    if (!filename) {
      throw new Error(
        'Custom function LocalFileAdapter.getFilename() returned no or invalid value.'
      );
    }

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
   * Takes a file data structure such as existingItem in a hook callback.
   */
  delete({ file }) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("'file' was not provided."));
      } else {
        fs.unlink(path.join(this.src, file.filename), error => {
          if (error) {
            if (error.code === 'ENOENT') {
              reject(new Error(`Could not find file '${file.filename}' for deletion.`));
            } else {
              reject(error);
            }
          } else {
            resolve();
          }
        });
      }
    });
  }

  /**
   * Params: { id, filename }
   */
  publicUrl({ filename }) {
    return `${this.path}/${filename}`;
  }
};
