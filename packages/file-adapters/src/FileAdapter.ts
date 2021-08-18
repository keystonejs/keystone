import { Readable } from 'stream';
import { FileData } from '@keystone-next/types';

abstract class FileAdapter {
  abstract getSrc(filename: string): Promise<string>;
  abstract getDataFromRef(ref: string): Promise<FileData>;
  abstract getDataFromStream(stream: Readable, originalFilename: string): Promise<FileData>;
  // Called when the adapter is being provisioned for use in the context
  // or when the admin ui is being built
  bootstrap(): Promise<void> {
    return Promise.resolve();
  }
}

export { FileAdapter };
