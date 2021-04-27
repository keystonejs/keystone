import path from 'path';
import { v4 as uuid } from 'uuid';
import slugify from '@sindresorhus/slugify';
import { FilesConfig, FilesContext } from '@keystone-next/types';
import fs from 'fs-extra';
import { fromBuffer } from 'file-type';

import { parseFileRef } from '@keystone-next/utils-legacy';

const DEFAULT_BASE_URL = '/files';
const DEFAULT_STORAGE_PATH = './public/files';
const DEFAULT_MAX_SIZE = 1024 * 1024 * 10; // 10mb
const isValidFileSize = (fileSize: number, maxSize: number) => fileSize <= maxSize;

const generateSafeFilename = (filename: string) => {
  //   /*
  //     This regex lazily matches for any characters that aren't a new line
  //     it then optionally matches the last instance of a "." symbol
  //     followed by any alphabetical character before the end of the string
  //    */
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z]+)?$/) as RegExpMatchArray;

  const id = uuid();
  const urlSafeName = slugify(name).toLowerCase();
  if (ext) {
    return `${urlSafeName}_${id}${ext}`;
  }
  return `${urlSafeName}_${uuid()}`;
};

const getFileMetadataFromBuffer = async (buffer: Buffer) => {
  const filesize = buffer.length;
  const fileType = fromBuffer(buffer);
  if (!fileType) {
    throw new Error('File type not found');
  }

  return { filesize };
};

export function createFilesContext(config?: FilesConfig): FilesContext | undefined {
  if (!config) {
    return;
  }

  const { maxSize = DEFAULT_MAX_SIZE } = config || {}; // default to 10mb

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
      const buffer = await fs.readFile(path.join(storagePath, `${fileRef.filename}`));
      const metadata = await getFileMetadataFromBuffer(buffer);

      return { ...fileRef, ...metadata };
    },
    getDataFromStream: async (stream, filename) => {
      const { upload: mode } = config;
      const chunks = [];

      for await (let chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const metadata = await getFileMetadataFromBuffer(buffer);
      // name conflict strategy function goes here.
      // const validFilename = resolveName({ name: filename, storagePath });
      if (!isValidFileSize(buffer.length, maxSize)) {
        throw new Error(`Filesize of ${buffer.length} exceeds max size of ${maxSize}`);
      }

      const pseudoSafeFilename = generateSafeFilename(filename);
      await fs.writeFile(path.join(storagePath, pseudoSafeFilename), buffer);

      return { mode, filename: pseudoSafeFilename, ...metadata };
    },
  };
}
