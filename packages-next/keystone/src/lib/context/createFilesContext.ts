import path from 'path';
import { v4 as uuid } from 'uuid';
import filenamify from 'filenamify';
import { FilesConfig, FilesContext } from '@keystone-next/types';
import fs from 'fs-extra';

import { parseFileRef } from '@keystone-next/utils-legacy';

const DEFAULT_BASE_URL = '/files';
const DEFAULT_STORAGE_PATH = './public/files';

const generateSafeFilename = (filename: string) => {
  // Appends a UUID to the filename so that people can't brute-force guess stored filenames
  //
  // This regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphabetical character before the end of the string
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z]+)?$/) as RegExpMatchArray;

  const id = uuid();
  const urlSafeName = filenamify(name, { replacement: '_' }).toLowerCase();
  if (ext) {
    return `${urlSafeName}_${id}${ext}`;
  }
  return `${urlSafeName}_${id}`;
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
      const { size: filesize } = await fs.stat(path.join(storagePath, `${fileRef.filename}`));
      return { filesize, ...fileRef };
    },
    getDataFromStream: async (stream, filename) => {
      const { upload: mode } = config;

      const safeFilename = generateSafeFilename(filename);
      const writeStream = fs.createWriteStream(path.join(storagePath, safeFilename));

      for await (let chunk of stream) {
        writeStream.write(chunk);
      }

      const { size: filesize } = await fs.stat(path.join(storagePath, safeFilename));
      return { mode, filename: safeFilename, filesize };
    },
  };
}
