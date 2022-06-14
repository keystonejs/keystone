import path from 'path';
import { pipeline } from 'stream';
import fs from 'fs-extra';

import { StorageConfig } from '../../types';
// import { getImageMetadataFromBuffer } from './createImagesContext';
import { FileAdapter, ImageAdapter } from './types';

export function localImageAssetsAPI(
  storageConfig: StorageConfig & { kind: 'local' }
): ImageAdapter {
  return {
    async url(id, extension) {
      return storageConfig.generateUrl(`/${id}.${extension}`);
    },
    async upload(buffer, id, extension) {
      // const buffer = await streamToBuffer(stream);

      await fs.writeFile(path.join(storageConfig.storagePath, `${id}.${extension}`), buffer);
    },
    async delete(id, extension) {
      await fs.unlink(path.join(storageConfig.storagePath, `${id}.${extension}`));
    },
  };
}

export function localFileAssetsAPI(storageConfig: StorageConfig & { kind: 'local' }): FileAdapter {
  return {
    async url(filename) {
      return storageConfig.generateUrl(`/${filename}`);
    },
    async upload(stream, filename) {
      const writeStream = fs.createWriteStream(path.join(storageConfig.storagePath, filename));
      const pipeStreams: Promise<void> = new Promise((resolve, reject) => {
        pipeline(stream, writeStream, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      try {
        await pipeStreams;
        const { size: filesize } = await fs.stat(path.join(storageConfig.storagePath, filename));
        return { filesize, filename };
      } catch (e) {
        await fs.remove(path.join(storageConfig.storagePath, filename));
        throw e;
      }
    },
    async delete(filename) {
      await fs.unlink(path.join(storageConfig.storagePath, filename));
    },
  };
}
