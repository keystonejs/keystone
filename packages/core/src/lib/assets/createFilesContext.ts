import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream';
import filenamify from 'filenamify';
import fs from 'fs-extra';

import slugify from '@sindresorhus/slugify';
import { KeystoneConfig, FilesContext } from '../../types';
import { AssetsAPI } from './types';

const DEFAULT_BASE_URL = '/files';
export const DEFAULT_FILES_STORAGE_PATH = './public/files';

const defaultTransformer = (str: string) => slugify(str);

const generateSafeFilename = (
  filename: string,
  transformFilename: (str: string) => string = defaultTransformer
) => {
  // Appends a UUID to the filename so that people can't brute-force guess stored filenames
  //
  // This regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphanumerical character before the end of the string
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z0-9]+)?$/) as RegExpMatchArray;

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
  s3Assets: () => Map<string, AssetsAPI>
): FilesContext | undefined {
  if (!config.storage) {
    return;
  }

  const { storage } = config;

  Object.entries(storage).forEach(([, val]) => {
    if (val.type === 'file' && val.kind === 'local') {
      fs.mkdirSync(val.storagePath || DEFAULT_FILES_STORAGE_PATH, { recursive: true });
    }
  });

  return {
    getUrl: async (storageString, filename) => {
      let storageConfig = config.storage?.[storageString];

      switch (storageConfig?.kind) {
        case 's3': {
          const s3Instance = s3Assets().get(storageString);

          if (!s3Instance) {
            throw new Error(`Keystone has no connection to S3 storage location ${storageConfig}`);
          }

          return s3Instance.files.url(filename);
        }
        case 'local': {
          return `${storageConfig.baseUrl || DEFAULT_BASE_URL}/${filename}`;
        }
      }

      throw new Error(
        `attempted to get URL for storage ${storageString}, however could not find the config for it`
      );
    },
    getDataFromStream: async (storageString, stream, originalFilename) => {
      const storageConfig = config.storage?.[storageString];
      const filename = generateSafeFilename(originalFilename);

      switch (storageConfig?.kind) {
        case 's3': {
          const s3Instance = s3Assets().get(storageString);

          if (!s3Instance) {
            throw new Error(`Keystone has no connection to S3 storage location ${storageString}`);
          }

          const { filesize } = await s3Instance.files.upload(stream, filename);
          return { storage: storageString, filesize, filename };
        }
        case 'local': {
          const writeStream = fs.createWriteStream(
            path.join(storageConfig.storagePath || DEFAULT_FILES_STORAGE_PATH, filename)
          );
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
            const { size: filesize } = await fs.stat(
              path.join(storageConfig.storagePath || DEFAULT_FILES_STORAGE_PATH, filename)
            );
            return { storage: storageString, filesize, filename };
          } catch (e) {
            await fs.remove(
              path.join(storageConfig.storagePath || DEFAULT_FILES_STORAGE_PATH, filename)
            );
            throw e;
          }
        }
      }

      throw new Error(
        `attempted to get URL for storage ${storageConfig}, however could not find the config for it`
      );
    },
    deleteAtSource: async (storageString, filename) => {
      let storageConfig = config.storage?.[storageString];

      switch (storageConfig?.kind) {
        case 's3': {
          const s3Instance = s3Assets().get(storageString);

          await s3Instance?.files.delete(filename);
          break;
        }
        case 'local': {
          // TODO why is this not narrowing
          await fs.remove(
            path.join(storageConfig.storagePath || DEFAULT_FILES_STORAGE_PATH, filename)
          );
        }
      }
    },
  };
}
