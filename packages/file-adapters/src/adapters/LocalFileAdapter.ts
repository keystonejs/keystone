import path from 'path';
import { Readable, pipeline } from 'stream';
import { FileData } from '@keystone-next/types';
import { parseFileRef } from '@keystone-next/utils';

import fs from 'fs-extra';
import { FileAdapter } from '../FileAdapter';
import { generateSafeFilename } from '../utils';

export type LocalFileAdapterConfig = {
  baseUrl?: string;
  storagePath?: string;
  transformFilename?: (str: string) => string;
};

const DEFAULT_BASE_URL = '/files';
const DEFAULT_STORAGE_PATH = './public/files';

export class LocalFileAdapter extends FileAdapter {
  private baseUrl: string;
  private storagePath: string;
  private transformFilename?: (str: string) => string;
  constructor(config: LocalFileAdapterConfig = {}) {
    super();
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.storagePath = config.storagePath || DEFAULT_STORAGE_PATH;
    this.transformFilename = config.transformFilename;

    fs.mkdirSync(this.storagePath, { recursive: true });
  }
  getSrc(filename: string): Promise<string> {
    return Promise.resolve(`${this.baseUrl}/${filename}`);
  }
  async getDataFromRef(ref: string): Promise<FileData> {
    const fileRef = parseFileRef(ref);

    if (!fileRef) {
      throw new Error('Invalid file reference');
    }

    const { filename } = fileRef;
    const { size: filesize } = await fs.stat(path.join(this.storagePath, filename));

    return { filesize, ...fileRef };
  }
  async getDataFromStream(stream: Readable, originalFilename: string): Promise<FileData> {
    const filename = generateSafeFilename(originalFilename, this.transformFilename);

    const writeStream = fs.createWriteStream(path.join(this.storagePath, filename));
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
      const { size: filesize } = await fs.stat(path.join(this.storagePath, filename));
      return { filesize, filename };
    } catch (e) {
      await fs.remove(path.join(this.storagePath, filename));
      throw e;
    }
  }
  override bootstrap() {
    return fs.mkdir(this.storagePath, { recursive: true });
  }
}
