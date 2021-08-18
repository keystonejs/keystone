import { Readable } from 'stream';
import { FileData, ImageExtension, ImageData } from '@keystone-next/types';

abstract class FileAdapter {
  abstract getSrc(filename: string): Promise<string>;
  abstract getDataFromRef(ref: string): Promise<FileData>;
  abstract getDataFromStream(stream: Readable, originalFilename: string): Promise<FileData>;
}

abstract class ImageAdapter {
  abstract getSrc(id: string, extension: ImageExtension): Promise<string>;
  abstract getDataFromRef(ref: string): Promise<ImageData>;
  abstract getDataFromStream(stream: Readable): Promise<ImageData>;
}

export { FileAdapter, ImageAdapter };
