import path from 'path';
import { FilesConfig, FilesContext } from '@keystone-next/types';
import fs from 'fs-extra';
import { fromBuffer } from 'file-type';

import { parseFileRef } from '@keystone-next/utils-legacy';

const DEFAULT_BASE_URL = '/files';
const DEFAULT_STORAGE_PATH = './public/files';

const resolveName = ({
  name,
  index = 0,
  storagePath,
}: {
  name: string;
  index?: number;
  storagePath: string;
}): string => {
  const constructedName = index ? `${name}_${index}` : name;
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
        throw new Error('Invalid image reference');
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

      await fs.writeFile(path.join(storagePath, `${validFilename}`), buffer);

      return { mode, name: validFilename, ...metadata };
    },
  };
}
