import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream';
import filenamify from 'filenamify';
import fs from 'fs-extra';

import slugify from '@sindresorhus/slugify';
import { KeystoneConfig, FilesContext } from '../../types';
import { parseFileRef } from '../../fields/types/file/utils';
import { CloudAssetsAPI } from '../cloud/assets';

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

export function createFilesContext(
  config: KeystoneConfig,
  cloudAssets: () => CloudAssetsAPI
): FilesContext | undefined {
  if (!config.files) {
    return;
  }

  const { files } = config;
  const { baseUrl = DEFAULT_BASE_URL, storagePath = DEFAULT_STORAGE_PATH } = files.local || {};

  if (files.upload === 'local') {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return {
    getUrl: async (mode, filename) => {
      if (mode === 'cloud') {
        return cloudAssets().files.url(filename);
      }

      return `${baseUrl}/${filename}`;
    },
    getDataFromRef: async (ref: string) => {
      const fileRef = parseFileRef(ref);

      if (!fileRef) {
        throw new Error('Invalid file reference');
      }

      const { mode, filename } = fileRef;

      if (mode === 'cloud') {
        const { filesize } = await cloudAssets().files.metadata(filename);

        return { filesize, ...fileRef };
      }

      const { size: filesize } = await fs.stat(path.join(storagePath, fileRef.filename));

      return { filesize, ...fileRef };
    },
    getDataFromStream: async (stream, originalFilename) => {
      const { upload: mode } = files;
      const filename = generateSafeFilename(originalFilename, files.transformFilename);

      if (mode === 'cloud') {
        const { filesize } = await cloudAssets().files.upload(stream, filename);

        return { mode, filesize, filename };
      }

      const writeStream = fs.createWriteStream(path.join(storagePath, filename));
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
        const { size: filesize } = await fs.stat(path.join(storagePath, filename));
        return { mode, filesize, filename };
      } catch (e) {
        await fs.remove(path.join(storagePath, filename));
        throw e;
      }
    },
  };
}
