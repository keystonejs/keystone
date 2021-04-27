import path from 'path';
import { FilesConfig, FilesContext } from '@keystone-next/types';
import fs from 'fs-extra';
import { fromBuffer } from 'file-type';

import { parseFileRef } from '@keystone-next/utils-legacy';

const DEFAULT_BASE_URL = '/files';
const DEFAULT_STORAGE_PATH = './public/files';
const DEFAULT_MAX_SIZE = 1024 * 1024 * 10; // 10mb
const isValidFileSize = (fileSize: number, maxSize: number) => fileSize <= maxSize;

const resolveName = ({
  name,
  index = 0,
  storagePath,
}: {
  name: string;
  index?: number;
  storagePath: string;
}): string => {
  /*
    This regex lazily matches for any characters that aren't a new line
    it then optionally matches the last instance of a "." symbol 
    followed by any alphabetical character before the end of the string
   */
  const [, fileName, ext] = name.match(/^([^:\n].*?)(\.[A-Za-z]+)?$/) as RegExpMatchArray;
  let constructedName = index ? `${fileName}_${index}.${ext}` : name;

  // if we're provided an index and an extension
  // append the index before the extension
  if (index && ext) {
    constructedName = `${fileName}_${index}${ext}`;
  } else if (index) {
    // otherwise append the idnex to the filename
    constructedName = `${fileName}_${index}`;
  } else {
    // otherwise just resolve to the original name
    constructedName = name;
  }

  if (!fs.existsSync(path.join(storagePath, constructedName))) {
    return constructedName;
  }
  return resolveName({ name, index: index + 1, storagePath });
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
    getSrc: (mode, name) => {
      const filename = `${name}`;
      return `${baseUrl}/${filename}`;
    },
    getDataFromRef: async (ref: string) => {
      const fileRef = parseFileRef(ref);
      if (!fileRef) {
        throw new Error('Invalid file reference');
      }
      const buffer = await fs.readFile(path.join(storagePath, `${fileRef.name}`));
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
      const validFilename = resolveName({ name: filename, storagePath });
      if (!isValidFileSize(buffer.length, maxSize)) {
        throw new Error(`Filesize of ${buffer.length} exceeds max size of ${maxSize}`);
      }

      return { mode, name: validFilename, ...metadata };
    },
  };
}
