import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream';
import filenamify from 'filenamify';
import { KeystoneConfig, FilesContext, AssetMode } from '@keystone-next/types';
import fs from 'fs-extra';

import slugify from '@sindresorhus/slugify';
import {
  buildKeystoneCloudFileSrc,
  uploadFileToKeystoneCloud,
  getFileFromKeystoneCloud,
} from '../keystone-cloud/assets';

const DEFAULT_BASE_URL = '/files';
const DEFAULT_STORAGE_PATH = './public/files';

const FILEREGEX = /^(local|keystone-cloud):file:([^\\\/:\n]+)/;

export const parseFileRef = (ref: string) => {
  const match = ref.match(FILEREGEX);
  if (match) {
    const [, mode, filename] = match;
    return {
      mode: mode as AssetMode,
      filename: filename as string,
    };
  }
  return undefined;
};

const isLocalAsset = (mode: AssetMode) => mode === 'local';
const isKeystoneCloudAsset = (mode: AssetMode) => mode === 'keystone-cloud';

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

export function createFilesContext(config: KeystoneConfig): FilesContext | undefined {
  if (!config.files) {
    return;
  }

  const { files, experimental } = config;
  const { baseUrl = DEFAULT_BASE_URL, storagePath = DEFAULT_STORAGE_PATH } = files.local || {};
  const {
    apiKey = '',
    graphqlApiEndpoint = '',
    restApiEndpoint = '',
  } = experimental?.keystoneCloud || {};

  if (isLocalAsset(files.upload)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return {
    getSrc: async (mode, filename) => {
      if (isKeystoneCloudAsset(mode)) {
        return await buildKeystoneCloudFileSrc({ apiKey, graphqlApiEndpoint, filename });
      }

      return `${baseUrl}/${filename}`;
    },
    getDataFromRef: async (ref: string) => {
      const fileRef = parseFileRef(ref);

      if (!fileRef) {
        throw new Error('Invalid file reference');
      }

      const { mode, filename } = fileRef;

      if (isKeystoneCloudAsset(mode)) {
        const { filesize } = await getFileFromKeystoneCloud({
          apiKey,
          filename,
          restApiEndpoint,
        });

        return { filesize, ...fileRef };
      }

      const { size: filesize } = await fs.stat(path.join(storagePath, fileRef.filename));

      return { filesize, ...fileRef };
    },
    getDataFromStream: async (stream, originalFilename) => {
      const { upload: mode } = files;
      const filename = generateSafeFilename(originalFilename, files.transformFilename);

      if (isKeystoneCloudAsset(mode)) {
        const { filesize } = await uploadFileToKeystoneCloud({
          apiKey,
          stream,
          filename,
          restApiEndpoint,
        });

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
