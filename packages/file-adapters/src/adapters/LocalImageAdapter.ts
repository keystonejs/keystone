import path from 'path';
import { Readable } from 'stream';
import fs from 'fs-extra';
import { v4 as uuid } from 'uuid';
import { ImageExtension, ImageData } from '@keystone-next/types';
import { parseImageRef } from '@keystone-next/utils';
import { ImageAdapter } from '..';
import { getImageMetadataFromBuffer } from '../utils';

export type LocalImageAdapterConfig = {
  baseUrl?: string;
  storagePath?: string;
};

const DEFAULT_BASE_URL = '/images';
const DEFAULT_STORAGE_PATH = './public/images';

export class LocalImageAdapter extends ImageAdapter {
  private baseUrl: string;
  private storagePath: string;
  constructor(config: LocalImageAdapterConfig = {}) {
    super();
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.storagePath = config.storagePath || DEFAULT_STORAGE_PATH;

    fs.mkdirSync(this.storagePath, { recursive: true });
  }
  getSrc(id: string, extension: ImageExtension) {
    const filename = `${id}.${extension}`;
    return Promise.resolve(`${this.baseUrl}/${filename}`);
  }
  async getDataFromRef(ref: string): Promise<ImageData> {
    const imageRef = parseImageRef(ref);

    if (!imageRef) {
      throw new Error('Invalid image reference');
    }

    const buffer = await fs.readFile(
      path.join(this.storagePath, `${imageRef.id}.${imageRef.extension}`)
    );
    const metadata = await getImageMetadataFromBuffer(buffer);

    return { ...imageRef, ...metadata };
  }
  async getDataFromStream(stream: Readable): Promise<ImageData> {
    const id = uuid();

    const chunks = [];

    for await (let chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const metadata = await getImageMetadataFromBuffer(buffer);

    await fs.writeFile(path.join(this.storagePath, `${id}.${metadata.extension}`), buffer);

    return { id, ...metadata };
  }
}
