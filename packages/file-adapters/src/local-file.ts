import fs from 'fs';
import path from 'path';
// @ts-ignore
import mkdirp from 'mkdirp';

export class LocalFileAdapter {
  src: string;
  path: string;
  getFilename: (arg: { id: string; originalFilename: string }) => string;
  constructor({
    src,
    path: inputPath,
    getFilename,
  }: {
    src: string;
    path: string;
    getFilename?: (arg: { id: string; originalFilename: string }) => string;
  }) {
    this.src = path.resolve(src);
    this.path = inputPath;

    if (!getFilename) {
      this.getFilename = ({ id, originalFilename }) => `${id}-${originalFilename}`;
    } else {
      this.getFilename = getFilename;
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
  save({
    stream,
    filename: originalFilename,
    id,
  }: {
    stream: fs.ReadStream;
    id: string;
    filename: string;
  }) {
    const filename = this.getFilename({ id, originalFilename });
    if (!filename) {
      throw new Error(
        'Custom function LocalFileAdapter.getFilename() returned no or invalid value.'
      );
    }

    const filePath = path.join(this.src, filename);
    // https://github.com/jaydenseric/apollo-upload-examples/issues/22
    return new Promise((resolve, reject) =>
      stream
        .on('error', error => {
          fs.unlink(filePath, () => {
            reject(error);
          });
        })
        .pipe(fs.createWriteStream(filePath))
        .on('error', error => reject(error))
        .on('finish', () => resolve({ filename, id }))
    );
  }

  /**
   * Deletes the file from disk
   * @param file File field data
   */
  delete(file: { filename: string }) {
    return new Promise<void>((resolve, reject) => {
      if (file) {
        fs.unlink(path.join(this.src, file.filename), error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error("Missing required argument 'file'."));
      }
    });
  }

  /**
   * Params: { id, filename }
   */
  publicUrl({ filename }: { filename: string }) {
    return `${this.path}/${filename}`;
  }
}
