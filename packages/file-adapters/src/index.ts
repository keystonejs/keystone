import { Readable } from 'stream';
import { FileData } from '@keystone-next/types';

abstract class FileAdapter {
  abstract getSrc(filename: string): Promise<string>;
  abstract getDataFromRef(ref: string): Promise<FileData>;
  abstract getDataFromStream(stream: Readable, originalFilename: string): Promise<FileData>;
}

export { FileAdapter };
