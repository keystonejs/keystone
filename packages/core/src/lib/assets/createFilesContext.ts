import crypto from 'crypto';
import filenamify from 'filenamify';

import slugify from '@sindresorhus/slugify';
import { KeystoneConfig, FilesContext } from '../../types';
import { localFileAssetsAPI } from './local';
import { s3FileAssetsAPI } from './s3';
import { FileAdapter } from './types';

const defaultTransformName = (filename: string) => {
  // Appends a UUID to the filename so that people can't brute-force guess stored filenames
  //
  // This regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphanumerical character before the end of the string
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z0-9]{0,10})?$/) as RegExpMatchArray;

  const id = crypto
    .randomBytes(24)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(12);

  // console.log(id, id.length, id.slice(12).length);
  const urlSafeName = filenamify(slugify(name), {
    maxLength: 100 - id.length - (ext ? ext.length : 0),
    replacement: '-',
  });
  if (ext) {
    return `${urlSafeName}-${id}${ext}`;
  }
  return `${urlSafeName}-${id}`;
};

export function createFilesContext(config: KeystoneConfig): FilesContext {
  const adaptersMap = new Map<string, FileAdapter>();

  for (const [storageKey, storageConfig] of Object.entries(config.storage || {})) {
    if (storageConfig.type === 'file') {
      adaptersMap.set(
        storageKey,
        storageConfig.kind === 'local'
          ? localFileAssetsAPI(storageConfig)
          : s3FileAssetsAPI(storageConfig)
      );
    }
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
        const storageConfig = config.storage![storageString];
        const { transformName = defaultTransformName } = storageConfig as typeof storageConfig & {
          type: 'file';
        };
        const filename = await transformName(originalFilename);

        const { filesize } = await adapter.upload(stream, filename);
        return { filename, filesize };
      },
      deleteAtSource: async filename => {
        await adapter.delete(filename);
      },
    };
  };
}
