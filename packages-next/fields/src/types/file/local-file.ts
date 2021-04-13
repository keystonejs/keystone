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
    path?: string;
    getFilename?: (arg: { id: string; originalFilename: string }) => string;
  }) {
    this.src = path.resolve(src);
    this.path = inputPath || '';
    this.getFilename = getFilename || (({ id, originalFilename }) => `${id}-${originalFilename}`);

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
    filename: string;
    id: string;
  }): Promise<{ filename: string; id: string }> {
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
          // @ts-ignore
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
   * Deletes the file from disk
   * @param file File field data
   */
  delete(file?: { filename: string }): Promise<void> {
    return new Promise((resolve, reject) => {
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
