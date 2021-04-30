import path from 'path';
import crypto from 'crypto';
import filenamify from 'filenamify';
import { FilesConfig, FilesContext } from '@keystone-next/types';
import fs from 'fs-extra';

import { parseFileRef } from '@keystone-next/utils-legacy';
import slugify from '@sindresorhus/slugify';

const DEFAULT_BASE_URL = '/files';
const DEFAULT_STORAGE_PATH = './public/files';

const defaultTransformer = (str: string) => slugify(str);

const generateSafeFilename = (
  filename: string,
  transformFilename: (str: string) => string = defaultTransformer
) => {
  // Appends a UUID to the filename so that people can't brute-force guess stored filenames
  //
  // This regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphabetical character before the end of the string
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z]+)?$/) as RegExpMatchArray;

  const id = crypto
    .randomBytes(24)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(12);

  // console.log(id, id.length, id.slice(12).length);
  const urlSafeName = filenamify(transformFilename(name), {
    maxLength: 100 - id.length,
    replacement: '-',
  });
  if (ext) {
    return `${urlSafeName}-${id}${ext}`;
  }
  return `${urlSafeName}-${id}`;
};

export function createFilesContext(config?: FilesConfig): FilesContext | undefined {
  if (!config) {
    return;
  }

  const { baseUrl = DEFAULT_BASE_URL, storagePath = DEFAULT_STORAGE_PATH } = config.local || {};

  fs.mkdirSync(storagePath, { recursive: true });

  return {
    getSrc: (mode, filename) => {
      return `${baseUrl}/${filename}`;
    },
    getDataFromRef: async (ref: string) => {
      const fileRef = parseFileRef(ref);
      if (!fileRef) {
        throw new Error('Invalid file reference');
      }
      const { size: filesize } = await fs.stat(path.join(storagePath, fileRef.filename));
      return { filesize, ...fileRef };
    },
    getDataFromStream: async (stream, filename) => {
      const { upload: mode } = config;
      const safeFilename = generateSafeFilename(filename, config.transformFilename);
      const writeStream = fs.createWriteStream(path.join(storagePath, safeFilename));
      const observeStreamErrors: Promise<void> = new Promise((resolve, reject) => {
        stream.on('end', () => {
          resolve();
        });
        // reject on both writeStream and read stream errors
        writeStream.on('error', err => {
          reject(err);
        });
        stream.on('error', err => {
          reject(err);
        });
      });

      for await (let chunk of stream) {
        writeStream.write(chunk);
      }

      try {
        await observeStreamErrors;
        const { size: filesize } = await fs.stat(path.join(storagePath, safeFilename));
        return { mode, filesize, filename: safeFilename };
      } catch (e) {
        await fs.remove(path.join(storagePath, safeFilename));
        throw e;
      }
    },
  };
}
