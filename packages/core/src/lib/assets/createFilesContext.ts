import crypto from 'crypto';
import filenamify from 'filenamify';

import slugify from '@sindresorhus/slugify';
import { KeystoneConfig, FilesContext } from '../../types';
import { localFileAssetsAPI } from './local';
import { s3FileAssetsAPI } from './s3';
import { FileAdapter } from './types';

export const DEFAULT_BASE_FILE_URL = '/files';
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

export function createFilesContext(config: KeystoneConfig): FilesContext {
  const { storage } = config;

  const adaptersMap = new Map<string, FileAdapter>();
  for (const [storageKey, storageConfig] of Object.entries(storage || {})) {
    if (storageConfig.type !== 'file') break;
    adaptersMap.set(
      storageKey,
      storageConfig.kind === 'local'
        ? localFileAssetsAPI(storageConfig)
        : s3FileAssetsAPI(storageConfig)
    );
  }

  return (storageString: string) => {
    const adapter = adaptersMap.get(storageString);
    if (!adapter) {
      throw new Error(`No file assets API found for storage string "${storageString}"`);
    }

    return {
      getUrl: async filename => {
        return adapter.url(filename);
      },
      getDataFromStream: async (stream, originalFilename) => {
        const filename = generateSafeFilename(originalFilename);
        const { filesize } = await adapter.upload(stream, filename);
        return { filename, filesize };
      },
      deleteAtSource: async filename => {
        await adapter.delete(filename);
      },
    };
  };
}
